import type { ConversationService } from "packages/products/src/socratic-draft/server/conversation/conversation-service";
import type { ConversationStore } from "packages/products/src/socratic-draft/server/conversation/conversation-store";
import type { ConversationResponse } from "packages/products/src/socratic-draft/shared";

export type ConversationResponder = Pick<ConversationService, "respond">;

export type RespondToConversationResult =
  | { status: "responded"; response: ConversationResponse }
  | { status: "conversation_not_found" }
  | { status: "conversation_unavailable" };

export async function respondToConversation(input: {
  conversationId: string;
  message: string;
  conversationService: ConversationResponder;
  conversationStore: ConversationStore;
}): Promise<RespondToConversationResult> {
  const previousMessages = await input.conversationStore.getConversationMessages(
    input.conversationId,
  );

  if (previousMessages === null) {
    return { status: "conversation_not_found" };
  }

  const response = await input.conversationService.respond({
    conversationId: input.conversationId,
    message: input.message,
    previousMessages,
  });
  const appendResult = await input.conversationStore.appendConversationTurn({
    conversationId: response.conversationId,
    userMessage: { role: "user", content: input.message },
    assistantMessage: response.message,
  });

  return appendResult.status === "retained"
    ? { status: "responded", response }
    : { status: "conversation_unavailable" };
}
