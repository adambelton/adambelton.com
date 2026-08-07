import { Hono } from "hono";
import {
  AnthropicLlmClient,
  type AnthropicEffort,
  type AnthropicLlmClientOptions,
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_OPENAI_MODEL,
  type LlmClient,
  OpenAiLlmClient,
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
import { IdeaMapAnalysisService } from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  DisabledIdeaMapAnalysisModelAdapter,
  LlmIdeaMapAnalysisModelAdapter,
} from "apps/api/src/products/thoughtform/adapters/ai/idea-map-analysis-model-adapter";
import { createThoughtFormApiRoute } from "packages/products/src/thoughtform/server/delivery/http";
import { noOpObservability } from "packages/observability/src";
import type { Observability } from "packages/observability/src";
import { createBraintrustObservability } from "apps/api/src/platform/observability/braintrust-observability";
import { createThoughtFormAiDisclosureRoute } from "apps/api/src/products/thoughtform/delivery/ai-disclosure-route";
import {
  createThoughtFormOwnerObservationRoute,
} from "apps/api/src/products/thoughtform/delivery/owner-observation-route";
import { hasDevelopmentFeatureAccess } from "apps/api/src/platform/access/has-development-feature-access";

const getThoughtFormDraftStore = createDraftStoreResolver({
  databaseUrl: process.env.DATABASE_URL,
});
const getThoughtFormConversationStore =
  createConversationStoreResolver({
    databaseUrl: process.env.DATABASE_URL,
    temporaryWorkspaceContent: (userId) => ({
      clearDraftingState: (conversationId) =>
        getThoughtFormDraftStore.clearTemporary(userId, conversationId),
    }),
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
  anthropicEffort?: string;
  openAiApiKey?: string;
  openAiModel?: string;
};

const ANTHROPIC_EFFORTS: readonly AnthropicEffort[] = [
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
];

export function createAnthropicLlmClientOptions(
  configuration: HostedAiConfiguration,
): AnthropicLlmClientOptions | null {
  if (!configuration.anthropicApiKey?.trim()) return null;
  const model = configuration.anthropicModel ?? DEFAULT_ANTHROPIC_MODEL;
  if (!isSupportedThoughtFormAiProfile(AI_PROVIDERS.anthropic, model)) return null;
  if (
    configuration.anthropicEffort !== undefined &&
    !ANTHROPIC_EFFORTS.includes(configuration.anthropicEffort as AnthropicEffort)
  ) {
    return null;
  }
  return {
    apiKey: configuration.anthropicApiKey,
    model,
    ...(configuration.anthropicEffort
      ? { effort: configuration.anthropicEffort as AnthropicEffort }
      : {}),
  };
}

type ProductConversationSession = {
  user: { id: string; isOwner: boolean };
};

export function getTemporaryConversationAccess(
  session: ProductConversationSession | null,
) {
  return hasDevelopmentFeatureAccess(session)
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
    const options = createAnthropicLlmClientOptions(configuration);
    if (!options) return null;
    return new ThoughtFormLlmClientAdapter(
      configuration.provider,
      new AnthropicLlmClient(options),
    );
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
  anthropicEffort: process.env.ANTHROPIC_EFFORT,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL,
} satisfies HostedAiConfiguration;
const hostedLlmClient = createLlmClient(hostedAiConfiguration);
const ownerObservability = createBraintrustObservability({
  apiKey: process.env.BRAINTRUST_API_KEY,
  projectName: process.env.BRAINTRUST_PROJECT,
  environment: process.env.BRAINTRUST_ENVIRONMENT,
}) ?? noOpObservability;
export function createConversationServices(
  client: LlmClient | null,
  observability: Observability,
  provider?: string,
  effort?: string,
) {
  const temporaryModel = client
    ? new LlmConversationModelAdapter(client)
    : new DisabledConversationModelAdapter();
  const ownerModel = client
    ? new LlmConversationModelAdapter(client, observability, provider, effort)
    : new DisabledConversationModelAdapter();
  const temporaryIdeaMapModel = client
    ? new LlmIdeaMapAnalysisModelAdapter(client)
    : new DisabledIdeaMapAnalysisModelAdapter();
  const ownerIdeaMapModel = client
    ? new LlmIdeaMapAnalysisModelAdapter(client, observability, provider, effort)
    : new DisabledIdeaMapAnalysisModelAdapter();
  return {
    temporary: new ConversationService({ conversationModel: temporaryModel }),
    persistent: new ConversationService({
      conversationModel: ownerModel,
      observability,
    }),
    temporaryIdeaMapAnalysis: new IdeaMapAnalysisService(temporaryIdeaMapModel),
    ownerIdeaMapAnalysis: new IdeaMapAnalysisService(ownerIdeaMapModel),
  };
}
const conversationServices = createConversationServices(
  hostedLlmClient,
  ownerObservability,
  hostedAiConfiguration.provider,
  hostedAiConfiguration.anthropicEffort,
);
const draftModel = hostedLlmClient
  ? new LlmDraftModelAdapter(hostedLlmClient)
  : new DisabledDraftModelAdapter();
const draftChangeInterpretationModel = hostedLlmClient
  ? new LlmDraftChangeInterpretationModelAdapter(hostedLlmClient)
  : new DisabledDraftChangeInterpretationModelAdapter();

export const thoughtFormRoute = new Hono();

thoughtFormRoute.route("/ai-disclosure", createThoughtFormAiDisclosureRoute({
  activeProvider:
    hostedAiConfiguration.hostedAiEnabled === HOSTED_AI_ENABLED_VALUE
      ? hostedAiConfiguration.provider ?? null
      : null,
}));
thoughtFormRoute.route(
  "/owner-observations",
  createThoughtFormOwnerObservationRoute({
    getSession: getCurrentAuthSession,
    observability: ownerObservability,
  }),
);

thoughtFormRoute.route(
  "/",
  createThoughtFormApiRoute({
    conversationService: conversationServices.temporary,
    streamingConversationService: conversationServices.temporary,
    persistentConversationService: conversationServices.persistent,
    persistentStreamingConversationService: conversationServices.persistent,
    ideaMapAnalysis: conversationServices.temporaryIdeaMapAnalysis,
    persistentIdeaMapAnalysis: conversationServices.ownerIdeaMapAnalysis,
    persistentObservability: ownerObservability,
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
