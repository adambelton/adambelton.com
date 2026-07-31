import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

const UNTITLED_CONVERSATION_LABEL = "Untitled conversation";
const CONVERSATION_LABEL_MAX_LENGTH = 80;

export function createConversationLabel(messages: ConversationMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const content = firstUserMessage?.content.trim();

  if (!content) {
    return UNTITLED_CONVERSATION_LABEL;
  }

  return content.length > CONVERSATION_LABEL_MAX_LENGTH
    ? `${content.slice(0, CONVERSATION_LABEL_MAX_LENGTH - 1).trimEnd()}…`
    : content;
}
