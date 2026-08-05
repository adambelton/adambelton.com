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
  getProposedIdeaActionsValidationIssues,
  getProposedIdeasValidationIssues,
  projectThoughtFormOutputSchema,
  THOUGHTFORM_AI_PROFILES,
  type ConversationModel,
  type ConversationModelRequest,
} from "packages/products/src/thoughtform/server";
import { respondInWorkspace } from "packages/products/src/thoughtform/server/application/workspace";
import {
  EMPTY_IDEA_MAP,
  USER_INTENTIONS,
  type IdeaMap,
} from "packages/products/src/thoughtform/shared";
import {
  completeConversationScore,
  fifaConceptualCoverageScore,
  finalIntentionScore,
  firstPersonCanonicalMaterialScore,
  ideaIdentityContinuityScore,
  oneQuestionDisciplineScore,
  readinessContractScore,
  structuredOutputScore,
  unresolvedPracticalTensionScore,
  type EvaluatedFifaTurn,
  type FifaConversationEvaluation,
} from "packages/products/src/thoughtform/testing/evaluations/braintrust-fifa-scores";
import {
  summariseHostedConversationEvaluation,
  type HostedConversationTurnMetrics,
} from "packages/products/src/thoughtform/testing/evaluations/hosted-conversation-evaluation";
import { HOSTED_CONVERSATION_EVALUATION_SCENARIOS } from "packages/products/src/thoughtform/testing/evaluations/scenarios";
import { createTestConversationStore } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";

const ENABLED_VALUE = "true";
const EVALUATION_ANTHROPIC_EFFORT = "medium";
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
if (!process.env.BRAINTRUST_API_KEY) {
  throw new Error("BRAINTRUST_API_KEY is required.");
}
if (!process.env.BRAINTRUST_PROJECT) {
  throw new Error("BRAINTRUST_PROJECT is required.");
}

const modelName = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;
const client = new AnthropicLlmClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
  effort: EVALUATION_ANTHROPIC_EFFORT,
  model: modelName,
  decorateClient: wrapAnthropic,
});

await Eval(process.env.BRAINTRUST_PROJECT, {
  data: [{
    input: {
      scenarioId: scenario.id,
      description: scenario.description,
      turns: [...scenario.turns],
    },
    expected: {
      finalIntention: USER_INTENTIONS.reflect,
      minimumTurns: scenario.turns.length,
    },
  }],
  experimentName: process.env.BRAINTRUST_EXPERIMENT,
  metadata: {
    evaluation: "thoughtform-fifa-sustained-conversation",
    effort: EVALUATION_ANTHROPIC_EFFORT,
    model: modelName,
    provider: THOUGHTFORM_AI_PROFILES.anthropic,
    synthetic_content: true,
  },
  task: async (input) => runFifaConversation(input.turns, client),
  scores: [
    ({ output, expected }) => ({
      name: "complete-conversation",
      score: completeConversationScore(
        output,
        expected?.minimumTurns ?? scenario.turns.length,
      ),
    }),
    ({ output }) => ({
      name: "structured-output",
      score: structuredOutputScore(output),
    }),
    ({ output }) => ({
      name: "readiness-contract",
      score: readinessContractScore(output),
    }),
    ({ output, expected }) => ({
      name: "final-reflection-intention",
      score: finalIntentionScore(output, expected?.finalIntention),
    }),
    ({ output }) => ({
      name: "first-person-canonical-material",
      score: firstPersonCanonicalMaterialScore(output),
    }),
    ({ output }) => ({
      name: "idea-identity-continuity",
      score: ideaIdentityContinuityScore(output),
    }),
    ({ output }) => ({
      name: "fifa-conceptual-coverage",
      score: fifaConceptualCoverageScore(output),
    }),
    ({ output }) => ({
      name: "unresolved-practical-tension",
      score: unresolvedPracticalTensionScore(output),
    }),
    ({ output }) => ({
      name: "one-question-discipline",
      score: oneQuestionDisciplineScore(output),
    }),
  ],
  maxConcurrency: 1,
});

async function runFifaConversation(
  userMessages: readonly string[],
  llmClient: AnthropicLlmClient,
) {
  const model = createMeasuredConversationModel(llmClient);
  const conversationService = new ConversationService({ conversationModel: model });
  const conversations = createTestConversationStore();
  const conversationId = (await conversations.createConversation()).id;
  const turns: EvaluatedFifaTurn[] = [];
  let previousIdeaMap: IdeaMap = EMPTY_IDEA_MAP;

  for (const [index, userMessage] of userMessages.entries()) {
    const startedAt = Date.now();
    const result = await respondInWorkspace({
      conversationId,
      message: userMessage,
      conversation: conversationService,
      conversations,
    });
    const totalLatencyMs = Date.now() - startedAt;

    if (result.status !== "responded") {
      throw new Error(`FIFA turn ${index + 1} failed with ${result.status}.`);
    }

    const measurements = model.takeMeasurements();
    const finalMeasurement = measurements.at(-1);
    if (!finalMeasurement) {
      throw new Error(`FIFA turn ${index + 1} produced no model measurement.`);
    }
    const ideaMap = result.response.ideaMap ?? previousIdeaMap;
    const previousIds = new Set(previousIdeaMap.ideas.map((idea) => idea.id));
    const metrics: HostedConversationTurnMetrics = {
      turn: index + 1,
      totalLatencyMs,
      providerLatencyMs: sum(measurements, (entry) => entry.providerLatencyMs),
      inputTokens: sumOptional(measurements, (entry) => entry.response.inputTokens),
      outputTokens: sumOptional(measurements, (entry) => entry.response.outputTokens),
      reasoningTokens: sumOptional(
        measurements,
        (entry) => entry.response.reasoningTokens,
      ),
      cacheReadTokens: sumOptional(
        measurements,
        (entry) => entry.response.cacheReadTokens,
      ),
      cacheWriteTokens: sumOptional(
        measurements,
        (entry) => entry.response.cacheWriteTokens,
      ),
      outputCharacters: finalMeasurement.response.content.length,
      model: finalMeasurement.response.model,
      mapRevision: ideaMap.revision,
      ideaCount: ideaMap.ideas.length,
      retainedIdeaCount: ideaMap.ideas.filter((idea) => previousIds.has(idea.id))
        .length,
      totalSynthesisCharacters: ideaMap.ideas.reduce(
        (total, idea) => total + idea.synthesis.length,
        0,
      ),
      totalSubstanceCharacters: ideaMap.ideas.reduce(
        (total, idea) => total + idea.substance.length,
        0,
      ),
    };

    turns.push({
      turn: index + 1,
      userMessage,
      response: result.response,
      rawModelOutputs: measurements.map((entry) => entry.response.content),
      repairCalls: Math.max(0, measurements.length - 1),
      validationIssues: getStructuredOutputValidationIssues(
        finalMeasurement.response.content,
      ),
      ideaMap,
      metrics,
    });
    previousIdeaMap = ideaMap;
  }

  return {
    scenarioId: scenario.id,
    turns,
    finalIdeaMap: previousIdeaMap,
    summary: summariseHostedConversationEvaluation(
      turns.map((turn) => turn.metrics),
    ),
    totalModelCalls: turns.reduce(
      (total, turn) => total + 1 + turn.repairCalls,
      0,
    ),
  } satisfies FifaConversationEvaluation;
}

type ModelMeasurement = {
  providerLatencyMs: number;
  response: LlmResponse;
};

type MeasuredConversationModel = ConversationModel & {
  takeMeasurements(): ModelMeasurement[];
};

function createMeasuredConversationModel(
  llmClient: AnthropicLlmClient,
): MeasuredConversationModel {
  let measurements: ModelMeasurement[] = [];
  return {
    async createResponse(request: ConversationModelRequest) {
      const startedAt = Date.now();
      const response = await llmClient.createMessage({
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
      });
      measurements.push({
        providerLatencyMs: Date.now() - startedAt,
        response,
      });
      return { content: response.content };
    },
    takeMeasurements() {
      const completed = measurements;
      measurements = [];
      return completed;
    },
  };
}

function getStructuredOutputValidationIssues(content: string): string[] {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return [
      ...getProposedIdeasValidationIssues(parsed.proposedIdeas),
      ...getProposedIdeaActionsValidationIssues(parsed.ideaActions),
    ];
  } catch {
    return ["model output is not valid JSON"];
  }
}

function sum<T>(values: T[], select: (value: T) => number) {
  return values.reduce((total, value) => total + select(value), 0);
}

function sumOptional<T>(
  values: T[],
  select: (value: T) => number | undefined,
) {
  const present = values.map(select).filter((value): value is number => value !== undefined);
  return present.length === 0
    ? null
    : present.reduce((total, value) => total + value, 0);
}

function loadLocalEnvironment() {
  if (!existsSync(localEnvPath)) return;
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));
  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value;
  }
}
