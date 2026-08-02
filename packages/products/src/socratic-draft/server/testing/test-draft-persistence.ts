import {
  DRAFT_COMMIT_STATUSES,
  type DraftCommitInput,
  type DraftPersistence,
} from "packages/products/src/socratic-draft/server/draft";
import { EMPTY_DRAFT_WORKSPACE, type DraftWorkspace } from "packages/products/src/socratic-draft/shared";

export class TestDraftPersistence implements DraftPersistence {
  private readonly workspaces = new Map<string, DraftWorkspace>();
  private readonly operations = new Map<string, Set<string>>();

  registerWorkspace(conversationId: string) {
    this.workspaces.set(conversationId, structuredClone(EMPTY_DRAFT_WORKSPACE));
  }

  async initialize(conversationId: string) {
    this.registerWorkspace(conversationId);
    return this.load(conversationId);
  }

  async loadCompletedOperation(conversationId: string, operationId: string) {
    return this.operations.get(conversationId)?.has(operationId)
      ? this.load(conversationId)
      : null;
  }

  async load(conversationId: string) {
    const workspace = this.workspaces.get(conversationId);
    return workspace ? structuredClone(workspace) : null;
  }

  async commit(input: DraftCommitInput) {
    const current = this.workspaces.get(input.conversationId);
    if (!current) return { status: DRAFT_COMMIT_STATUSES.notFound } as const;
    const completed = this.operations.get(input.conversationId);
    if (completed?.has(input.operationId)) {
      return { status: DRAFT_COMMIT_STATUSES.duplicate, workspace: structuredClone(current) } as const;
    }
    if (
      (current.draft?.currentRevision ?? null) !== input.expectedDraftRevision ||
      (current.activeProposal?.currentProposalRevision ?? null) !== input.expectedProposalRevision
    ) {
      return { status: DRAFT_COMMIT_STATUSES.conflict, workspace: structuredClone(current) } as const;
    }
    const next = structuredClone(input.nextWorkspace);
    this.workspaces.set(input.conversationId, next);
    const operations = completed ?? new Set<string>();
    operations.add(input.operationId);
    this.operations.set(input.conversationId, operations);
    return { status: DRAFT_COMMIT_STATUSES.committed, workspace: structuredClone(next) } as const;
  }

  async delete(conversationId: string) {
    this.workspaces.delete(conversationId);
    this.operations.delete(conversationId);
  }
}
