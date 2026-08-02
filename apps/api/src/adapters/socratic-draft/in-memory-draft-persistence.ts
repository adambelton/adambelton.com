import {
  DRAFT_COMMIT_STATUSES,
  type DraftCommitInput,
  type DraftPersistence,
} from "packages/products/src/socratic-draft/server/draft";
import {
  EMPTY_DRAFT_WORKSPACE,
  type DraftWorkspace,
} from "packages/products/src/socratic-draft/shared";

export interface InMemoryDraftPersistence extends DraftPersistence {
  registerWorkspace(conversationId: string): void;
}

export function createInMemoryDraftPersistence(): InMemoryDraftPersistence {
  const workspaces = new Map<string, DraftWorkspace>();
  const operations = new Map<string, Set<string>>();

  return {
    registerWorkspace(conversationId) {
      if (!workspaces.has(conversationId)) {
        workspaces.set(
          conversationId,
          structuredClone(EMPTY_DRAFT_WORKSPACE),
        );
      }
    },

    async initialize(conversationId) {
      this.registerWorkspace(conversationId);
      return this.load(conversationId);
    },

    async loadCompletedOperation(conversationId, operationId) {
      return operations.get(conversationId)?.has(operationId)
        ? this.load(conversationId)
        : null;
    },

    async load(conversationId) {
      const workspace = workspaces.get(conversationId);
      return workspace ? structuredClone(workspace) : null;
    },

    async commit(input: DraftCommitInput) {
      const current = workspaces.get(input.conversationId);
      if (!current) {
        return { status: DRAFT_COMMIT_STATUSES.notFound };
      }

      const completed = operations.get(input.conversationId);
      if (completed?.has(input.operationId)) {
        return {
          status: DRAFT_COMMIT_STATUSES.duplicate,
          workspace: structuredClone(current),
        };
      }

      if (
        (current.draft?.currentRevision ?? null) !==
          input.expectedDraftRevision ||
        (current.activeProposal?.currentProposalRevision ?? null) !==
          input.expectedProposalRevision
      ) {
        return {
          status: DRAFT_COMMIT_STATUSES.conflict,
          workspace: structuredClone(current),
        };
      }

      const next = structuredClone(input.nextWorkspace);
      workspaces.set(input.conversationId, next);
      const nextCompleted = completed ?? new Set<string>();
      nextCompleted.add(input.operationId);
      operations.set(input.conversationId, nextCompleted);

      return {
        status: DRAFT_COMMIT_STATUSES.committed,
        workspace: structuredClone(next),
      };
    },

    async delete(conversationId) {
      workspaces.delete(conversationId);
      operations.delete(conversationId);
    },
  };
}
