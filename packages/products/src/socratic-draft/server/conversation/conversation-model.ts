import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

export type ConversationModelRequest = {
  maxOutputTokens: number;
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

export class HostedAiDisabledError extends Error {
  constructor() {
    super("Hosted AI is disabled.");
    this.name = "HostedAiDisabledError";
  }
}

export class HostedAiUnavailableError extends Error {
  constructor(options?: ErrorOptions) {
    super("Hosted AI is temporarily unavailable.", options);
    this.name = "HostedAiUnavailableError";
  }
}
