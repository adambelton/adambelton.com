import { Hono } from "hono";
import {
  DEFAULT_OPENAI_MODEL,
  OpenAiLlmClient,
} from "packages/ai/src";
import {
  DisabledConversationModelAdapter,
  LlmConversationModelAdapter,
} from "apps/api/src/products/socratic-draft/adapters/ai/conversation-model-adapter";
import { getCurrentAuthSession } from "packages/auth/src/server/session";
import { createConversationStoreResolver } from "apps/api/src/products/socratic-draft/adapters/persistence/conversation-store-resolver";
import {
  DisabledDraftModelAdapter,
  LlmDraftModelAdapter,
} from "apps/api/src/products/socratic-draft/adapters/ai/draft-model-adapter";
import { createDraftStoreResolver } from "apps/api/src/products/socratic-draft/adapters/persistence/draft-store-resolver";
import { ConversationService } from "packages/products/src/socratic-draft/server/capabilities/conversation";
import { createSocraticDraftApiRoute } from "packages/products/src/socratic-draft/server/delivery/http";

const getSocraticDraftDraftStore = createDraftStoreResolver({
  databaseUrl: process.env.DATABASE_URL,
});
const getSocraticDraftConversationStore =
  createConversationStoreResolver({
    databaseUrl: process.env.DATABASE_URL,
    onTemporaryClear: (userId, conversationId) =>
      getSocraticDraftDraftStore.clearTemporary(userId, conversationId),
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
export function createDraftModel(configuration: {
  hostedAiEnabled?: string;
  openAiApiKey?: string;
  openAiModel?: string;
}) {
  if (
    configuration.hostedAiEnabled !== HOSTED_AI_ENABLED_VALUE ||
    !configuration.openAiApiKey?.trim()
  ) {
    return new DisabledDraftModelAdapter();
  }
  return new LlmDraftModelAdapter(new OpenAiLlmClient({
    apiKey: configuration.openAiApiKey,
    model: configuration.openAiModel ?? DEFAULT_OPENAI_MODEL,
  }));
}

const draftModel = createDraftModel({
  hostedAiEnabled: process.env.HOSTED_AI_ENABLED,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL,
});

export const socraticDraftRoute = new Hono();

socraticDraftRoute.route(
  "/",
  createSocraticDraftApiRoute({
    conversationService: socraticDraftConversationService,
    compositionModel: draftModel,
    proposalModel: draftModel,
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
    getPersistentDraftStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getPersistentConversationAccess(session);
      return access ? getSocraticDraftDraftStore(access) : null;
    },
    getTemporaryDraftStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getTemporaryConversationAccess(session);
      return access ? getSocraticDraftDraftStore(access) : null;
    },
  }),
);
