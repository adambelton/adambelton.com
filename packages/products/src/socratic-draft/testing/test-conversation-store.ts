import {
  CONVERSATION_TURN_RETENTION_STATUSES,
  type AppendConversationTurnInput,
  type ReplaceIdeaMapInput,
  type TemporaryConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import type {
  ConversationMessage,
  TemporaryConversation,
} from "packages/products/src/socratic-draft/shared";

export class TestConversationStore implements TemporaryConversationStore {
  private conversation: TemporaryConversation | null = null;

  createConversationId() {
    return globalThis.crypto.randomUUID();
  }

  async getConversationWorkspace(conversationId: string) {
    if (this.conversation?.conversation.id !== conversationId) return null;
    return {
      messages: this.conversation.conversation.messages,
      ideaMap: this.conversation.conversation.ideaMap,
    };
  }

  async appendConversationTurn(input: AppendConversationTurnInput) {
    if (
      this.conversation &&
      (this.conversation.conversation.id !== input.conversationId ||
        this.conversation.conversation.ideaMap.revision !==
          input.expectedIdeaMapRevision)
    ) {
      return { status: CONVERSATION_TURN_RETENTION_STATUSES.conflict } as const;
    }

    const now = new Date().toISOString();
    const messages: ConversationMessage[] = [
      ...(this.conversation?.conversation.messages ?? []),
      input.userMessage,
      input.assistantMessage,
    ];
    this.conversation = {
      expiresAt: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
      conversation: {
        id: input.conversationId,
        label: messages.find((message) => message.role === "user")?.content ??
          "Test conversation",
        createdAt: this.conversation?.conversation.createdAt ?? now,
        updatedAt: now,
        messages,
        ideaMap: input.ideaMap,
      },
    };
    return { status: CONVERSATION_TURN_RETENTION_STATUSES.retained } as const;
  }

  async replaceIdeaMap(input: ReplaceIdeaMapInput) {
    if (
      !this.conversation ||
      this.conversation.conversation.id !== input.conversationId
    ) {
      return {
        status: CONVERSATION_TURN_RETENTION_STATUSES.unavailable,
      } as const;
    }
    if (
      this.conversation.conversation.ideaMap.revision !== input.expectedRevision
    ) {
      return { status: CONVERSATION_TURN_RETENTION_STATUSES.conflict } as const;
    }
    this.conversation = {
      ...this.conversation,
      conversation: {
        ...this.conversation.conversation,
        updatedAt: new Date().toISOString(),
        ideaMap: input.ideaMap,
      },
    };
    return { status: CONVERSATION_TURN_RETENTION_STATUSES.retained } as const;
  }

  async getCurrentConversation() {
    return this.conversation;
  }

  async clearCurrentConversation() {
    this.conversation = null;
  }
}
