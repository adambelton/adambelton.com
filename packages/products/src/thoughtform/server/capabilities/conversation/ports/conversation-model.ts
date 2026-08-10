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

export const CONVERSATION_MODEL_STREAM_EVENT_TYPES = {
  textDelta: "text_delta",
  completed: "completed",
} as const;

export type ConversationModelStreamEvent =
  | {
      type: typeof CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta;
      text: string;
    }
  | {
      type: typeof CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed;
      content: string;
    };

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
