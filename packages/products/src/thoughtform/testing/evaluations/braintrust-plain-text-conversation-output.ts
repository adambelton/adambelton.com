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
  parseConversationModelResponse,
  projectThoughtFormOutputSchema,
  THOUGHTFORM_AI_PROFILES,
  type ConversationModel,
  type ConversationModelRequest,
} from "packages/products/src/thoughtform/server";
import { createJsonStringFieldDeltaDecoder } from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-response-stream";
import {
  CONVERSATION_MESSAGE_ROLES,
  type ConversationMessage,
} from "packages/products/src/thoughtform/shared";
import {
  classifyDiagnosticCacheState,
} from "packages/products/src/thoughtform/testing/evaluations/cold-warm-latency-diagnostic";
import {
  CONVERSATION_OUTPUT_VARIANTS,
  getStructuredConversationContractIssues,
  parsePlainTextConversationOutput,
  replaceStructuredOutputContract,
  summariseConversationOutputMeasurements,
  PlainResponseDeltaDecoder,
  type ConversationOutputMeasurement,
  type ConversationOutputVariant,
} from "packages/products/src/thoughtform/testing/evaluations/plain-text-conversation-output";
import { HOSTED_CONVERSATION_EVALUATION_SCENARIOS } from "packages/products/src/thoughtform/testing/evaluations/scenarios";

const ENABLED_VALUE = "true";
const EFFORT = "medium";
const DEFAULT_REPETITIONS = 3;
const DEFAULT_CACHE_EXPIRY_WAIT_MS = 310_000;
const DEFAULT_INITIAL_CACHE_EXPIRY_WAIT_MS = 310_000;
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

const repetitions = readPositiveInteger(
  process.env.PLAIN_TEXT_REPETITIONS,
  DEFAULT_REPETITIONS,
  "PLAIN_TEXT_REPETITIONS",
);
const turnsPerSequence = readPositiveInteger(
  process.env.PLAIN_TEXT_TURNS_PER_SEQUENCE,
  scenario.turns.length,
  "PLAIN_TEXT_TURNS_PER_SEQUENCE",
);
if (turnsPerSequence > scenario.turns.length) {
  throw new Error(
    `PLAIN_TEXT_TURNS_PER_SEQUENCE cannot exceed ${scenario.turns.length}.`,
  );
}
const initialCacheExpiryWaitMs = readPositiveInteger(
  process.env.PLAIN_TEXT_INITIAL_CACHE_EXPIRY_WAIT_MS,
  DEFAULT_INITIAL_CACHE_EXPIRY_WAIT_MS,
  "PLAIN_TEXT_INITIAL_CACHE_EXPIRY_WAIT_MS",
);
const cacheExpiryWaitMs = readPositiveInteger(
  process.env.PLAIN_TEXT_CACHE_EXPIRY_WAIT_MS,
  DEFAULT_CACHE_EXPIRY_WAIT_MS,
  "PLAIN_TEXT_CACHE_EXPIRY_WAIT_MS",
);
const modelName = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;

await Eval(process.env.BRAINTRUST_PROJECT, {
  data: [{
    input: {
      scenarioId: scenario.id,
      turns: [...scenario.turns],
      repetitions,
      turnsPerSequence,
      initialCacheExpiryWaitMs,
      cacheExpiryWaitMs,
    },
    expected: {
      callsPerVariant: repetitions * turnsPerSequence,
      variants: Object.values(CONVERSATION_OUTPUT_VARIANTS),
    },
  }],
  experimentName: process.env.BRAINTRUST_EXPERIMENT,
  metadata: {
    evaluation: "thoughtform-plain-text-conversation-output",
    effort: EFFORT,
    model: modelName,
    provider: THOUGHTFORM_AI_PROFILES.anthropic,
    synthetic_content: true,
  },
  task: async () => runComparison(),
  scores: [
    ({ output, expected }) => ({
      name: "complete-paired-protocol",
      score: expected?.variants.every((variant) =>
        output.measurements.filter((measurement) =>
          measurement.variant === variant
        ).length === expected.callsPerVariant
      ) ? 1 : 0,
    }),
    ({ output }) => ({
      name: "structured-contract-validity",
      score: contractValidity(output, CONVERSATION_OUTPUT_VARIANTS.structured),
    }),
    ({ output }) => ({
      name: "plain-text-contract-validity",
      score: contractValidity(output, CONVERSATION_OUTPUT_VARIANTS.plainText),
    }),
    ...QUALITY_DIMENSIONS.flatMap((dimension) =>
      Object.values(CONVERSATION_OUTPUT_VARIANTS).map((variant) =>
        ({ output }: { output: ComparisonOutput }) => ({
          name: `${variant}-${toKebabCase(dimension)}`,
          score: average(
            output.sequences
              .filter((sequence) => sequence.variant === variant)
              .map((sequence) => sequence.quality[dimension] / 5),
          ),
        })
      )
    ),
  ],
  maxConcurrency: 1,
});

async function runComparison(): Promise<ComparisonOutput> {
  const measurements: ConversationOutputMeasurement[] = [];
  const sequences: SequenceResult[] = [];

  console.log(
    `Waiting ${initialCacheExpiryWaitMs}ms before the first paired repetition.`,
  );
  await wait(initialCacheExpiryWaitMs);

  for (let repetition = 1; repetition <= repetitions; repetition += 1) {
    const order = repetition % 2 === 1
      ? [
          CONVERSATION_OUTPUT_VARIANTS.structured,
          CONVERSATION_OUTPUT_VARIANTS.plainText,
        ]
      : [
          CONVERSATION_OUTPUT_VARIANTS.plainText,
          CONVERSATION_OUTPUT_VARIANTS.structured,
        ];
    const paired: SequenceWithoutQuality[] = [];
    for (const variant of order) {
      console.log(`Starting repetition ${repetition}/${repetitions}: ${variant}.`);
      const result = await runSequence({ repetition, variant });
      measurements.push(...result.measurements);
      paired.push(result);
    }
    for (const sequence of paired) {
      const quality = await judgeConversationQuality(sequence.turns);
      sequences.push({ ...sequence, quality });
    }
    if (repetition < repetitions) {
      console.log(
        `Waiting ${cacheExpiryWaitMs}ms after paired repetition ${repetition}.`,
      );
      await wait(cacheExpiryWaitMs);
    }
  }

  const summaries = {
    structured: summariseConversationOutputMeasurements(
      measurements.filter((measurement) =>
        measurement.variant === CONVERSATION_OUTPUT_VARIANTS.structured
      ),
    ),
    plainText: summariseConversationOutputMeasurements(
      measurements.filter((measurement) =>
        measurement.variant === CONVERSATION_OUTPUT_VARIANTS.plainText
      ),
    ),
  };
  console.table(measurements);
  console.table([
    { variant: CONVERSATION_OUTPUT_VARIANTS.structured, ...summaries.structured },
    { variant: CONVERSATION_OUTPUT_VARIANTS.plainText, ...summaries.plainText },
  ]);
  return { measurements, sequences, summaries };
}

async function runSequence(input: {
  repetition: number;
  variant: ConversationOutputVariant;
}): Promise<SequenceWithoutQuality> {
  const model = createMeasuredConversationModel(input);
  const service = new ConversationService({ conversationModel: model.conversation });
  const previousMessages: ConversationMessage[] = [];
  const turns: EvaluatedConversationTurn[] = [];

  for (const [index, userMessage] of scenario.turns.slice(0, turnsPerSequence).entries()) {
    const generation = await service.respond({
      conversationId: `evaluation-${input.repetition}-${input.variant}`,
      message: userMessage,
      previousMessages,
    });
    const measurement = model.takeMeasurement();
    if (!measurement) {
      throw new Error(`${input.variant} turn ${index + 1} had no measurement.`);
    }
    previousMessages.push(
      { role: CONVERSATION_MESSAGE_ROLES.user, content: userMessage },
      generation.message,
    );
    turns.push({
      turn: index + 1,
      userMessage,
      assistantMessage: generation.message.content,
      move: generation.move,
      assistantReadiness: generation.assistantReadiness,
      userIntention: generation.userIntention,
      contractIssues: measurement.contractIssues,
    });
  }
  return {
    repetition: input.repetition,
    variant: input.variant,
    turns,
    measurements: model.takeAllMeasurements(),
  };
}

function createMeasuredConversationModel(input: {
  repetition: number;
  variant: ConversationOutputVariant;
}) {
  const client = createClient();
  const measurements: ConversationOutputMeasurement[] = [];
  let mostRecent: ConversationOutputMeasurement | null = null;

  const conversation: ConversationModel = {
    async createResponse(request) {
      const measured = await measureConversationCall({
        client,
        request,
        repetition: input.repetition,
        turn: measurements.length + 1,
        variant: input.variant,
      });
      mostRecent = measured.measurement;
      measurements.push(measured.measurement);
      return { content: measured.canonicalContent };
    },
  };
  return {
    conversation,
    takeMeasurement() {
      const completed = mostRecent;
      mostRecent = null;
      return completed;
    },
    takeAllMeasurements() {
      return [...measurements];
    },
  };
}

async function measureConversationCall(input: {
  client: AnthropicLlmClient;
  request: ConversationModelRequest;
  repetition: number;
  turn: number;
  variant: ConversationOutputVariant;
}) {
  if (!input.client.streamMessage) {
    throw new Error("The comparison requires Anthropic streaming.");
  }
  const structured =
    input.variant === CONVERSATION_OUTPUT_VARIANTS.structured;
  const startedAt = globalThis.performance.now();
  const decoder = structured
    ? createJsonStringFieldDeltaDecoder("response")
    : new PlainResponseDeltaDecoder();
  let firstProviderTokenMs: number | null = null;
  let firstUsefulTextMs: number | null = null;
  let response: LlmResponse | null = null;

  for await (const event of input.client.streamMessage({
    maxTokens: input.request.maxOutputTokens,
    messages: input.request.messages,
    ...(structured
      ? {
          outputFormat: {
            ...input.request.outputFormat,
            schema: projectThoughtFormOutputSchema(
              THOUGHTFORM_AI_PROFILES.anthropic,
              input.request.outputFormat.schema,
            ),
          },
        }
      : {}),
    system: structured
      ? input.request.system
      : replaceStructuredOutputContract(input.request.system),
    context: input.request.context,
  })) {
    if (event.type === "text_delta") {
      firstProviderTokenMs ??= elapsed(startedAt);
      const text = decoder.push(event.text);
      if (text) {
        firstUsefulTextMs ??= elapsed(startedAt);
      }
    } else {
      response = event.response;
    }
  }
  if (!response) throw new Error("The comparison call did not complete.");
  const parsedPlain = structured
    ? null
    : parsePlainTextConversationOutput(response.content);
  const canonicalContent = structured
    ? response.content
    : parsedPlain!.canonicalContent;
  const canonical = parseConversationModelResponse(canonicalContent);
  const contractIssues = structured
    ? getStructuredConversationContractIssues(response.content)
    : parsedPlain!.issues;
  const measurement: ConversationOutputMeasurement = {
    variant: input.variant,
    repetition: input.repetition,
    turn: input.turn,
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
    contractIssues,
    model: response.model,
  };
  return { canonicalContent, measurement };
}

async function judgeConversationQuality(
  turns: readonly EvaluatedConversationTurn[],
): Promise<ConversationQuality> {
  const response = await createClient().createMessage({
    maxTokens: 1_200,
    system: `You are evaluating a conversational thinking assistant. Judge the complete transcript, not JSON validity. Score each dimension from 1 (poor) to 5 (excellent):
- empathy: grounded, humane attention without therapy language or flattery;
- nuance: preserves distinctions, uncertainty, and tensions rather than flattening them;
- continuity: each response follows the evolving conversation and does not reset;
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
      name: "thoughtform_conversation_quality",
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
  const parsed = JSON.parse(response.content) as ConversationQuality;
  return parsed;
}

function createClient() {
  return new AnthropicLlmClient({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    effort: EFFORT,
    model: modelName,
    decorateClient: wrapAnthropic,
  });
}

function contractValidity(output: ComparisonOutput, variant: ConversationOutputVariant) {
  const entries = output.measurements.filter((measurement) =>
    measurement.variant === variant
  );
  return entries.length === 0
    ? 0
    : entries.filter((entry) => entry.contractIssues.length === 0).length /
      entries.length;
}

function elapsed(startedAt: number) {
  return Math.round(globalThis.performance.now() - startedAt);
}

function average(values: readonly number[]) {
  return values.length === 0
    ? 0
    : values.reduce((total, value) => total + value, 0) / values.length;
}

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
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

interface EvaluatedConversationTurn {
  turn: number;
  userMessage: string;
  assistantMessage: string;
  move: string;
  assistantReadiness: unknown[];
  userIntention: string | null;
  contractIssues: string[];
}

interface ConversationQuality {
  empathy: number;
  nuance: number;
  continuity: number;
  relevance: number;
  questionQuality: number;
  rationale: string;
}

interface SequenceWithoutQuality {
  repetition: number;
  variant: ConversationOutputVariant;
  turns: EvaluatedConversationTurn[];
  measurements: ConversationOutputMeasurement[];
}

interface SequenceResult extends SequenceWithoutQuality {
  quality: ConversationQuality;
}

interface ComparisonOutput {
  measurements: ConversationOutputMeasurement[];
  sequences: SequenceResult[];
  summaries: {
    structured: ReturnType<typeof summariseConversationOutputMeasurements>;
    plainText: ReturnType<typeof summariseConversationOutputMeasurements>;
  };
}
