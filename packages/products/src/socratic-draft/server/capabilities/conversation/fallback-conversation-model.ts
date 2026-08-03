import type {
  ConversationModel,
  ConversationModelResponse,
} from "packages/products/src/socratic-draft/server/capabilities/conversation/ports/conversation-model";

const FALLBACK_RESPONSE =
  "I'm here with you. Share the thought you want to examine, and we can start by finding the question inside it.";

/**
 * Keeps the product's deterministic no-provider behaviour separate from test
 * fakes and hosted model adapters.
 */
export class FallbackConversationModel implements ConversationModel {
  async createResponse(): Promise<ConversationModelResponse> {
    return { content: FALLBACK_RESPONSE };
  }
}
