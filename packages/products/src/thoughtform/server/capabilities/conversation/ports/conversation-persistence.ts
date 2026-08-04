import type {
  ConversationMessage,
  IdeaMap,
} from "packages/products/src/thoughtform/shared";

export interface ConversationPersistenceSnapshot {
  id: string;
  messages: ConversationMessage[];
  ideaMap: IdeaMap;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export const CONVERSATION_COMMIT_STATUSES = {
  committed: "committed",
  conflict: "conflict",
  duplicate: "duplicate",
  unavailable: "unavailable",
} as const;

export interface ConversationCommitInput {
  conversationId: string;
  operationId: string;
  operationKind: "conversation_turn" | "saved_edit_response" | "idea_action";
  expectedIdeaMapRevision: number;
  nextSnapshot: ConversationPersistenceSnapshot;
}

export type ConversationCommitResult =
  | {
      status: typeof CONVERSATION_COMMIT_STATUSES.committed;
      snapshot: ConversationPersistenceSnapshot;
    }
  | {
      status: typeof CONVERSATION_COMMIT_STATUSES.duplicate;
      snapshot: ConversationPersistenceSnapshot;
    }
  | {
      status: typeof CONVERSATION_COMMIT_STATUSES.conflict;
      snapshot: ConversationPersistenceSnapshot;
    }
  | { status: typeof CONVERSATION_COMMIT_STATUSES.unavailable };

export interface ConversationPersistence {
  initialize(input: {
    conversationId: string;
    createdAt: string;
  }): Promise<ConversationPersistenceSnapshot | null>;
  load(conversationId: string): Promise<ConversationPersistenceSnapshot | null>;
  list(): Promise<ConversationPersistenceSnapshot[]>;
  getCurrent(): Promise<ConversationPersistenceSnapshot | null>;
  commit(input: ConversationCommitInput): Promise<ConversationCommitResult>;
  clearCurrent(): Promise<void>;
}
