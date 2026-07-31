import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

export type ConversationModelRequest = {
  messages: ConversationMessage[];
  system: string;
};

export type ConversationModelResponse = {
  content: string;
};

export interface ConversationModel {
  createResponse(
    request: ConversationModelRequest,
  ): Promise<ConversationModelResponse>;
}
