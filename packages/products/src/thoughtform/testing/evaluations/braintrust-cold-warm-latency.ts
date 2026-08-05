import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { Eval, wrapAnthropic } from "braintrust";
import {
  AnthropicLlmClient,
  DEFAULT_ANTHROPIC_MODEL,
  type LlmResponse,
} from "packages/ai/src";
import {
  ConversationService,
  IdeaMapAnalysisService,
  projectThoughtFormOutputSchema,
  THOUGHTFORM_AI_PROFILES,
  type ConversationModel,
  type ConversationModelRequest,
  type IdeaMapAnalysisModel,
  type IdeaMapAnalysisModelRequest,
} from "packages/products/src/thoughtform/server";
import { respondInWorkspace } from "packages/products/src/thoughtform/server/application/workspace";
import { HOSTED_CONVERSATION_EVALUATION_SCENARIOS } from "packages/products/src/thoughtform/testing/evaluations/scenarios";
import { createTestConversationStore } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";
import {
  classifyDiagnosticCacheState,
  DIAGNOSTIC_CLIENT_STATES,
  findColdWarmProtocolIssues,
  summariseColdWarmLatencyDiagnostic,
  type DiagnosticClientState,
  type DiagnosticOperationMeasurement,
  type DiagnosticTurnMeasurement,
} from "packages/products/src/thoughtform/testing/evaluations/cold-warm-latency-diagnostic";

const ENABLED_VALUE = "true";
const EFFORT = "medium";
const DEFAULT_SEQUENCE_COUNT = 3;
const DEFAULT_TURNS_PER_SEQUENCE = 3;
const DEFAULT_CACHE_EXPIRY_WAIT_MS = 310_000;
const DEFAULT_INITIAL_CACHE_EXPIRY_WAIT_MS = 310_000;
const localEnvPath = fileURLToPath(
  new URL("../../../../../../.env.local", import.meta.url),
);
const scenario = HOSTED_CONVERSATION_EVALUATION_SCENARIOS.fifaAccountability;

loadLocalEnvironment();

if (process.env.RUN_HOSTED_EVALUATIONS !== ENABLED_VALUE) {
  throw new Error(
    "Set RUN_HOSTED_EVALUATIONS=true to acknowledge Claude model usage and cost.",
  );
}
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is required.");
}
if (!process.env.BRAINTRUST_API_KEY || !process.env.BRAINTRUST_PROJECT) {
  throw new Error("BRAINTRUST_API_KEY and BRAINTRUST_PROJECT are required.");
}

const sequenceCount = readPositiveInteger(
  process.env.COLD_WARM_SEQUENCE_COUNT,
  DEFAULT_SEQUENCE_COUNT,
  "COLD_WARM_SEQUENCE_COUNT",
);
const turnsPerSequence = readPositiveInteger(
  process.env.COLD_WARM_TURNS_PER_SEQUENCE,
  DEFAULT_TURNS_PER_SEQUENCE,
  "COLD_WARM_TURNS_PER_SEQUENCE",
);
const cacheExpiryWaitMs = readPositiveInteger(
  process.env.COLD_WARM_CACHE_EXPIRY_WAIT_MS,
  DEFAULT_CACHE_EXPIRY_WAIT_MS,
  "COLD_WARM_CACHE_EXPIRY_WAIT_MS",
);
const initialCacheExpiryWaitMs = readPositiveInteger(
  process.env.COLD_WARM_INITIAL_CACHE_EXPIRY_WAIT_MS,
  DEFAULT_INITIAL_CACHE_EXPIRY_WAIT_MS,
  "COLD_WARM_INITIAL_CACHE_EXPIRY_WAIT_MS",
);
const modelName = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;

await Eval(process.env.BRAINTRUST_PROJECT, {
  data: [{
    input: {
      scenarioId: scenario.id,
      sequenceCount,
      turnsPerSequence,
      cacheExpiryWaitMs,
      initialCacheExpiryWaitMs,
    },
    expected: {
      minimumColdToWarmTurns: sequenceCount * turnsPerSequence,
      freshClientWarmCacheComparisons: 1,
    },
  }],
  experimentName: process.env.BRAINTRUST_EXPERIMENT,
  metadata: {
    evaluation: "thoughtform-cold-warm-latency",
    effort: EFFORT,
    model: modelName,
    provider: THOUGHTFORM_AI_PROFILES.anthropic,
    synthetic_content: true,
  },
  task: async () => runDiagnostic(),
  scores: [
    ({ output, expected }) => ({
      name: "complete-cold-warm-protocol",
      score:
        output.turns.filter((turn) => turn.condition === "cold_to_warm").length >=
          (expected?.minimumColdToWarmTurns ?? 0) &&
        output.turns.filter(
          (turn) => turn.condition === "fresh_client_warm_cache",
        ).length >= (expected?.freshClientWarmCacheComparisons ?? 0)
          ? 1
          : 0,
    }),
  ],
  maxConcurrency: 1,
});

async function runDiagnostic() {
  const turns: DiagnosticTurnMeasurement[] = [];

  console.log(
    `Waiting ${initialCacheExpiryWaitMs}ms before sequence 1 so prior cache activity cannot be mislabeled as cold.`,
  );
  await wait(initialCacheExpiryWaitMs);

  for (let sequence = 1; sequence <= sequenceCount; sequence += 1) {
    console.log(`Starting cold-to-warm sequence ${sequence}/${sequenceCount}.`);
    turns.push(...await runSequence({ sequence, turns: turnsPerSequence }));

    if (sequence === 1) {
      console.log("Starting fresh-client comparison inside the warm cache lifetime.");
      turns.push(await runFreshClientWarmCacheComparison());
    }

    if (sequence < sequenceCount) {
      console.log(
        `Waiting ${cacheExpiryWaitMs}ms after the last cache access before sequence ${sequence + 1}.`,
      );
      await wait(cacheExpiryWaitMs);
    }
  }

  const summary = summariseColdWarmLatencyDiagnostic(turns);
  const protocolIssues = findColdWarmProtocolIssues(turns);
  if (protocolIssues.length > 0) {
    throw new Error(
      `Provider cache counters contradicted the diagnostic labels: ${JSON.stringify(protocolIssues)}`,
    );
  }
  console.table(turns.flatMap(flattenTurn));
  console.table([summary]);
  return { turns, summary };
}

async function runSequence(input: { sequence: number; turns: number }) {
  const client = createClient();
  return runConversation({
    client,
    sequence: input.sequence,
    turnCount: input.turns,
    condition: "cold_to_warm",
  });
}

async function runFreshClientWarmCacheComparison() {
  const [measurement] = await runConversation({
    client: createClient(),
    sequence: 1,
    turnCount: 1,
    condition: "fresh_client_warm_cache",
  });
  if (!measurement) throw new Error("Fresh-client comparison produced no turn.");
  return measurement;
}

async function runConversation(input: {
  client: AnthropicLlmClient;
  sequence: number;
  turnCount: number;
  condition: DiagnosticTurnMeasurement["condition"];
}) {
  const measuredModels = createMeasuredStreamingModels(input.client);
  const conversationService = new ConversationService({
    conversationModel: measuredModels.conversation,
  });
  const ideaMapAnalysis = new IdeaMapAnalysisService(measuredModels.ideaMap);
  const conversations = createTestConversationStore();
  const conversationId = (await conversations.createConversation()).id;
  const turns: DiagnosticTurnMeasurement[] = [];

  for (let turn = 1; turn <= input.turnCount; turn += 1) {
    measuredModels.setClientState(
      turn === 1
        ? DIAGNOSTIC_CLIENT_STATES.fresh
        : DIAGNOSTIC_CLIENT_STATES.reused,
    );
    const startedAt = globalThis.performance.now();
    const result = await respondInWorkspace({
      conversationId,
      message: scenario.turns[turn - 1]!,
      conversation: conversationService,
      ideaMapAnalysis,
      conversations,
    });
    const totalMs = Math.round(globalThis.performance.now() - startedAt);
    if (result.status !== "responded") {
      throw new Error(
        `Sequence ${input.sequence} turn ${turn} failed with ${result.status}.`,
      );
    }
    const operations = measuredModels.takeMeasurements();
    const conversation = operations.find(
      (operation) => operation.operation === "conversation",
    );
    const ideaMap = operations.find(
      (operation) => operation.operation === "idea_map",
    );
    if (!conversation || !ideaMap) {
      throw new Error(
        `Sequence ${input.sequence} turn ${turn} did not complete both provider calls.`,
      );
    }
    turns.push({
      sequence: input.sequence,
      turn,
      condition: input.condition,
      totalMs,
      conversation,
      ideaMap,
      ideaMapRevision: result.response.ideaMap?.revision ?? 0,
      ideaCount: result.response.ideaMap?.ideas.length ?? 0,
    });
  }
  return turns;
}

function createMeasuredStreamingModels(client: AnthropicLlmClient) {
  let clientState: DiagnosticClientState = DIAGNOSTIC_CLIENT_STATES.fresh;
  let measurements: DiagnosticOperationMeasurement[] = [];

  async function measure(
    operation: DiagnosticOperationMeasurement["operation"],
    request: ConversationModelRequest | IdeaMapAnalysisModelRequest,
  ) {
    if (!client.streamMessage) {
      throw new Error("The Anthropic diagnostic requires provider streaming.");
    }
    const startedAt = globalThis.performance.now();
    let firstTokenMs: number | null = null;
    let response: LlmResponse | null = null;
    for await (const event of client.streamMessage({
      maxTokens: request.maxOutputTokens,
      messages: request.messages,
      outputFormat: {
        ...request.outputFormat,
        schema: projectThoughtFormOutputSchema(
          THOUGHTFORM_AI_PROFILES.anthropic,
          request.outputFormat.schema,
        ),
      },
      system: request.system,
      context: request.context,
    })) {
      if (event.type === "text_delta") {
        firstTokenMs ??= Math.round(globalThis.performance.now() - startedAt);
      } else {
        response = event.response;
      }
    }
    if (!response) throw new Error(`${operation} did not complete.`);
    const completeMs = Math.round(globalThis.performance.now() - startedAt);
    const measurement: DiagnosticOperationMeasurement = {
      operation,
      clientState,
      cacheState: classifyDiagnosticCacheState(response),
      firstTokenMs: firstTokenMs ?? completeMs,
      completeMs,
      inputTokens: response.inputTokens ?? 0,
      outputTokens: response.outputTokens ?? 0,
      reasoningTokens: response.reasoningTokens ?? 0,
      cacheReadTokens: response.cacheReadTokens ?? 0,
      cacheWriteTokens: response.cacheWriteTokens ?? 0,
      outputCharacters: response.content.length,
      model: response.model,
    };
    measurements.push(measurement);
    return { content: response.content };
  }

  const conversation: ConversationModel = {
    createResponse: (request) => measure("conversation", request),
  };
  const ideaMap: IdeaMapAnalysisModel = {
    createAnalysis: (request) => measure("idea_map", request),
  };
  return {
    conversation,
    ideaMap,
    setClientState(nextState: DiagnosticClientState) {
      clientState = nextState;
    },
    takeMeasurements() {
      const completed = measurements;
      measurements = [];
      return completed;
    },
  };
}

function createClient() {
  return new AnthropicLlmClient({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    effort: EFFORT,
    model: modelName,
    decorateClient: wrapAnthropic,
  });
}

function flattenTurn(turn: DiagnosticTurnMeasurement) {
  return [turn.conversation, turn.ideaMap].map((operation) => ({
    sequence: turn.sequence,
    turn: turn.turn,
    condition: turn.condition,
    ...operation,
  }));
}

function readPositiveInteger(
  value: string | undefined,
  fallback: number,
  name: string,
) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function wait(durationMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, durationMs));
}

function loadLocalEnvironment() {
  if (!existsSync(localEnvPath)) return;
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));
  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value;
  }
}
