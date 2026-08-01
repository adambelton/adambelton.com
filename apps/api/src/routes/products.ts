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

type ProductConversationSession = {
  user: { id: string; isOwner: boolean };
};

export function getTemporaryConversationAccess(
  session: ProductConversationSession | null,
) {
  return session
    ? {
        isSignedIn: true as const,
        isOwner: false as const,
        userId: session.user.id,
      }
    : null;
}

export function getPersistentConversationAccess(
  session: ProductConversationSession | null,
) {
  return session?.user.isOwner
    ? {
        isSignedIn: true as const,
        isOwner: true as const,
        userId: session.user.id,
      }
    : null;
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
  conversationModel: new LlmConversationModelAdapter(createLlmClient()),
});

export const productsRoute = new Hono();

productsRoute.route(
  "/socratic-draft",
  createSocraticDraftApiRoute({
    conversationService: socraticDraftConversationService,
    getConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getTemporaryConversationAccess(session);

      return access ? getSocraticDraftConversationStore(access) : null;
    },
    getPersistentConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getPersistentConversationAccess(session);

      return access ? getSocraticDraftConversationStore(access) : null;
    },
    getTemporaryConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getTemporaryConversationAccess(session);

      return access ? getSocraticDraftConversationStore(access) : null;
    },
  }),
);
