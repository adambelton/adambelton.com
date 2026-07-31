import type {
  ConversationMessage,
  ConversationResponse,
  ConversationState,
} from "packages/products/src/socratic-draft/shared";
import type { ConversationModel } from "packages/products/src/socratic-draft/server/conversation/conversation-model";

const DEFAULT_CONVERSATION_ID = "draft-conversation";
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
    const modelResponse = await this.conversationModel.createResponse({
      system: SOCRATIC_DRAFT_SYSTEM_PROMPT,
      messages: [
        ...request.previousMessages,
        {
          role: "user",
          content: request.message,
        },
      ],
    });

    return {
      conversationId: request.conversationId ?? DEFAULT_CONVERSATION_ID,
      message: {
        role: "assistant",
        content: modelResponse.content.trim() || DEFAULT_ASSISTANT_MESSAGE,
      },
      move: "probe",
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
