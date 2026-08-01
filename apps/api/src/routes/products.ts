import { Hono } from "hono";
import {
  DEFAULT_OPENAI_MODEL,
  OpenAiLlmClient,
} from "packages/ai/src";
import {
  DisabledConversationModelAdapter,
  LlmConversationModelAdapter,
} from "apps/api/src/adapters";
import { getCurrentAuthSession } from "packages/auth/src/session";
import { createSocraticDraftConversationStoreResolver } from "packages/db/src";
import { ConversationService } from "packages/products/src/socratic-draft/server/conversation";
import { createSocraticDraftApiRoute } from "packages/products/src/socratic-draft/server/http";

const getSocraticDraftConversationStore =
  createSocraticDraftConversationStoreResolver({
    databaseUrl: process.env.DATABASE_URL,
  });

export const HOSTED_AI_ENABLED_VALUE = "true";

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

export function createConversationModel(configuration: {
  hostedAiEnabled?: string;
  openAiApiKey?: string;
  openAiModel?: string;
}) {
  if (
    configuration.hostedAiEnabled !== HOSTED_AI_ENABLED_VALUE ||
    !configuration.openAiApiKey?.trim()
  ) {
    return new DisabledConversationModelAdapter();
  }

  return new LlmConversationModelAdapter(
    new OpenAiLlmClient({
      apiKey: configuration.openAiApiKey,
      model: configuration.openAiModel ?? DEFAULT_OPENAI_MODEL,
    }),
  );
}

const socraticDraftConversationService = new ConversationService({
  conversationModel: createConversationModel({
    hostedAiEnabled: process.env.HOSTED_AI_ENABLED,
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiModel: process.env.OPENAI_MODEL,
  }),
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
