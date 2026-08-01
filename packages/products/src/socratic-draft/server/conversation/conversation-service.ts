import type {
  ConversationMessage,
  ConversationResponse,
  ConversationState,
} from "packages/products/src/socratic-draft/shared";
import {
  ASSISTANT_MOVES,
  CONVERSATION_MESSAGE_ROLES,
} from "packages/products/src/socratic-draft/shared";
import type { ConversationModel } from "packages/products/src/socratic-draft/server/conversation/conversation-model";

const DEFAULT_CONVERSATION_ID = "draft-conversation";
export const MAX_CONVERSATION_INPUT_BYTES = 32 * 1024;
export const MAX_CONVERSATION_OUTPUT_TOKENS = 1_024;
const DEFAULT_ASSISTANT_MESSAGE =
  "I'm here with you. Share the thought you want to examine, and we can start by finding the question inside it.";
const SOCRATIC_DRAFT_SYSTEM_PROMPT = [
  "You are The Socratic Draft, a calm writing companion.",
  "Help the user examine one rough thought at a time.",
  "Ask one useful question or offer one concise reflection.",
  "Do not rewrite the user's thought yet.",
  "Keep the response brief, grounded, and humane.",
].join(" ");

export type ConversationServiceRequest = {
  conversationId: string | null;
  message: string;
  previousMessages: ConversationMessage[];
};

export type ConversationServiceDependencies = {
  conversationModel?: ConversationModel;
};

export class ConversationInputTooLargeError extends Error {
  constructor() {
    super("The conversation is too large to continue.");
    this.name = "ConversationInputTooLargeError";
  }
}

export class ConversationService {
  private readonly conversationModel: ConversationModel;

  constructor({
    conversationModel = new StaticConversationModel(),
  }: ConversationServiceDependencies = {}) {
    this.conversationModel = conversationModel;
  }

  async respond(
    request: ConversationServiceRequest,
  ): Promise<ConversationResponse> {
    const modelRequest = createConversationModelRequest(request);

    if (measureConversationInputBytes(modelRequest) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }

    const modelResponse = await this.conversationModel.createResponse(modelRequest);

    return {
      conversationId: request.conversationId ?? DEFAULT_CONVERSATION_ID,
      message: {
        role: CONVERSATION_MESSAGE_ROLES.assistant,
        content: modelResponse.content.trim() || DEFAULT_ASSISTANT_MESSAGE,
      },
      move: ASSISTANT_MOVES.probe,
      state: createInitialConversationState(),
      suggestedReplies: [
        {
          label: "Start with a thought",
          message: request.message,
        },
      ],
    };
  }
}

export function measureConversationInputBytes(input: {
  messages: ConversationMessage[];
  system: string;
}) {
  return new TextEncoder().encode(
    JSON.stringify({ system: input.system, messages: input.messages }),
  ).byteLength;
}

export function measureConversationRequestInputBytes(
  request: ConversationServiceRequest,
) {
  return measureConversationInputBytes(createConversationModelRequest(request));
}

function createConversationModelRequest(request: ConversationServiceRequest) {
  return {
    maxOutputTokens: MAX_CONVERSATION_OUTPUT_TOKENS,
    system: SOCRATIC_DRAFT_SYSTEM_PROMPT,
    messages: [
      ...request.previousMessages,
      {
        role: CONVERSATION_MESSAGE_ROLES.user,
        content: request.message,
      },
    ],
  };
}

class StaticConversationModel implements ConversationModel {
  async createResponse(): Promise<{ content: string }> {
    return {
      content: DEFAULT_ASSISTANT_MESSAGE,
    };
  }
}

function createInitialConversationState(): ConversationState {
  return {
    phase: "new_conversation",
    exploredEnough: false,
    nearReadyToReflect: false,
    readyToReflect: false,
    shouldOfferDraft: false,
    threads: [],
    claims: [],
  };
}
