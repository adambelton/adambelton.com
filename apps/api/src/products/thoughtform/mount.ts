import { Hono } from "hono";
import {
  DEFAULT_OPENAI_MODEL,
  OpenAiLlmClient,
} from "packages/ai/src";
import {
  DisabledConversationModelAdapter,
  LlmConversationModelAdapter,
} from "apps/api/src/products/thoughtform/adapters/ai/conversation-model-adapter";
import {
  DisabledDraftChangeInterpretationModelAdapter,
  LlmDraftChangeInterpretationModelAdapter,
} from "apps/api/src/products/thoughtform/adapters/ai/draft-change-interpretation-model-adapter";
import { getCurrentAuthSession } from "packages/auth/src/server/session";
import { createConversationStoreResolver } from "apps/api/src/products/thoughtform/adapters/persistence/conversation-store-resolver";
import {
  DisabledDraftModelAdapter,
  LlmDraftModelAdapter,
} from "apps/api/src/products/thoughtform/adapters/ai/draft-model-adapter";
import { createDraftStoreResolver } from "apps/api/src/products/thoughtform/adapters/persistence/draft-store-resolver";
import { ConversationService } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { createThoughtFormApiRoute } from "packages/products/src/thoughtform/server/delivery/http";

const getThoughtFormDraftStore = createDraftStoreResolver({
  databaseUrl: process.env.DATABASE_URL,
});
const getThoughtFormConversationStore =
  createConversationStoreResolver({
    databaseUrl: process.env.DATABASE_URL,
    onTemporaryClear: (userId, conversationId) =>
      getThoughtFormDraftStore.clearTemporary(userId, conversationId),
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

const thoughtFormConversationService = new ConversationService({
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

export function createDraftChangeInterpretationModel(configuration: {
  hostedAiEnabled?: string;
  openAiApiKey?: string;
  openAiModel?: string;
}) {
  if (
    configuration.hostedAiEnabled !== HOSTED_AI_ENABLED_VALUE ||
    !configuration.openAiApiKey?.trim()
  ) {
    return new DisabledDraftChangeInterpretationModelAdapter();
  }
  return new LlmDraftChangeInterpretationModelAdapter(new OpenAiLlmClient({
    apiKey: configuration.openAiApiKey,
    model: configuration.openAiModel ?? DEFAULT_OPENAI_MODEL,
  }));
}

const draftModel = createDraftModel({
  hostedAiEnabled: process.env.HOSTED_AI_ENABLED,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL,
});
const draftChangeInterpretationModel = createDraftChangeInterpretationModel({
  hostedAiEnabled: process.env.HOSTED_AI_ENABLED,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL,
});

export const thoughtFormRoute = new Hono();

thoughtFormRoute.route(
  "/",
  createThoughtFormApiRoute({
    conversationService: thoughtFormConversationService,
    compositionModel: draftModel,
    interpretationModel: draftChangeInterpretationModel,
    proposalModel: draftModel,
    getConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getTemporaryConversationAccess(session);

      return access ? getThoughtFormConversationStore(access) : null;
    },
    getPersistentConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getPersistentConversationAccess(session);

      return access ? getThoughtFormConversationStore(access) : null;
    },
    getTemporaryConversationStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getTemporaryConversationAccess(session);

      return access ? getThoughtFormConversationStore(access) : null;
    },
    getPersistentDraftStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getPersistentConversationAccess(session);
      return access ? getThoughtFormDraftStore(access) : null;
    },
    getTemporaryDraftStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);
      const access = getTemporaryConversationAccess(session);
      return access ? getThoughtFormDraftStore(access) : null;
    },
  }),
);
