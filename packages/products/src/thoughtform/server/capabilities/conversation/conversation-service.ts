import type {
  ConversationMessage,
  ConversationResponse,
  IdeaMap,
  DraftSelection,
  DraftChange,
} from "packages/products/src/thoughtform/shared";
import {
  ACTIVITIES,
  CONVERSATION_MESSAGE_ROLES,
  decodeConversationText,
} from "packages/products/src/thoughtform/shared";
import {
  CONVERSATION_MODEL_OUTPUT_FORMAT,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-model-contract";
import { THOUGHTFORM_SYSTEM_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/conversation/prompts/discovery-prompt";
import {
  createBoundedIdeaContext,
  createConversationModelRequest as buildConversationModelRequest,
  measureConversationInputBytes,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-model-request";
import { parseConversationModelResponse } from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-model-response";
import {
  CONVERSATION_MODEL_STREAM_EVENT_TYPES,
  type ConversationModel,
} from "packages/products/src/thoughtform/server/capabilities/conversation/ports/conversation-model";
import { FallbackConversationModel } from "packages/products/src/thoughtform/server/capabilities/conversation/fallback-conversation-model";
import {
  createJsonStringFieldDeltaDecoder,
} from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-response-stream";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
  type Observability,
} from "packages/observability/src";
import {
  fallbackThoughtFormPromptProvider,
  type ThoughtFormPromptProvider,
} from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

const DEFAULT_CONVERSATION_ID = "draft-conversation";
export const MAX_CONVERSATION_INPUT_BYTES = 32 * 1024;
export const MAX_CONVERSATION_OUTPUT_TOKENS = 4_096;

export interface ConversationServiceRequest {
  conversationId: string | null;
  message: string;
  previousMessages: ConversationMessage[];
  ideaMap?: IdeaMap;
  draftSelection?: DraftSelection;
  draftChange?: DraftChange;
  hasDraft?: boolean;
}

export type ConversationGeneration = Omit<ConversationResponse, "ideaMap">;
export type ConversationGenerationStreamEvent =
  | {
      type: typeof CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta;
      text: string;
    }
  | {
      type: typeof CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed;
      generation: ConversationGeneration;
    };

export interface ConversationServiceDependencies {
  conversationModel?: ConversationModel;
  observability?: Observability;
  promptProvider?: ThoughtFormPromptProvider;
}

export class ConversationInputTooLargeError extends Error {
  constructor() {
    super("The conversation is too large to continue.");
    this.name = "ConversationInputTooLargeError";
  }
}

export class ConversationService {
  private readonly conversationModel: ConversationModel;
  private readonly observability: Observability;
  private readonly promptProvider: ThoughtFormPromptProvider;

  constructor({
    conversationModel = new FallbackConversationModel(),
    observability = noOpObservability,
    promptProvider = fallbackThoughtFormPromptProvider,
  }: ConversationServiceDependencies = {}) {
    this.conversationModel = conversationModel;
    this.observability = observability;
    this.promptProvider = promptProvider;
  }

  async respond(
    request: ConversationServiceRequest,
  ): Promise<ConversationGeneration> {
    return this.observability.observe("thoughtform.conversation.respond", {
      [OBSERVATION_ATTRIBUTE_NAMES.previousMessageCount]: request.previousMessages.length,
      [OBSERVATION_ATTRIBUTE_NAMES.ideaCount]: request.ideaMap?.ideas.length ?? 0,
      [OBSERVATION_ATTRIBUTE_NAMES.ideaMapRevision]: request.ideaMap?.revision ?? 0,
    }, async () => {
    this.observability.recordContent({ input: {
      currentMessage: request.message,
      previousMessages: request.previousMessages,
      ideaMap: request.ideaMap,
      draftSelection: request.draftSelection,
      draftChange: request.draftChange,
      hasDraft: request.hasDraft ?? false,
    } });
    const modelRequest = await this.createConversationModelRequest(request);

    if (measureConversationInputBytes(modelRequest) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }

    const modelResponse = await this.conversationModel.createResponse(modelRequest);
    const structured = await this.observability.observe(
      "thoughtform.conversation.validate_output",
      {},
      async () => parseConversationModelResponse(modelResponse.content),
    );

    const generation = {
      conversationId: request.conversationId ?? DEFAULT_CONVERSATION_ID,
      message: {
        role: CONVERSATION_MESSAGE_ROLES.assistant,
        content: structured.response,
      },
      activity: ACTIVITIES.discovery,
      move: structured.move,
      assistantReadiness: structured.assistantReadiness,
      userIntention: structured.userIntention,
    };
    this.observability.recordContent({ output: generation });
    return generation;
    });
  }

  async *respondStream(
    request: ConversationServiceRequest,
  ): AsyncIterable<ConversationGenerationStreamEvent> {
    const modelRequest = await this.createConversationModelRequest(request);
    if (measureConversationInputBytes(modelRequest) > MAX_CONVERSATION_INPUT_BYTES) {
      throw new ConversationInputTooLargeError();
    }
    if (!this.conversationModel.streamResponse) {
      const generation = await this.respond(request);
      yield {
        type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta,
        text: generation.message.content,
      };
      yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation };
      return;
    }

    const decoder = createJsonStringFieldDeltaDecoder("response");
    let emittedText = "";
    for await (const event of this.conversationModel.streamResponse(modelRequest)) {
      if (event.type === CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta) {
        const text = decoder.push(event.text);
        if (text) {
          emittedText += text;
          yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta, text };
        }
        continue;
      }
      const structured = parseConversationModelResponse(event.content);
      const responseText = decodeConversationText(structured.response);
      if (!emittedText) {
        emittedText = responseText;
        yield {
          type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.textDelta,
          text: emittedText,
        };
      }
      const generation: ConversationGeneration = {
        conversationId: request.conversationId ?? DEFAULT_CONVERSATION_ID,
        message: {
          role: CONVERSATION_MESSAGE_ROLES.assistant,
          content: responseText,
        },
        activity: ACTIVITIES.discovery,
        move: structured.move,
        assistantReadiness: structured.assistantReadiness,
        userIntention: structured.userIntention,
      };
      this.observability.recordContent({ output: generation });
      yield { type: CONVERSATION_MODEL_STREAM_EVENT_TYPES.completed, generation };
    }
  }

  private async createConversationModelRequest(request: ConversationServiceRequest) {
    const prompt = await this.promptProvider.getPrompt(
      THOUGHTFORM_SYSTEM_PROMPT_DEFINITION,
    );
    return buildConversationModelRequest({
      request,
      system: prompt.content,
      promptReference: prompt.reference,
      outputFormat: CONVERSATION_MODEL_OUTPUT_FORMAT,
      maxOutputTokens: MAX_CONVERSATION_OUTPUT_TOKENS,
      maxInputBytes: MAX_CONVERSATION_INPUT_BYTES,
    });
  }
}

export function measureConversationRequestInputBytes(
  request: ConversationServiceRequest,
) {
  return measureConversationInputBytes(createConversationModelRequest(request));
}

function createConversationModelRequest(request: ConversationServiceRequest) {
  return buildConversationModelRequest({
    request,
    system: THOUGHTFORM_SYSTEM_PROMPT_DEFINITION.fallback,
    outputFormat: CONVERSATION_MODEL_OUTPUT_FORMAT,
    maxOutputTokens: MAX_CONVERSATION_OUTPUT_TOKENS,
    maxInputBytes: MAX_CONVERSATION_INPUT_BYTES,
  });
}

export { createBoundedIdeaContext, measureConversationInputBytes };
export { CONVERSATION_MODEL_OUTPUT_FORMAT };
