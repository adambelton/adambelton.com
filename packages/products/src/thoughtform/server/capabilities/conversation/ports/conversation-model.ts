import type { ConversationMessage } from "packages/products/src/thoughtform/shared";
import type { ThoughtFormPromptReference } from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

export type ConversationModelRequest = {
  maxOutputTokens: number;
  messages: ConversationMessage[];
  outputFormat: ConversationModelOutputFormat;
  system: string;
  context?: string;
  promptReference?: ThoughtFormPromptReference;
};

export interface ConversationModelOutputFormat {
  name: string;
  schema: Record<string, unknown>;
}

export type ConversationModelResponse = {
  content: string;
};

export type ConversationModelStreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "completed"; content: string };

export interface ConversationModel {
  createResponse(
    request: ConversationModelRequest,
  ): Promise<ConversationModelResponse>;
  streamResponse?(
    request: ConversationModelRequest,
  ): AsyncIterable<ConversationModelStreamEvent>;
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
