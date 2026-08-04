import {
  DRAFT_COMMIT_STATUSES,
  type DraftPersistence,
} from "packages/products/src/socratic-draft/server/capabilities/drafting/ports/draft-persistence";
import {
  DRAFT_REVISION_SOURCES,
  EMPTY_DRAFTING_STATE,
  REVISION_PROPOSAL_STATES,
  type DraftRevisionSource,
  type DraftingState,
  type RevisionProposalScope,
} from "packages/products/src/socratic-draft/shared";

export const DRAFT_WRITE_STATUSES = {
  changed: "changed",
  conflict: "conflict",
  duplicate: "duplicate",
  notFound: "not_found",
  proposalNotActive: "proposal_not_active",
} as const;

export interface CreateDraftInput {
  conversationId: string;
  draftId: string;
  operationId: string;
  body: string;
  createdAt: string;
}

export interface AppendDraftRevisionInput {
  conversationId: string;
  operationId: string;
  expectedRevision: number;
  body: string;
  source: Exclude<DraftRevisionSource, "initial_composition">;
  proposalId?: string;
  restoredFromRevision?: number;
  createdAt: string;
}

export interface CreateRevisionProposalInput {
  conversationId: string;
  proposalId: string;
  operationId: string;
  baseDraftRevision: number;
  scope: RevisionProposalScope;
  originalStart: number;
  originalEnd: number;
  originalContent: string;
  userInstruction: string;
  intendedEffect: string;
  proposedContent: string;
  createdAt: string;
}

export interface ChangeDraftFormatInput {
  conversationId: string;
  operationId: string;
  expectedFormatRevision: number;
  format: string | null;
}

export type DraftWriteResult =
  | { status: typeof DRAFT_WRITE_STATUSES.changed; workspace: DraftingState }
  | { status: typeof DRAFT_WRITE_STATUSES.duplicate; workspace: DraftingState }
  | { status: typeof DRAFT_WRITE_STATUSES.conflict; workspace: DraftingState }
  | { status: typeof DRAFT_WRITE_STATUSES.notFound }
  | { status: typeof DRAFT_WRITE_STATUSES.proposalNotActive; workspace: DraftingState };

export interface DraftStore {
  getDraftingState(conversationId: string): Promise<DraftingState | null>;
  getCompletedDraftOperation(conversationId: string, operationId: string): Promise<DraftWriteResult | null>;
  deleteDraftingState(conversationId: string): Promise<void>;
  changeDraftFormat(input: ChangeDraftFormatInput): Promise<DraftWriteResult>;
  createDraft(input: CreateDraftInput): Promise<DraftWriteResult>;
  appendDraftRevision(input: AppendDraftRevisionInput): Promise<DraftWriteResult>;
  createRevisionProposal(input: CreateRevisionProposalInput): Promise<DraftWriteResult>;
  amendRevisionProposal(input: { conversationId: string; proposalId: string; operationId: string; expectedProposalRevision: number; intendedEffect: string; proposedContent: string; createdAt: string }): Promise<DraftWriteResult>;
  rejectRevisionProposal(input: { conversationId: string; proposalId: string; operationId: string; createdAt: string }): Promise<DraftWriteResult>;
  acceptRevisionProposal(input: { conversationId: string; proposalId: string; operationId: string; expectedDraftRevision: number; createdAt: string }): Promise<DraftWriteResult>;
}

export function createDraftStore(persistence: DraftPersistence): DraftStore {
  async function duplicate(
    conversationId: string,
    operationId: string,
  ): Promise<DraftWriteResult | null> {
    const workspace = await persistence.loadCompletedOperation(
      conversationId,
      operationId,
    );
    return workspace
      ? { status: DRAFT_WRITE_STATUSES.duplicate, workspace }
      : null;
  }

  async function commit(input: {
    conversationId: string;
    operationId: string;
    operationKind: string;
    current: DraftingState;
    next: DraftingState;
  }): Promise<DraftWriteResult> {
    const result = await persistence.commit({
      conversationId: input.conversationId,
      operationId: input.operationId,
      operationKind: input.operationKind,
      expectedFormatRevision: input.current.formatRevision,
      expectedDraftRevision: input.current.draft?.currentRevision ?? null,
      expectedProposalRevision: input.current.activeProposal?.currentProposalRevision ?? null,
      nextState: input.next,
    });
    if (result.status === DRAFT_COMMIT_STATUSES.notFound) return { status: DRAFT_WRITE_STATUSES.notFound };
    if (result.status === DRAFT_COMMIT_STATUSES.conflict) return { status: DRAFT_WRITE_STATUSES.conflict, workspace: result.workspace };
    if (result.status === DRAFT_COMMIT_STATUSES.duplicate) return { status: DRAFT_WRITE_STATUSES.duplicate, workspace: result.workspace };
    return { status: DRAFT_WRITE_STATUSES.changed, workspace: result.workspace };
  }

  return {
    getDraftingState: (conversationId) => persistence.load(conversationId),
    getCompletedDraftOperation: duplicate,
    deleteDraftingState: (conversationId) => persistence.delete(conversationId),

    async changeDraftFormat(input) {
      const prior = await duplicate(input.conversationId, input.operationId);
      if (prior) return prior;
      const current =
        (await persistence.load(input.conversationId)) ??
        (await persistence.initialize(input.conversationId));
      if (!current) return { status: DRAFT_WRITE_STATUSES.notFound };
      if (current.formatRevision !== input.expectedFormatRevision) {
        return { status: DRAFT_WRITE_STATUSES.conflict, workspace: current };
      }
      if (current.format === input.format) {
        return { status: DRAFT_WRITE_STATUSES.duplicate, workspace: current };
      }
      const next: DraftingState = {
        ...current,
        format: input.format,
        formatRevision: current.formatRevision + 1,
      };
      return commit({
        conversationId: input.conversationId,
        operationId: input.operationId,
        operationKind: "change_format",
        current,
        next,
      });
    },

    async createDraft(input) {
      const prior = await duplicate(input.conversationId, input.operationId);
      if (prior) return prior;
      const current =
        (await persistence.load(input.conversationId)) ??
        (await persistence.initialize(input.conversationId));
      if (!current) return { status: DRAFT_WRITE_STATUSES.notFound };
      if (current.draft) return { status: DRAFT_WRITE_STATUSES.conflict, workspace: current };
      const next: DraftingState = {
        ...current,
        draft: { id: input.draftId, conversationId: input.conversationId, body: input.body, currentRevision: 1, createdAt: input.createdAt, updatedAt: input.createdAt },
        revisions: [{ revision: 1, body: input.body, source: DRAFT_REVISION_SOURCES.initialComposition, createdAt: input.createdAt, proposalId: null, restoredFromRevision: null }],
        activeProposal: null,
      };
      return commit({ conversationId: input.conversationId, operationId: input.operationId, operationKind: "compose", current, next });
    },

    async appendDraftRevision(input) {
      const prior = await duplicate(input.conversationId, input.operationId);
      if (prior) return prior;
      const current = await persistence.load(input.conversationId);
      if (!current?.draft) return { status: DRAFT_WRITE_STATUSES.notFound };
      if (current.draft.currentRevision !== input.expectedRevision) return { status: DRAFT_WRITE_STATUSES.conflict, workspace: current };
      if (current.draft.body === input.body) return { status: DRAFT_WRITE_STATUSES.duplicate, workspace: current };
      const revision = input.expectedRevision + 1;
      const next: DraftingState = {
        ...current,
        draft: { ...current.draft, body: input.body, currentRevision: revision, updatedAt: input.createdAt },
        revisions: [...current.revisions, { revision, body: input.body, source: input.source, createdAt: input.createdAt, proposalId: input.proposalId ?? null, restoredFromRevision: input.restoredFromRevision ?? null }],
      };
      return commit({ conversationId: input.conversationId, operationId: input.operationId, operationKind: input.source, current, next });
    },

    async createRevisionProposal(input) {
      const prior = await duplicate(input.conversationId, input.operationId);
      if (prior) return prior;
      const current = await persistence.load(input.conversationId);
      if (!current?.draft) return { status: DRAFT_WRITE_STATUSES.notFound };
      if (current.draft.currentRevision !== input.baseDraftRevision) return { status: DRAFT_WRITE_STATUSES.conflict, workspace: current };
      if (current.activeProposal?.state === REVISION_PROPOSAL_STATES.active) {
        return { status: DRAFT_WRITE_STATUSES.conflict, workspace: current };
      }
      const next: DraftingState = {
        ...current,
        activeProposal: {
          id: input.proposalId, draftId: current.draft.id, baseDraftRevision: input.baseDraftRevision,
          scope: input.scope, originalStart: input.originalStart, originalEnd: input.originalEnd,
          originalContent: input.originalContent, userInstruction: input.userInstruction,
          state: REVISION_PROPOSAL_STATES.active, currentProposalRevision: 1,
          versions: [{ revision: 1, proposedContent: input.proposedContent, intendedEffect: input.intendedEffect, createdAt: input.createdAt }],
          createdAt: input.createdAt, resolvedAt: null,
        },
      };
      return commit({ conversationId: input.conversationId, operationId: input.operationId, operationKind: "create_proposal", current, next });
    },

    async amendRevisionProposal(input) {
      const prior = await duplicate(input.conversationId, input.operationId);
      if (prior) return prior;
      const current = await persistence.load(input.conversationId);
      const proposal = current?.activeProposal;
      if (!current?.draft || !proposal || proposal.id !== input.proposalId) return { status: DRAFT_WRITE_STATUSES.notFound };
      if (proposal.state !== REVISION_PROPOSAL_STATES.active || proposal.currentProposalRevision !== input.expectedProposalRevision) return { status: DRAFT_WRITE_STATUSES.proposalNotActive, workspace: current };
      const revision = input.expectedProposalRevision + 1;
      const next: DraftingState = { ...current, activeProposal: { ...proposal, currentProposalRevision: revision, versions: [...proposal.versions, { revision, proposedContent: input.proposedContent, intendedEffect: input.intendedEffect, createdAt: input.createdAt }] } };
      return commit({ conversationId: input.conversationId, operationId: input.operationId, operationKind: "amend_proposal", current, next });
    },

    async rejectRevisionProposal(input) {
      const prior = await duplicate(input.conversationId, input.operationId);
      if (prior) return prior;
      const current = await persistence.load(input.conversationId);
      const proposal = current?.activeProposal;
      if (!current?.draft || !proposal || proposal.id !== input.proposalId) return { status: DRAFT_WRITE_STATUSES.notFound };
      if (
        proposal.state !== REVISION_PROPOSAL_STATES.active &&
        proposal.state !== REVISION_PROPOSAL_STATES.stale
      ) return { status: DRAFT_WRITE_STATUSES.proposalNotActive, workspace: current };
      const next: DraftingState = { ...current, activeProposal: { ...proposal, state: REVISION_PROPOSAL_STATES.rejected, resolvedAt: input.createdAt } };
      return commit({ conversationId: input.conversationId, operationId: input.operationId, operationKind: "reject_proposal", current, next });
    },

    async acceptRevisionProposal(input) {
      const prior = await duplicate(input.conversationId, input.operationId);
      if (prior) return prior;
      const current = await persistence.load(input.conversationId);
      const proposal = current?.activeProposal;
      if (!current?.draft || !proposal || proposal.id !== input.proposalId) return { status: DRAFT_WRITE_STATUSES.notFound };
      if (proposal.state !== REVISION_PROPOSAL_STATES.active) return { status: DRAFT_WRITE_STATUSES.proposalNotActive, workspace: current };
      if (current.draft.currentRevision !== input.expectedDraftRevision || proposal.baseDraftRevision !== input.expectedDraftRevision) {
        const stale: DraftingState = { ...current, activeProposal: { ...proposal, state: REVISION_PROPOSAL_STATES.stale } };
        const retained = await commit({ conversationId: input.conversationId, operationId: input.operationId, operationKind: "stale_proposal", current, next: stale });
        return "workspace" in retained ? { status: DRAFT_WRITE_STATUSES.conflict, workspace: retained.workspace } : retained;
      }
      const version = proposal.versions.find((item) => item.revision === proposal.currentProposalRevision);
      if (!version) return { status: DRAFT_WRITE_STATUSES.notFound };
      const body = proposal.scope === "whole_draft"
        ? version.proposedContent
        : current.draft.body.slice(0, proposal.originalStart) + version.proposedContent + current.draft.body.slice(proposal.originalEnd);
      const revision = current.draft.currentRevision + 1;
      const next: DraftingState = {
        ...current,
        draft: { ...current.draft, body, currentRevision: revision, updatedAt: input.createdAt },
        revisions: [...current.revisions, { revision, body, source: DRAFT_REVISION_SOURCES.acceptedProposal, createdAt: input.createdAt, proposalId: proposal.id, restoredFromRevision: null }],
        activeProposal: { ...proposal, state: REVISION_PROPOSAL_STATES.accepted, resolvedAt: input.createdAt },
      };
      return commit({ conversationId: input.conversationId, operationId: input.operationId, operationKind: "accept_proposal", current, next });
    },
  };
}
