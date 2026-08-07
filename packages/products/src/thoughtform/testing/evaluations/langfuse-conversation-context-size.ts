import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { runLangfuseEvaluation } from "packages/products/src/thoughtform/testing/evaluations/langfuse-evaluation";
import { createLangfuseEvaluationPromptProvider } from "packages/products/src/thoughtform/testing/evaluations/langfuse-evaluation-prompt-provider";
import {
  AnthropicLlmClient,
  DEFAULT_ANTHROPIC_MODEL,
  type LlmResponse,
} from "packages/ai/src";
import {
  ConversationService,
  parseConversationModelResponse,
  projectThoughtFormOutputSchema,
  THOUGHTFORM_AI_PROFILES,
  type ConversationModel,
  type ConversationModelRequest,
} from "packages/products/src/thoughtform/server";
import { createJsonStringFieldDeltaDecoder } from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-response-stream";
import {
  CONVERSATION_MESSAGE_ROLES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  type ConversationMessage,
  type IdeaMap,
} from "packages/products/src/thoughtform/shared";
import { classifyDiagnosticCacheState } from "packages/products/src/thoughtform/testing/evaluations/cold-warm-latency-diagnostic";
import {
  applyConversationContextVariant,
  CONVERSATION_CONTEXT_VARIANTS,
  createBalancedContextVariantOrder,
  measureConversationPayloadBytes,
  type ConversationContextVariant,
  type ConversationPayloadBytes,
} from "packages/products/src/thoughtform/testing/evaluations/conversation-context-size";
import { getStructuredConversationContractIssues } from "packages/products/src/thoughtform/testing/evaluations/plain-text-conversation-output";
import { HOSTED_CONVERSATION_EVALUATION_SCENARIOS } from "packages/products/src/thoughtform/testing/evaluations/scenarios";

const ENABLED_VALUE = "true";
const EFFORT = "medium";
const DEFAULT_REPETITIONS = 3;
const DEFAULT_CACHE_EXPIRY_WAIT_MS = 310_000;
const QUALITY_DIMENSIONS = [
  "empathy",
  "nuance",
  "continuity",
  "relevance",
  "questionQuality",
] as const;
const scenario = HOSTED_CONVERSATION_EVALUATION_SCENARIOS.fifaAccountability;
const localEnvPath = fileURLToPath(
  new URL("../../../../../../.env.local", import.meta.url),
);

loadLocalEnvironment();
if (process.env.RUN_HOSTED_EVALUATIONS !== ENABLED_VALUE) {
  throw new Error("Set RUN_HOSTED_EVALUATIONS=true to acknowledge Claude usage and cost.");
}
if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required.");
if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY ||
  !process.env.LANGFUSE_BASE_URL) {
  throw new Error("Langfuse credentials and LANGFUSE_BASE_URL are required.");
}

const repetitions = readPositiveInteger(
  process.env.CONTEXT_SIZE_REPETITIONS,
  DEFAULT_REPETITIONS,
  "CONTEXT_SIZE_REPETITIONS",
);
const turnsPerSequence = readPositiveInteger(
  process.env.CONTEXT_SIZE_TURNS_PER_SEQUENCE,
  scenario.turns.length,
  "CONTEXT_SIZE_TURNS_PER_SEQUENCE",
);
if (turnsPerSequence > scenario.turns.length) {
  throw new Error(`CONTEXT_SIZE_TURNS_PER_SEQUENCE cannot exceed ${scenario.turns.length}.`);
}
const initialWaitMs = readPositiveInteger(
  process.env.CONTEXT_SIZE_INITIAL_CACHE_EXPIRY_WAIT_MS,
  DEFAULT_CACHE_EXPIRY_WAIT_MS,
  "CONTEXT_SIZE_INITIAL_CACHE_EXPIRY_WAIT_MS",
);
const betweenWaitMs = readPositiveInteger(
  process.env.CONTEXT_SIZE_CACHE_EXPIRY_WAIT_MS,
  DEFAULT_CACHE_EXPIRY_WAIT_MS,
  "CONTEXT_SIZE_CACHE_EXPIRY_WAIT_MS",
);
const modelName = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;
const promptProvider = createLangfuseEvaluationPromptProvider();

await runLangfuseEvaluation({
  data: [{
    input: {
      scenarioId: scenario.id,
      turns: [...scenario.turns],
      repetitions,
      turnsPerSequence,
      initialWaitMs,
      betweenWaitMs,
    },
    expected: {
      callsPerVariant: repetitions * turnsPerSequence,
      variants: Object.values(CONVERSATION_CONTEXT_VARIANTS),
    },
  }],
  experimentName: process.env.LANGFUSE_EXPERIMENT,
  metadata: {
    evaluation: "thoughtform-conversation-context-size",
    effort: EFFORT,
    model: modelName,
    provider: THOUGHTFORM_AI_PROFILES.anthropic,
    synthetic_content: true,
  },
  task: runComparison,
  scores: [
    ({ output, expected }) => ({
      name: "complete-balanced-protocol",
      score: expected?.variants.every((variant) =>
        output.measurements.filter((measurement) => measurement.variant === variant)
          .length === expected.callsPerVariant
      ) ? 1 : 0,
    }),
    ...Object.values(CONVERSATION_CONTEXT_VARIANTS).map((variant) =>
      ({ output }: { output: ComparisonOutput }) => ({
        name: `${variant}-contract-validity`,
        score: contractValidity(output, variant),
      })
    ),
    ...QUALITY_DIMENSIONS.flatMap((dimension) =>
      Object.values(CONVERSATION_CONTEXT_VARIANTS).map((variant) =>
        ({ output }: { output: ComparisonOutput }) => ({
          name: `${variant}-${toKebabCase(dimension)}`,
          score: average(output.sequences
            .filter((sequence) => sequence.variant === variant)
            .map((sequence) => sequence.quality[dimension] / 5)),
        })
      )
    ),
  ],
  maxConcurrency: 1,
});

async function runComparison(): Promise<ComparisonOutput> {
  const measurements: ContextMeasurement[] = [];
  const sequences: SequenceResult[] = [];
  console.log(`Waiting ${initialWaitMs}ms before the first repetition.`);
  await wait(initialWaitMs);
  for (let repetition = 1; repetition <= repetitions; repetition += 1) {
    for (const variant of createBalancedContextVariantOrder(repetition)) {
      console.log(`Starting repetition ${repetition}/${repetitions}: ${variant}.`);
      const result = await runSequence({ repetition, variant });
      measurements.push(...result.measurements);
      sequences.push({ ...result, quality: await judgeConversationQuality(result.turns) });
    }
    if (repetition < repetitions) {
      console.log(`Waiting ${betweenWaitMs}ms after repetition ${repetition}.`);
      await wait(betweenWaitMs);
    }
  }
  const summaries = Object.fromEntries(
    Object.values(CONVERSATION_CONTEXT_VARIANTS).map((variant) => [
      variant,
      summarise(measurements.filter((measurement) => measurement.variant === variant)),
    ]),
  ) as ComparisonOutput["summaries"];
  console.table(measurements);
  console.table(Object.entries(summaries).map(([variant, summary]) => ({ variant, ...summary })));
  return { measurements, sequences, summaries };
}

async function runSequence(input: {
  repetition: number;
  variant: ConversationContextVariant;
}): Promise<SequenceWithoutQuality> {
  const model = createMeasuredConversationModel(input);
  const service = new ConversationService({
    conversationModel: model.conversation,
    promptProvider,
  });
  const previousMessages: ConversationMessage[] = [];
  const turns: EvaluatedTurn[] = [];
  for (const [index, userMessage] of scenario.turns.slice(0, turnsPerSequence).entries()) {
    const generation = await service.respond({
      conversationId: `context-evaluation-${input.repetition}-${input.variant}`,
      message: userMessage,
      previousMessages,
      ideaMap: createProgressiveFifaIdeaMap(index),
    });
    const measurement = model.takeMeasurement();
    if (!measurement) throw new Error(`${input.variant} turn ${index + 1} had no measurement.`);
    previousMessages.push(
      { role: CONVERSATION_MESSAGE_ROLES.user, content: userMessage },
      generation.message,
    );
    turns.push({
      turn: index + 1,
      userMessage,
      assistantMessage: generation.message.content,
      contractIssues: measurement.contractIssues,
    });
  }
  return { repetition: input.repetition, variant: input.variant, turns, measurements: model.all() };
}

function createMeasuredConversationModel(input: {
  repetition: number;
  variant: ConversationContextVariant;
}) {
  const client = createClient();
  const measurements: ContextMeasurement[] = [];
  let mostRecent: ContextMeasurement | null = null;
  const conversation: ConversationModel = {
    async createResponse(request) {
      const selected = applyConversationContextVariant(request, input.variant);
      const result = await measureCall({
        client,
        request: selected,
        repetition: input.repetition,
        turn: measurements.length + 1,
        variant: input.variant,
      });
      mostRecent = result.measurement;
      measurements.push(result.measurement);
      return { content: result.content };
    },
  };
  return {
    conversation,
    takeMeasurement() {
      const result = mostRecent;
      mostRecent = null;
      return result;
    },
    all: () => [...measurements],
  };
}

async function measureCall(input: {
  client: AnthropicLlmClient;
  request: ConversationModelRequest;
  repetition: number;
  turn: number;
  variant: ConversationContextVariant;
}) {
  if (!input.client.streamMessage) throw new Error("Context evaluation requires streaming.");
  const startedAt = performance.now();
  const decoder = createJsonStringFieldDeltaDecoder("response");
  let firstProviderTokenMs: number | null = null;
  let firstUsefulTextMs: number | null = null;
  let response: LlmResponse | null = null;
  for await (const event of input.client.streamMessage({
    maxTokens: input.request.maxOutputTokens,
    messages: input.request.messages,
    outputFormat: {
      ...input.request.outputFormat,
      schema: projectThoughtFormOutputSchema(
        THOUGHTFORM_AI_PROFILES.anthropic,
        input.request.outputFormat.schema,
      ),
    },
    system: input.request.system,
    context: input.request.context,
  })) {
    if (event.type === "text_delta") {
      firstProviderTokenMs ??= elapsed(startedAt);
      if (decoder.push(event.text)) firstUsefulTextMs ??= elapsed(startedAt);
    } else response = event.response;
  }
  if (!response) throw new Error("Context evaluation call did not complete.");
  const canonical = parseConversationModelResponse(response.content);
  const payload = measureConversationPayloadBytes(input.request);
  return {
    content: response.content,
    measurement: {
      variant: input.variant,
      repetition: input.repetition,
      turn: input.turn,
      retainedHistoryMessages: Math.max(0, input.request.messages.length - 1),
      ...payload,
      firstProviderTokenMs: firstProviderTokenMs ?? elapsed(startedAt),
      firstUsefulTextMs: firstUsefulTextMs ?? elapsed(startedAt),
      completeMs: elapsed(startedAt),
      inputTokens: response.inputTokens ?? 0,
      outputTokens: response.outputTokens ?? 0,
      reasoningTokens: response.reasoningTokens ?? 0,
      cacheReadTokens: response.cacheReadTokens ?? 0,
      cacheWriteTokens: response.cacheWriteTokens ?? 0,
      outputCharacters: response.content.length,
      usefulCharacters: canonical.response.length,
      cacheState: classifyDiagnosticCacheState(response),
      contractIssues: getStructuredConversationContractIssues(response.content),
      model: response.model,
    },
  };
}

function createProgressiveFifaIdeaMap(completedTurnCount: number): IdeaMap {
  const priorUserMessages = scenario.turns.slice(0, completedTurnCount);
  if (priorUserMessages.length === 0) return { revision: 0, ideas: [] };
  return {
    revision: completedTurnCount,
    ideas: [{
      id: "fifa-accountability",
      title: "Football can reclaim FIFA through accountability",
      synthesis: priorUserMessages.at(-1)!,
      substance: priorUserMessages.join("\n\n"),
      unresolvedQuestions: [],
      assistantAssessment: {
        exploration: completedTurnCount < 4
          ? IDEA_EXPLORATION_ASSESSMENTS.emerging
          : completedTurnCount < 8
          ? IDEA_EXPLORATION_ASSESSMENTS.developing
          : IDEA_EXPLORATION_ASSESSMENTS.wellExplored,
        importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
      },
      userInterpretation: null,
      disposition: IDEA_DISPOSITIONS.focused,
    }],
  };
}

async function judgeConversationQuality(turns: readonly EvaluatedTurn[]): Promise<Quality> {
  const response = await createClient().createMessage({
    maxTokens: 1_200,
    system: `You are evaluating a conversational thinking assistant. Judge the complete transcript. Score each dimension from 1 (poor) to 5 (excellent):
- empathy: grounded, humane attention without therapy language or flattery;
- nuance: preserves distinctions, uncertainty, and tensions rather than flattening them;
- continuity: follows the evolving conversation and uses important earlier material accurately;
- relevance: directly serves the user's current material without tangents;
- questionQuality: asks at most one useful, non-leading question per turn.
Apply the same demanding standard to every transcript. Return only the supplied structured output.`,
    messages: [{
      role: "user",
      content: turns.map((turn) =>
        `Turn ${turn.turn}\nUser: ${turn.userMessage}\nAssistant: ${turn.assistantMessage}`
      ).join("\n\n"),
    }],
    outputFormat: {
      name: "thoughtform_context_quality",
      schema: {
        type: "object",
        properties: {
          empathy: { type: "integer", enum: [1, 2, 3, 4, 5] },
          nuance: { type: "integer", enum: [1, 2, 3, 4, 5] },
          continuity: { type: "integer", enum: [1, 2, 3, 4, 5] },
          relevance: { type: "integer", enum: [1, 2, 3, 4, 5] },
          questionQuality: { type: "integer", enum: [1, 2, 3, 4, 5] },
          rationale: { type: "string" },
        },
        required: [...QUALITY_DIMENSIONS, "rationale"],
        additionalProperties: false,
      },
    },
  });
  return JSON.parse(response.content) as Quality;
}

function summarise(entries: readonly ContextMeasurement[]) {
  return {
    calls: entries.length,
    usefulTtftMinimumMs: minimum(entries.map((entry) => entry.firstUsefulTextMs)),
    usefulTtftMaximumMs: maximum(entries.map((entry) => entry.firstUsefulTextMs)),
    medianProviderTtftMs: median(entries.map((entry) => entry.firstProviderTokenMs)),
    medianUsefulTtftMs: median(entries.map((entry) => entry.firstUsefulTextMs)),
    medianCompleteMs: median(entries.map((entry) => entry.completeMs)),
    medianProviderInputBytes: median(entries.map((entry) => entry.providerInput)),
    totalInputTokens: sum(entries.map((entry) => entry.inputTokens)),
    totalOutputTokens: sum(entries.map((entry) => entry.outputTokens)),
    totalCacheReadTokens: sum(entries.map((entry) => entry.cacheReadTokens)),
    totalCacheWriteTokens: sum(entries.map((entry) => entry.cacheWriteTokens)),
    contractFailures: entries.filter((entry) => entry.contractIssues.length > 0).length,
  };
}

function createClient() {
  return new AnthropicLlmClient({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    effort: EFFORT,
    model: modelName,
  });
}

function contractValidity(output: ComparisonOutput, variant: ConversationContextVariant) {
  const entries = output.measurements.filter((entry) => entry.variant === variant);
  return entries.length === 0 ? 0 : entries.filter((entry) => entry.contractIssues.length === 0).length / entries.length;
}

function elapsed(startedAt: number) { return Math.round(performance.now() - startedAt); }
function sum(values: readonly number[]) { return values.reduce((total, value) => total + value, 0); }
function average(values: readonly number[]) { return values.length ? sum(values) / values.length : 0; }
function minimum(values: readonly number[]) { return values.length ? Math.min(...values) : 0; }
function maximum(values: readonly number[]) { return values.length ? Math.max(...values) : 0; }
function median(values: readonly number[]) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : Math.round((sorted[middle - 1]! + sorted[middle]!) / 2);
}
function toKebabCase(value: string) { return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`); }
function wait(durationMs: number) { return new Promise<void>((resolve) => setTimeout(resolve, durationMs)); }
function readPositiveInteger(value: string | undefined, fallback: number, name: string) {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}
function loadLocalEnvironment() {
  if (!existsSync(localEnvPath)) return;
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));
  for (const [key, value] of Object.entries(localEnv)) process.env[key] ??= value;
}

interface ContextMeasurement extends ConversationPayloadBytes {
  variant: ConversationContextVariant;
  repetition: number;
  turn: number;
  retainedHistoryMessages: number;
  firstProviderTokenMs: number;
  firstUsefulTextMs: number;
  completeMs: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputCharacters: number;
  usefulCharacters: number;
  cacheState: "write" | "read" | "neither";
  contractIssues: string[];
  model: string;
}
interface EvaluatedTurn { turn: number; userMessage: string; assistantMessage: string; contractIssues: string[]; }
interface Quality { empathy: number; nuance: number; continuity: number; relevance: number; questionQuality: number; rationale: string; }
interface SequenceWithoutQuality { repetition: number; variant: ConversationContextVariant; turns: EvaluatedTurn[]; measurements: ContextMeasurement[]; }
interface SequenceResult extends SequenceWithoutQuality { quality: Quality; }
interface ComparisonOutput {
  measurements: ContextMeasurement[];
  sequences: SequenceResult[];
  summaries: Record<ConversationContextVariant, ReturnType<typeof summarise>>;
}
