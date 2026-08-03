import type { DraftWorkspace } from "packages/products/src/socratic-draft/shared";

export const DRAFT_COMMIT_STATUSES = {
  committed: "committed",
  conflict: "conflict",
  duplicate: "duplicate",
  notFound: "not_found",
} as const;

export interface DraftCommitInput {
  conversationId: string;
  operationId: string;
  operationKind: string;
  expectedDraftRevision: number | null;
  expectedProposalRevision: number | null;
  nextWorkspace: DraftWorkspace;
}

export type DraftCommitResult =
  | { status: typeof DRAFT_COMMIT_STATUSES.committed; workspace: DraftWorkspace }
  | { status: typeof DRAFT_COMMIT_STATUSES.duplicate; workspace: DraftWorkspace }
  | { status: typeof DRAFT_COMMIT_STATUSES.conflict; workspace: DraftWorkspace }
  | { status: typeof DRAFT_COMMIT_STATUSES.notFound };

export interface DraftPersistence {
  initialize(conversationId: string): Promise<DraftWorkspace | null>;
  loadCompletedOperation(
    conversationId: string,
    operationId: string,
  ): Promise<DraftWorkspace | null>;
  load(conversationId: string): Promise<DraftWorkspace | null>;
  commit(input: DraftCommitInput): Promise<DraftCommitResult>;
  delete(conversationId: string): Promise<void>;
}
