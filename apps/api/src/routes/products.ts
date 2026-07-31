import { Hono } from "hono";
import {
  DEFAULT_OPENAI_MODEL,
  FakeLlmClient,
  OpenAiLlmClient,
  type LlmClient,
} from "packages/ai/src";
import { getCurrentAuthSession } from "packages/auth/src/session";
import { createSocraticDraftConversationStoreResolver } from "packages/db/src";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";
import type {
  ConversationModel,
  ConversationModelRequest,
} from "packages/products/src/socratic-draft/server/conversation";
import { createSocraticDraftApiRoute } from "packages/products/src/socratic-draft/server/http";

const getSocraticDraftConversationStore =
  createSocraticDraftConversationStoreResolver({
    databaseUrl: process.env.DATABASE_URL,
  });

class LlmConversationModel implements ConversationModel {
  constructor(private readonly llmClient: LlmClient) {}

  async createResponse(request: ConversationModelRequest) {
    const response = await this.llmClient.createMessage({
      system: request.system,
      messages: request.messages,
    });

    return {
      content: response.content,
    };
  }
}

function createLlmClient(): LlmClient {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new FakeLlmClient();
  }

  return new OpenAiLlmClient({
    apiKey,
    model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
  });
}

const socraticDraftConversationService = new ConversationService({
  conversationModel: new LlmConversationModel(createLlmClient()),
});

export const productsRoute = new Hono();

productsRoute.route(
  "/socratic-draft",
  createSocraticDraftApiRoute({
    conversationService: socraticDraftConversationService,
    getConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);

      return getSocraticDraftConversationStore({
        isSignedIn: Boolean(session),
        isOwner: Boolean(session?.user.isOwner),
        userId: session?.user.id,
      });
    },
    getPersistentConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);

      if (!session?.user.isOwner) {
        return null;
      }

      return getSocraticDraftConversationStore({
        isSignedIn: true,
        isOwner: true,
        userId: session.user.id,
      });
    },
  }),
);
