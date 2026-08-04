import type {
  DraftCompositionModel,
  RevisionProposalModel,
} from "packages/products/src/socratic-draft/server/capabilities/drafting/ports/draft-model";
import { createDraftCompositionIdeaMaterial } from "packages/products/src/socratic-draft/server/capabilities/drafting/ports/draft-model";
import {
  DRAFT_WRITE_STATUSES,
  type DraftStore,
  type DraftWriteResult,
} from "packages/products/src/socratic-draft/server/capabilities/drafting/draft-store";
import { deriveDraftChange } from "packages/products/src/socratic-draft/server/capabilities/drafting/draft-change";
import {
  canonicalDraftMarkdown,
  InvalidSemanticMarkdownError,
  normalizeSemanticMarkdown,
} from "packages/products/src/socratic-draft/server/capabilities/drafting/semantic-markdown";
import {
  DRAFT_CONTENT_FORMATS,
  DRAFT_FORMAT_MAX_LENGTH,
  DRAFT_REVISION_SOURCES,
  SEMANTIC_DRAFT_SCHEMA_VERSION,
  REVISION_PROPOSAL_SCOPES,
  type DraftSelection,
  type Idea,
  type RevisionProposalScope,
} from "packages/products/src/socratic-draft/shared";

export class InvalidDraftOperationError extends Error {}

export class DraftService {
  constructor(
    private readonly store: DraftStore,
    private readonly compositionModel: DraftCompositionModel,
    private readonly proposalModel: RevisionProposalModel,
    private readonly now: () => Date = () => new Date(),
  ) {}

  load(conversationId: string) {
    return this.store.getDraftingState(conversationId);
  }

  changeFormat(input: {
    conversationId: string;
    operationId: string;
    expectedFormatRevision: number;
    format: string | null;
  }) {
    const format = normalizeDraftFormat(input.format);
    return this.store.changeDraftFormat({ ...input, format });
  }

  async compose(input: {
    conversationId: string;
    operationId: string;
    selectedIdeaIds: string[];
    ideas: Idea[];
    relevantConversationLanguage: string[];
    instruction: string;
  }): Promise<DraftWriteResult> {
    const completed = await this.store.getCompletedDraftOperation(
      input.conversationId,
      input.operationId,
    );
    if (completed) return completed;
    const workspace = await this.store.getDraftingState(input.conversationId);
    if (workspace?.draft) {
      return { status: DRAFT_WRITE_STATUSES.conflict, workspace };
    }
    const selected = selectIdeas(input.ideas, input.selectedIdeaIds);
    if (selected.length === 0) {
      throw new InvalidDraftOperationError("Select at least one idea to compose.");
    }
    const generated = await this.compositionModel.compose({
      selectedIdeas: createDraftCompositionIdeaMaterial(selected),
      relevantConversationLanguage: input.relevantConversationLanguage,
      instruction: input.instruction,
    });
    const body = requireSemanticBody(generated.body);
    return this.store.createDraft({
      conversationId: input.conversationId,
      draftId: globalThis.crypto.randomUUID(),
      operationId: input.operationId,
      body,
      contentFormat: DRAFT_CONTENT_FORMATS.semanticMarkdown,
      schemaVersion: SEMANTIC_DRAFT_SCHEMA_VERSION,
      createdAt: this.now().toISOString(),
    });
  }

  async save(input: {
    conversationId: string;
    operationId: string;
    expectedRevision: number;
    body: string;
  }) {
    const result = await this.store.appendDraftRevision({
      ...input,
      body: requireSemanticBody(input.body),
      contentFormat: DRAFT_CONTENT_FORMATS.semanticMarkdown,
      schemaVersion: SEMANTIC_DRAFT_SCHEMA_VERSION,
      source: DRAFT_REVISION_SOURCES.manualEdit,
      createdAt: this.now().toISOString(),
    });
    return withDraftChange(result, input.expectedRevision);
  }

  async restore(input: {
    conversationId: string;
    operationId: string;
    expectedRevision: number;
    restoreRevision: number;
  }) {
    const completed = await this.store.getCompletedDraftOperation(
      input.conversationId,
      input.operationId,
    );
    if (completed) return withDraftChange(completed, input.expectedRevision);
    const workspace = await this.store.getDraftingState(input.conversationId);
    const restored = workspace?.revisions.find(
      (revision) => revision.revision === input.restoreRevision,
    );
    if (!workspace?.draft || !restored) {
      return { status: DRAFT_WRITE_STATUSES.notFound, change: null } as const;
    }
    const result = await this.store.appendDraftRevision({
      conversationId: input.conversationId,
      operationId: input.operationId,
      expectedRevision: input.expectedRevision,
      body: canonicalDraftMarkdown(restored.body, restored.contentFormat),
      contentFormat: DRAFT_CONTENT_FORMATS.semanticMarkdown,
      schemaVersion: SEMANTIC_DRAFT_SCHEMA_VERSION,
      source: DRAFT_REVISION_SOURCES.restoration,
      restoredFromRevision: restored.revision,
      createdAt: this.now().toISOString(),
    });
    return withDraftChange(result, input.expectedRevision);
  }

  async propose(input: {
    conversationId: string;
    operationId: string;
    expectedDraftRevision: number;
    scope: RevisionProposalScope;
    selection?: DraftSelection;
    userInstruction: string;
  }) {
    const workspace = await this.store.getDraftingState(input.conversationId);
    if (!workspace?.draft) return { status: DRAFT_WRITE_STATUSES.notFound } as const;
    if (workspace.draft.currentRevision !== input.expectedDraftRevision) {
      return { status: DRAFT_WRITE_STATUSES.conflict, workspace } as const;
    }
    if (workspace.activeProposal?.state === "active") {
      return { status: DRAFT_WRITE_STATUSES.conflict, workspace } as const;
    }
    const canonicalBody = canonicalDraftMarkdown(
      workspace.draft.body,
      workspace.draft.contentFormat,
    );
    const range = proposalRange(
      canonicalBody,
      input.expectedDraftRevision,
      input.scope,
      input.selection,
    );
    const generated = await this.proposalModel.propose({
      draftBody: canonicalBody,
      scope: input.scope,
      originalContent: range.originalContent,
      userInstruction: input.userInstruction,
    });
    return this.store.createRevisionProposal({
      conversationId: input.conversationId,
      proposalId: globalThis.crypto.randomUUID(),
      operationId: input.operationId,
      baseDraftRevision: input.expectedDraftRevision,
      scope: input.scope,
      originalStart: range.start,
      originalEnd: range.end,
      originalContent: range.originalContent,
      userInstruction: input.userInstruction.trim(),
      intendedEffect: generated.intendedEffect.trim(),
      proposedContent: requireSemanticReplacement(canonicalBody, range, generated.proposedContent),
      createdAt: this.now().toISOString(),
    });
  }

  async amend(input: {
    conversationId: string;
    proposalId: string;
    operationId: string;
    expectedProposalRevision: number;
    userInstruction: string;
  }) {
    const completed = await this.store.getCompletedDraftOperation(
      input.conversationId,
      input.operationId,
    );
    if (completed) return completed;
    const workspace = await this.store.getDraftingState(input.conversationId);
    const proposal = workspace?.activeProposal;
    if (!workspace?.draft || !proposal || proposal.id !== input.proposalId) {
      return { status: DRAFT_WRITE_STATUSES.notFound } as const;
    }
    if (
      proposal.state !== "active" ||
      proposal.currentProposalRevision !== input.expectedProposalRevision
    ) {
      return { status: DRAFT_WRITE_STATUSES.proposalNotActive, workspace } as const;
    }
    const canonicalBody = canonicalDraftMarkdown(
      workspace.draft.body,
      workspace.draft.contentFormat,
    );
    const generated = await this.proposalModel.propose({
      draftBody: canonicalBody,
      scope: proposal.scope,
      originalContent: proposal.originalContent,
      userInstruction: input.userInstruction,
    });
    return this.store.amendRevisionProposal({
      conversationId: input.conversationId,
      proposalId: input.proposalId,
      operationId: input.operationId,
      expectedProposalRevision: input.expectedProposalRevision,
      intendedEffect: generated.intendedEffect.trim(),
      proposedContent: requireSemanticReplacement(canonicalBody, {
        start: proposal.originalStart,
        end: proposal.originalEnd,
      }, generated.proposedContent),
      createdAt: this.now().toISOString(),
    });
  }

  accept(input: {
    conversationId: string;
    proposalId: string;
    operationId: string;
    expectedDraftRevision: number;
  }) {
    return this.store.acceptRevisionProposal({
      ...input,
      createdAt: this.now().toISOString(),
    });
  }

  reject(input: {
    conversationId: string;
    proposalId: string;
    operationId: string;
  }) {
    return this.store.rejectRevisionProposal({
      ...input,
      createdAt: this.now().toISOString(),
    });
  }
}

function withDraftChange(result: DraftWriteResult, expectedRevision: number) {
  if (!("workspace" in result)) return { ...result, change: null };
  const previous = result.workspace.revisions.find(
    (revision) => revision.revision === expectedRevision,
  );
  const committed = result.workspace.revisions.find(
    (revision) => revision.revision === expectedRevision + 1,
  );
  return {
    ...result,
    change: previous && committed ? deriveDraftChange(previous, committed) : null,
  };
}

function selectIdeas(ideas: Idea[], selectedIdeaIds: string[]) {
  const ids = new Set(selectedIdeaIds);
  return ideas.filter((idea) => ids.has(idea.id));
}

function requireSemanticBody(body: string) {
  try {
    return normalizeSemanticMarkdown(body);
  } catch (error) {
    if (error instanceof InvalidSemanticMarkdownError) {
      throw new InvalidDraftOperationError(error.message);
    }
    throw error;
  }
}

function requireSemanticReplacement(
  canonicalBody: string,
  range: { start: number; end: number },
  replacement: string,
) {
  if (range.start === 0 && range.end === canonicalBody.length) {
    return requireSemanticBody(replacement);
  }
  const candidate = canonicalBody.slice(0, range.start) + replacement + canonicalBody.slice(range.end);
  const normalized = requireSemanticBody(candidate);
  const prefix = canonicalBody.slice(0, range.start);
  const suffix = canonicalBody.slice(range.end);
  if (!normalized.startsWith(prefix) || !normalized.endsWith(suffix)) {
    throw new InvalidDraftOperationError(
      "The proposed passage does not preserve the surrounding document structure.",
    );
  }
  return normalized.slice(prefix.length, normalized.length - suffix.length);
}

function normalizeDraftFormat(format: string | null) {
  if (format === null) return null;
  const value = format.trim();
  if (!value) return null;
  if (value.length > DRAFT_FORMAT_MAX_LENGTH) {
    throw new InvalidDraftOperationError(
      `Draft Format must be ${DRAFT_FORMAT_MAX_LENGTH} characters or fewer.`,
    );
  }
  return value;
}

function proposalRange(
  body: string,
  expectedDraftRevision: number,
  scope: RevisionProposalScope,
  selection?: DraftSelection,
) {
  if (scope === REVISION_PROPOSAL_SCOPES.wholeDraft) {
    return { start: 0, end: body.length, originalContent: body };
  }
  if (
    !selection ||
    selection.baseDraftRevision !== expectedDraftRevision ||
    selection.start < 0 ||
    selection.end <= selection.start ||
    body.slice(selection.start, selection.end) !== selection.selectedText
  ) {
    throw new InvalidDraftOperationError("The selected draft passage is stale or invalid.");
  }
  return {
    start: selection.start,
    end: selection.end,
    originalContent: selection.selectedText,
  };
}
