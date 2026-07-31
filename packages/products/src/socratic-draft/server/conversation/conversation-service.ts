import type {
  ConversationMessage,
  ConversationResponse,
  ConversationState,
} from "packages/products/src/socratic-draft/shared";

const DEFAULT_ENTRY_ID = "draft-entry";

export type ConversationServiceRequest = {
  entryId: string | null;
  message: string;
  previousMessages: ConversationMessage[];
};

export class ConversationService {
  respond(request: ConversationServiceRequest): ConversationResponse {
    return {
      entryId: request.entryId ?? DEFAULT_ENTRY_ID,
      message: {
        role: "assistant",
        content:
          "I'm here with you. Share the thought you want to examine, and we can start by finding the question inside it.",
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

function createInitialConversationState(): ConversationState {
  return {
    phase: "new_entry",
    exploredEnough: false,
    nearReadyToReflect: false,
    readyToReflect: false,
    shouldOfferComposition: false,
    threads: [],
    claims: [],
  };
}
