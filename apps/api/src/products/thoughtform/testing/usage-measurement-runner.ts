import { Hono } from "hono";
import { AnthropicLlmClient } from "packages/ai/src";
import { loadLocalEnvironment } from "apps/api/src/bootstrap/local-environment";
import { createDatabaseClient } from "packages/db/src/client/database-client";
import {
  measurementOperationId,
  PrismaThoughtFormUsageMeasurementReader,
} from "packages/db/src/adapters/thoughtform/usage-measurement-reader";
import {
  DEFAULT_USAGE_MEASUREMENT_REPETITIONS,
  expectedHostedActionsForScenario,
  USAGE_MEASUREMENT_MODEL_PROFILE,
  USAGE_MEASUREMENT_SCENARIOS,
  type UsageMeasurementJourneyAction,
} from "packages/products/src/thoughtform/testing/evaluations/usage-measurement-scenarios";
import { summariseUsageMeasurement } from "packages/products/src/thoughtform/testing/evaluations/usage-measurement-report";
import {
  CONVERSATION_STREAM_EVENT_TYPES,
  EMPTY_IDEA_MAP,
  type ConversationStreamEvent,
  type DraftChange,
  type DraftingState,
  type IdeaMap,
} from "packages/products/src/thoughtform/shared";
import type { ApiResponse } from "packages/shared/src";
import { createConversationStore, ConversationService } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { createDraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import { IdeaMapAnalysisService } from "packages/products/src/thoughtform/server/capabilities/idea-map";
import { createThoughtFormApiRoute } from "packages/products/src/thoughtform/server/delivery/http";
import { fallbackThoughtFormPromptProvider } from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";
import { noOpObservability } from "packages/observability/src";
import { ThoughtFormLlmClientAdapter } from "apps/api/src/products/thoughtform/adapters/ai/thoughtform-llm-client-adapter";
import { LlmConversationModelAdapter } from "apps/api/src/products/thoughtform/adapters/ai/conversation-model-adapter";
import { LlmIdeaMapAnalysisModelAdapter } from "apps/api/src/products/thoughtform/adapters/ai/idea-map-analysis-model-adapter";
import { LlmDraftModelAdapter } from "apps/api/src/products/thoughtform/adapters/ai/draft-model-adapter";
import { LlmDraftChangeInterpretationModelAdapter } from "apps/api/src/products/thoughtform/adapters/ai/draft-change-interpretation-model-adapter";
import { createInMemoryConversationPersistence } from "apps/api/src/products/thoughtform/adapters/persistence/in-memory-conversation-persistence";
import { createInMemoryDraftPersistence } from "apps/api/src/products/thoughtform/adapters/persistence/in-memory-draft-persistence";
import { HostedAttemptLifecycleAdapter } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-lifecycle-adapter";
import { HostedAttemptUsageLlmClient } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-usage-llm-client";
import { PrismaThoughtFormHostedAttemptRecordStore } from "packages/db/src/adapters/thoughtform/hosted-attempt-record-store";
import { estimateAnthropicUsageCost } from "apps/api/src/products/thoughtform/testing/anthropic-usage-cost";

loadLocalEnvironment();

const executionAcknowledgement = "RUN_HOSTED_USAGE_MEASUREMENT";
const costCeilingEnvironmentName = "USAGE_MEASUREMENT_COST_CEILING_USD";
const costCeiling = {
  currency: "USD",
  amount: positiveNumber(process.env[costCeilingEnvironmentName]),
  pricingCheckedAt: "2026-08-13",
  pricingValidThrough: "2026-08-31",
  pricingSource: "https://www.anthropic.com/news/claude-sonnet-5",
  basis: "Must be explicitly configured for each approved hosted run; estimated after every journey at Sonnet 5 introductory pricing.",
} as const;
const repetitions = positiveInteger(process.env.USAGE_MEASUREMENT_REPETITIONS) ??
  DEFAULT_USAGE_MEASUREMENT_REPETITIONS;
const scenarioFilter = process.env.USAGE_MEASUREMENT_SCENARIO?.trim();
const measurementScenarios = scenarioFilter
  ? USAGE_MEASUREMENT_SCENARIOS.filter((scenario) => scenario.id === scenarioFilter)
  : [...USAGE_MEASUREMENT_SCENARIOS];
if (measurementScenarios.length === 0) {
  throw new Error("USAGE_MEASUREMENT_SCENARIO does not identify a planned scenario.");
}

if (process.env[executionAcknowledgement] !== "true") {
  console.log(JSON.stringify({
    mode: "plan",
    modelProfile: USAGE_MEASUREMENT_MODEL_PROFILE,
    repetitions,
    scenarioCount: measurementScenarios.length,
    expectedHostedOperationCount: measurementScenarios.reduce(
      (total, scenario) => total + expectedHostedActionsForScenario(scenario).length * repetitions,
      0,
    ),
    costCeiling,
    scenarios: measurementScenarios.map((scenario) => ({
      id: scenario.id,
      form: scenario.form,
      actionCount: scenario.actions.length,
      expectedHostedActions: expectedHostedActionsForScenario(scenario),
    })),
    executionRequires: [executionAcknowledgement, costCeilingEnvironmentName],
  }, null, 2));
  process.exit(0);
}

const configuration = executionConfiguration();
const database = createDatabaseClient(configuration.databaseUrl);
const measurementUserId = `usage-measurement-${configuration.runId}`;
try {
  await database.user.upsert({
    where: { id: measurementUserId },
    update: {},
    create: {
      id: measurementUserId,
      name: "Task 039 usage measurement",
      email: `${measurementUserId}@example.invalid`,
    },
  });
  let hasReachedResumePoint = configuration.resumeAfter === null;
  for (let repetition = 1; repetition <= repetitions; repetition += 1) {
    for (const scenario of measurementScenarios) {
      if (!hasReachedResumePoint) {
        hasReachedResumePoint = configuration.resumeAfter === `${scenario.id}:${repetition}`;
        continue;
      }
      let journeyFailure: unknown;
      try {
        await runJourney({
          request: createMountedMeasurementRequest({
            anthropicApiKey: configuration.anthropicApiKey,
            database,
            userId: measurementUserId,
          }),
          runId: configuration.runId,
          repetition,
          scenario,
        });
      } catch (error) {
        journeyFailure = error;
      }
      const currentAttempts = await new PrismaThoughtFormUsageMeasurementReader(
        database,
        measurementUserId,
      ).readRun(configuration.runId);
      const estimatedCost = estimateAnthropicUsageCost(currentAttempts, {
        input: 2,
        output: 10,
        cacheRead: 0.2,
        cacheWrite: 2.5,
      });
      if (estimatedCost > configuration.costCeilingUsd) {
        throw new Error(`Task 039 cost ceiling exceeded: $${estimatedCost.toFixed(4)} USD.`);
      }
      if (!journeyFailure) assertJourneyAttemptActions(currentAttempts, scenario, repetition);
      if (journeyFailure) throw journeyFailure;
      console.log(`Completed ${scenario.id} repetition ${repetition}; estimated usage cost $${estimatedCost.toFixed(4)} USD.`);
    }
  }
  const attempts = await new PrismaThoughtFormUsageMeasurementReader(
    database,
    measurementUserId,
  ).readRun(configuration.runId);
  console.log(JSON.stringify({
    runId: configuration.runId,
    measuredAt: new Date().toISOString(),
    modelProfile: USAGE_MEASUREMENT_MODEL_PROFILE,
    ...summariseUsageMeasurement(attempts),
  }, null, 2));
} finally {
  await database.$disconnect();
}

async function runJourney(input: {
  request: MountedRequest;
  runId: string;
  repetition: number;
  scenario: typeof USAGE_MEASUREMENT_SCENARIOS[number];
}) {
  let conversationId: string | null = null;
  let ideaMap: IdeaMap | null = null;
  let draftingState: DraftingState | null = null;
  let hasAssistantStructuralChange = false;
  let sequence = 0;
  for (const action of input.scenario.actions) {
    if (isHostedAction(action)) sequence += 1;
    const operationId = isHostedAction(action)
      ? measurementOperationId({
          runId: input.runId,
          scenarioId: input.scenario.id,
          repetition: input.repetition,
          sequence,
        })
      : undefined;
    if (action.type === "conversation_turn") {
      const events = await streamRequest(input, "/conversation/respond-stream", {
        conversationId,
        message: action.message,
      }, operationId!);
      conversationId = eventOfType(events, CONVERSATION_STREAM_EVENT_TYPES.accepted).conversationId;
      const completedIdeaMap = events.find(
        (event) => event.type === CONVERSATION_STREAM_EVENT_TYPES.ideaMapCompleted,
      );
      ideaMap = completedIdeaMap?.ideaMap ?? ideaMap ?? EMPTY_IDEA_MAP;
      hasAssistantStructuralChange ||= ideaMap.structuralChange?.source === "assistant";
      continue;
    }
    if (!conversationId || !ideaMap) throw new Error("Measurement action requires a conversation and Idea Map.");
    if (action.type === "compose_draft") {
      draftingState = await jsonRequest<DraftingState>(input, `/temporary-drafts/${conversationId}/compose`, {
        selectedIdeaIds: ideaMap.ideas.filter((idea) => idea.disposition === "active").map((idea) => idea.id),
        instruction: action.instruction,
      }, operationId!, "POST");
      continue;
    }
    if (action.type === "propose_and_accept_revision") {
      const draft = requiredDraft(draftingState);
      draftingState = await jsonRequest<DraftingState>(input, `/temporary-drafts/${conversationId}/proposals`, {
        expectedDraftRevision: draft.currentRevision,
        scope: "whole_draft",
        userInstruction: action.instruction,
      }, operationId!, "POST");
      const proposal = draftingState.activeProposal;
      if (!proposal) throw new Error("Measurement revision proposal was not retained.");
      draftingState = await jsonRequest<DraftingState>(input, `/temporary-drafts/${conversationId}/proposals/${proposal.id}/accept`, {
        expectedDraftRevision: requiredDraft(draftingState).currentRevision,
      }, undefined, "POST");
      continue;
    }
    if (action.type === "save_and_interpret_change") {
      const draft = requiredDraft(draftingState);
      const saved = await jsonRequest<{ workspace: DraftingState; change: DraftChange }>(
        input, `/temporary-drafts/${conversationId}`, {
          expectedRevision: draft.currentRevision,
          body: action.replacement,
        }, undefined, "PUT",
      );
      draftingState = saved.workspace;
      await jsonRequest(input, `/temporary-drafts/${conversationId}/interpret-change`, {
        change: saved.change,
      }, operationId!, "POST");
      continue;
    }
    if (!hasAssistantStructuralChange) {
      throw new Error("Measurement structure scenario did not produce an autonomous merge or split.");
    }
    ideaMap = await applyStructuralCorrection(input, conversationId, ideaMap, action);
  }
}

async function applyStructuralCorrection(
  input: Parameters<typeof runJourney>[0],
  conversationId: string,
  ideaMap: IdeaMap,
  action: Extract<UsageMeasurementJourneyAction, { type: "apply_user_structural_correction" }>,
) {
  if (action.operation !== "split") throw new Error("The current matrix requires a split correction.");
  const idea = ideaMap.ideas.find((candidate) => candidate.substance.trim().split(/\s+/).length >= 2);
  if (!idea) throw new Error("Measurement split requires an Idea with divisible substance.");
  const words = idea.substance.trim().split(/\s+/);
  const midpoint = Math.ceil(words.length / 2);
  const result = await jsonRequest<{ ideaMap: IdeaMap }>(input, `/conversation/${conversationId}/idea-structure`, {
    type: "split",
    expectedRevision: ideaMap.revision,
    ideaId: idea.id,
    results: [
      { title: `${idea.title}: direction`, synthesis: idea.synthesis, substance: words.slice(0, midpoint).join(" "), unresolvedQuestions: idea.unresolvedQuestions, assistantAssessment: idea.assistantAssessment },
      { title: `${idea.title}: reliance`, synthesis: idea.synthesis, substance: words.slice(midpoint).join(" "), unresolvedQuestions: [], assistantAssessment: idea.assistantAssessment },
    ],
    explanation: "Keep the user's distinct meanings independently correctable.",
  }, undefined, "POST");
  return result.ideaMap;
}

async function streamRequest(
  input: { request: MountedRequest }, path: string,
  body: Record<string, unknown>, operationId: string,
) {
  const response = await input.request(`/products/thoughtform${path}`, {
    method: "POST",
    headers: headers(operationId),
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Measurement request failed (${response.status}): ${text}`);
  return text.split("\n").filter((line) => line.startsWith("data: "))
    .map((line) => decodeConversationStreamEvent(JSON.parse(line.slice(6))))
    .filter((event): event is MeasuredConversationStreamEvent => event !== null);
}

async function jsonRequest<T>(
  input: { request: MountedRequest }, path: string,
  body: Record<string, unknown>, operationId: string | undefined, method: string,
) {
  const response = await input.request(`/products/thoughtform${path}`, {
    method,
    headers: headers(operationId),
    body: JSON.stringify(body),
  });
  const payload = await response.json() as ApiResponse<T>;
  if (!response.ok || !payload.ok) throw new Error(`Measurement request failed (${response.status}).`);
  return payload.data;
}

function headers(operationId?: string) {
  return {
    "content-type": "application/json",
    ...(operationId ? { "Idempotency-Key": operationId } : {}),
  };
}

type MeasuredConversationStreamEvent = Extract<
  ConversationStreamEvent,
  { type: "accepted" | "idea_map_completed" }
>;

function eventOfType<T extends MeasuredConversationStreamEvent["type"]>(
  events: MeasuredConversationStreamEvent[],
  type: T,
): Extract<MeasuredConversationStreamEvent, { type: T }> {
  const event = events.find((candidate) => candidate.type === type);
  if (!event) throw new Error(`Measurement stream did not emit ${type}.`);
  return event as Extract<MeasuredConversationStreamEvent, { type: T }>;
}

function decodeConversationStreamEvent(value: unknown): MeasuredConversationStreamEvent | null {
  if (!isRecord(value) || typeof value.type !== "string") {
    throw new Error("Measurement stream emitted an invalid event.");
  }
  if (value.type === CONVERSATION_STREAM_EVENT_TYPES.accepted) {
    if (typeof value.conversationId !== "string") {
      throw new Error("Measurement stream emitted an invalid accepted event.");
    }
    return { type: value.type, conversationId: value.conversationId };
  }
  if (value.type === CONVERSATION_STREAM_EVENT_TYPES.ideaMapCompleted) {
    if (!isIdeaMap(value.ideaMap)) {
      throw new Error("Measurement stream emitted an invalid Idea Map event.");
    }
    return { type: value.type, ideaMap: value.ideaMap };
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isIdeaMap(value: unknown): value is IdeaMap {
  return isRecord(value) && Number.isInteger(value.revision) && Array.isArray(value.ideas);
}

function assertJourneyAttemptActions(
  attempts: Awaited<ReturnType<PrismaThoughtFormUsageMeasurementReader["readRun"]>>,
  scenario: typeof USAGE_MEASUREMENT_SCENARIOS[number],
  repetition: number,
) {
  const actual = attempts
    .filter((attempt) => attempt.scenarioId === scenario.id && attempt.repetition === repetition)
    .map((attempt) => attempt.action)
    .sort();
  const expected = expectedHostedActionsForScenario(scenario).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Measurement journey ${scenario.id}:${repetition} did not record its expected hosted operations.`);
  }
}

function requiredDraft(state: DraftingState | null) {
  if (!state?.draft) throw new Error("Measurement action requires a Draft.");
  return state.draft;
}

function isHostedAction(action: UsageMeasurementJourneyAction) {
  return action.type !== "apply_user_structural_correction";
}

function executionConfiguration() {
  const required = (name: string) => {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} is required for hosted usage measurement.`);
    return value;
  };
  const resumeAfter = process.env.USAGE_MEASUREMENT_RESUME_AFTER?.trim() || null;
  const validResumePoints = new Set(
    Array.from({ length: repetitions }, (_, index) =>
      measurementScenarios.map((scenario) => `${scenario.id}:${index + 1}`)
    ).flat(),
  );
  if (resumeAfter && !validResumePoints.has(resumeAfter)) {
    throw new Error("USAGE_MEASUREMENT_RESUME_AFTER does not identify a planned journey repetition.");
  }
  return {
    anthropicApiKey: required("ANTHROPIC_API_KEY"),
    databaseUrl: required("DATABASE_URL"),
    runId: required("USAGE_MEASUREMENT_RUN_ID"),
    costCeilingUsd: requiredPositiveNumber(costCeilingEnvironmentName),
    resumeAfter,
  };
}

type MountedRequest = (path: string, init: RequestInit) => Promise<Response>;

function createMountedMeasurementRequest(input: {
  anthropicApiKey: string;
  database: ReturnType<typeof createDatabaseClient>;
  userId: string;
}): MountedRequest {
  const client = new HostedAttemptUsageLlmClient(new ThoughtFormLlmClientAdapter(
    USAGE_MEASUREMENT_MODEL_PROFILE.provider,
    new AnthropicLlmClient({
      apiKey: input.anthropicApiKey,
      model: USAGE_MEASUREMENT_MODEL_PROFILE.model,
      effort: USAGE_MEASUREMENT_MODEL_PROFILE.effort,
    }),
  ));
  const conversationModel = new LlmConversationModelAdapter(client);
  const ideaMapModel = new LlmIdeaMapAnalysisModelAdapter(
    client,
    noOpObservability,
    USAGE_MEASUREMENT_MODEL_PROFILE.provider,
    USAGE_MEASUREMENT_MODEL_PROFILE.effort,
  );
  const conversationService = new ConversationService({
    conversationModel,
    promptProvider: fallbackThoughtFormPromptProvider,
  });
  const ideaMapAnalysis = new IdeaMapAnalysisService(
    ideaMapModel,
    fallbackThoughtFormPromptProvider,
  );
  const draftModel = new LlmDraftModelAdapter(client, fallbackThoughtFormPromptProvider);
  const interpretationModel = new LlmDraftChangeInterpretationModelAdapter(
    client,
    fallbackThoughtFormPromptProvider,
  );
  const conversations = createConversationStore(
    createInMemoryConversationPersistence({
      isTemporary: true,
      scheduleExpiration: (callback, delayMs) => {
        const timer = globalThis.setTimeout(callback, delayMs);
        timer.unref();
        return timer;
      },
    }),
    { shouldInitializeOnAppend: true },
  );
  const drafts = createDraftStore(createInMemoryDraftPersistence());
  const hostedAttempts = new HostedAttemptLifecycleAdapter(
    new PrismaThoughtFormHostedAttemptRecordStore(input.database, input.userId),
  );
  const route = createThoughtFormApiRoute({
    conversationService,
    streamingConversationService: conversationService,
    persistentConversationService: conversationService,
    persistentStreamingConversationService: conversationService,
    ideaMapAnalysis,
    persistentIdeaMapAnalysis: ideaMapAnalysis,
    compositionModel: draftModel,
    interpretationModel,
    proposalModel: draftModel,
    persistentCompositionModel: draftModel,
    persistentInterpretationModel: interpretationModel,
    persistentProposalModel: draftModel,
    getConversationStore: async () => conversations,
    getPersistentConversationStore: async () => conversations,
    getTemporaryConversationStore: async () => conversations,
    getPersistentDraftStore: async () => drafts,
    getTemporaryDraftStore: async () => drafts,
    getHostedAttemptLifecycle: async () => hostedAttempts,
  });
  const app = new Hono().route("/products/thoughtform", route);
  return async (path, init) => app.request(path, init);
}

function positiveInteger(value: string | undefined) {
  if (value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error("USAGE_MEASUREMENT_REPETITIONS must be a positive integer.");
  return parsed;
}

function positiveNumber(value: string | undefined) {
  if (value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function requiredPositiveNumber(name: string) {
  const value = positiveNumber(process.env[name]);
  if (value === null) throw new Error(`${name} must be an explicitly configured positive number.`);
  return value;
}
