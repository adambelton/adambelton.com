import { Hono } from "hono";
import {
  DEFAULT_OPENAI_MODEL,
  FakeLlmClient,
  OpenAiLlmClient,
  type LlmClient,
} from "packages/ai/src";
import { LlmConversationModelAdapter } from "apps/api/src/adapters";
import { getCurrentAuthSession } from "packages/auth/src/session";
import { createSocraticDraftConversationStoreResolver } from "packages/db/src";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";
import { createSocraticDraftApiRoute } from "packages/products/src/socratic-draft/server/http";

const getSocraticDraftConversationStore =
  createSocraticDraftConversationStoreResolver({
    databaseUrl: process.env.DATABASE_URL,
  });

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
  conversationModel: new LlmConversationModelAdapter(createLlmClient()),
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
    getTemporaryConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);

      if (!session || session.user.isOwner) {
        return null;
      }

      return getSocraticDraftConversationStore({
        isSignedIn: true,
        isOwner: false,
        userId: session.user.id,
      });
    },
  }),
);
