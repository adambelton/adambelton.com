import { Hono } from "hono";
import {
  AnthropicLlmClient,
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_OPENAI_MODEL,
  type LlmClient,
  OpenAiLlmClient,
  getAiProviderDisclosure,
  listAiProviderDisclosures,
} from "packages/ai/src";
import {
  isSupportedThoughtFormAiProfile,
  THOUGHTFORM_AI_PROFILES,
} from "packages/products/src/thoughtform/server/capabilities/hosted-ai-profile";
import { ThoughtFormLlmClientAdapter } from "apps/api/src/products/thoughtform/adapters/ai/thoughtform-llm-client-adapter";
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
export const AI_PROVIDERS = {
  anthropic: THOUGHTFORM_AI_PROFILES.anthropic,
  openAi: THOUGHTFORM_AI_PROFILES.openAi,
} as const;

type HostedAiConfiguration = {
  hostedAiEnabled?: string;
  provider?: string;
  anthropicApiKey?: string;
  anthropicModel?: string;
  openAiApiKey?: string;
  openAiModel?: string;
};

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

export function createLlmClient(
  configuration: HostedAiConfiguration,
): LlmClient | null {
  if (configuration.hostedAiEnabled !== HOSTED_AI_ENABLED_VALUE) return null;

  if (configuration.provider === AI_PROVIDERS.anthropic) {
    if (!configuration.anthropicApiKey?.trim()) return null;
    const model = configuration.anthropicModel ?? DEFAULT_ANTHROPIC_MODEL;
    if (!isSupportedThoughtFormAiProfile(configuration.provider, model)) return null;
    return new ThoughtFormLlmClientAdapter(configuration.provider, new AnthropicLlmClient({
      apiKey: configuration.anthropicApiKey,
      model,
    }));
  }

  if (configuration.provider === AI_PROVIDERS.openAi) {
    if (!configuration.openAiApiKey?.trim()) return null;
    const model = configuration.openAiModel ?? DEFAULT_OPENAI_MODEL;
    if (!isSupportedThoughtFormAiProfile(configuration.provider, model)) return null;
    return new ThoughtFormLlmClientAdapter(configuration.provider, new OpenAiLlmClient({
      apiKey: configuration.openAiApiKey,
      model,
    }));
  }

  return null;
}

export function createConversationModel(configuration: HostedAiConfiguration) {
  const client = createLlmClient(configuration);
  if (!client) {
    return new DisabledConversationModelAdapter();
  }
  return new LlmConversationModelAdapter(client);
}

export function createDraftModel(configuration: HostedAiConfiguration) {
  const client = createLlmClient(configuration);
  if (!client) {
    return new DisabledDraftModelAdapter();
  }
  return new LlmDraftModelAdapter(client);
}

export function createDraftChangeInterpretationModel(
  configuration: HostedAiConfiguration,
) {
  const client = createLlmClient(configuration);
  if (!client) {
    return new DisabledDraftChangeInterpretationModelAdapter();
  }
  return new LlmDraftChangeInterpretationModelAdapter(client);
}

const hostedAiConfiguration = {
  hostedAiEnabled: process.env.HOSTED_AI_ENABLED,
  provider: process.env.AI_PROVIDER,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  anthropicModel: process.env.ANTHROPIC_MODEL,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL,
} satisfies HostedAiConfiguration;
const hostedLlmClient = createLlmClient(hostedAiConfiguration);
const conversationModel = hostedLlmClient
  ? new LlmConversationModelAdapter(hostedLlmClient)
  : new DisabledConversationModelAdapter();
const draftModel = hostedLlmClient
  ? new LlmDraftModelAdapter(hostedLlmClient)
  : new DisabledDraftModelAdapter();
const draftChangeInterpretationModel = hostedLlmClient
  ? new LlmDraftChangeInterpretationModelAdapter(hostedLlmClient)
  : new DisabledDraftChangeInterpretationModelAdapter();
const thoughtFormConversationService = new ConversationService({
  conversationModel,
});

export const thoughtFormRoute = new Hono();

thoughtFormRoute.get("/ai-disclosure", (context) =>
  context.json({
    ok: true as const,
    data: {
      activeProvider:
        hostedAiConfiguration.hostedAiEnabled === HOSTED_AI_ENABLED_VALUE
          ? getAiProviderDisclosure(hostedAiConfiguration.provider ?? "")
          : null,
      supportedProviders: listAiProviderDisclosures(),
    },
  }),
);

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
