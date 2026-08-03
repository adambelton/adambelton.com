import type { DraftingState } from "packages/products/src/socratic-draft/shared";

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
  expectedFormatRevision: number;
  expectedDraftRevision: number | null;
  expectedProposalRevision: number | null;
  nextState: DraftingState;
}

export type DraftCommitResult =
  | { status: typeof DRAFT_COMMIT_STATUSES.committed; workspace: DraftingState }
  | { status: typeof DRAFT_COMMIT_STATUSES.duplicate; workspace: DraftingState }
  | { status: typeof DRAFT_COMMIT_STATUSES.conflict; workspace: DraftingState }
  | { status: typeof DRAFT_COMMIT_STATUSES.notFound };

export interface DraftPersistence {
  initialize(conversationId: string): Promise<DraftingState | null>;
  loadCompletedOperation(
    conversationId: string,
    operationId: string,
  ): Promise<DraftingState | null>;
  load(conversationId: string): Promise<DraftingState | null>;
  commit(input: DraftCommitInput): Promise<DraftCommitResult>;
  delete(conversationId: string): Promise<void>;
}
