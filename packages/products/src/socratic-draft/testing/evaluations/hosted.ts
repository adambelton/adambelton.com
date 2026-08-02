import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import {
  DEFAULT_OPENAI_MODEL,
  OpenAiLlmClient,
  type LlmResponse,
} from "packages/ai/src";
import {
  ConversationService,
  type ConversationModel,
  type ConversationModelRequest,
  getProposedIdeaActionsValidationIssues,
  getProposedIdeasValidationIssues,
} from "packages/products/src/socratic-draft/server";
import { respondInWorkspace } from "packages/products/src/socratic-draft/server/workspace";
import {
  EMPTY_IDEA_MAP,
  type IdeaMap,
} from "packages/products/src/socratic-draft/shared";
import {
  summariseHostedConversationEvaluation,
  type HostedConversationTurnMetrics,
} from "packages/products/src/socratic-draft/testing/evaluations/hosted-conversation-evaluation";
import { HOSTED_CONVERSATION_EVALUATION_SCENARIOS } from "packages/products/src/socratic-draft/testing/evaluations/scenarios";
import { TestConversationStore } from "packages/products/src/socratic-draft/testing/test-conversation-store";

const HOSTED_EVALUATION_ENABLED_VALUE = "true";
const localEnvPath = fileURLToPath(
  new URL("../../../../../../.env.local", import.meta.url),
);

loadLocalEnvironment();

if (process.env.RUN_HOSTED_EVALUATIONS !== HOSTED_EVALUATION_ENABLED_VALUE) {
  throw new Error(
    "Hosted evaluation is disabled. Set RUN_HOSTED_EVALUATIONS=true to acknowledge model usage and cost.",
  );
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required for hosted evaluation.");
}

const scenario = HOSTED_CONVERSATION_EVALUATION_SCENARIOS.fifaAccountability;
const includeContent =
  process.env.EVALUATION_INCLUDE_CONTENT === HOSTED_EVALUATION_ENABLED_VALUE;
const maximumTurns = parseMaximumTurns(process.env.EVALUATION_MAX_TURNS);
const model = createMeasuredConversationModel(
  new OpenAiLlmClient({
    apiKey,
    model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
  }),
);
const conversationService = new ConversationService({ conversationModel: model });
const conversations = new TestConversationStore();
const conversationId = conversations.createConversationId();
const turnMetrics: HostedConversationTurnMetrics[] = [];
let previousIdeaMap: IdeaMap = EMPTY_IDEA_MAP;

console.log(`Scenario: ${scenario.id}`);
console.log(scenario.description);
console.log(`Model: ${process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL}`);
console.log(`Turns: ${Math.min(maximumTurns, scenario.turns.length)}`);

for (const [index, message] of scenario.turns.slice(0, maximumTurns).entries()) {
  const startedAt = Date.now();
  const result = await respondInWorkspace({
    conversationId,
    message,
    conversation: conversationService,
    conversations,
  });
  const totalLatencyMs = Date.now() - startedAt;

  if (result.status !== "responded") {
    throw new Error(`Turn ${index + 1} failed with status ${result.status}.`);
  }

  const measurement = model.takeMeasurement();
  const validationIssues = getStructuredOutputValidationIssues(
    measurement.response.content,
  );
  const ideaMap = result.response.ideaMap ?? previousIdeaMap;
  const previousIds = new Set(previousIdeaMap.ideas.map((idea) => idea.id));
  const metrics: HostedConversationTurnMetrics = {
    turn: index + 1,
    totalLatencyMs,
    providerLatencyMs: measurement.providerLatencyMs,
    inputTokens: measurement.response.inputTokens ?? null,
    outputTokens: measurement.response.outputTokens ?? null,
    reasoningTokens: measurement.response.reasoningTokens ?? null,
    outputCharacters: measurement.response.content.length,
    model: measurement.response.model,
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

  turnMetrics.push(metrics);
  console.table([metrics]);
  if (validationIssues.length > 0) {
    console.log("Validation issues:");
    console.log(validationIssues.join("\n"));
  }
  if (includeContent) {
    console.log(`User: ${message}`);
    console.log(`Raw model output: ${measurement.response.content}`);
    console.log(`Assistant: ${result.response.message.content}`);
    console.dir(ideaMap, { depth: null });
  }
  previousIdeaMap = ideaMap;
}

console.log("Summary");
console.table([summariseHostedConversationEvaluation(turnMetrics)]);

interface ModelMeasurement {
  providerLatencyMs: number;
  response: LlmResponse;
}

interface MeasuredConversationModel extends ConversationModel {
  takeMeasurement(): ModelMeasurement;
}

function createMeasuredConversationModel(
  client: OpenAiLlmClient,
): MeasuredConversationModel {
  let measurement: ModelMeasurement | null = null;
  return {
    async createResponse(request: ConversationModelRequest) {
      const startedAt = Date.now();
      const response = await client.createMessage({
        maxTokens: request.maxOutputTokens,
        messages: request.messages,
        outputFormat: request.outputFormat,
        system: request.system,
      });
      measurement = {
        providerLatencyMs: Date.now() - startedAt,
        response,
      };
      return { content: response.content };
    },
    takeMeasurement() {
      if (!measurement) {
        throw new Error("The model call did not produce evaluation metrics.");
      }
      const completedMeasurement = measurement;
      measurement = null;
      return completedMeasurement;
    },
  };
}

function loadLocalEnvironment() {
  if (!existsSync(localEnvPath)) return;
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));
  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value;
  }
}

function parseMaximumTurns(value: string | undefined) {
  if (value === undefined) return Number.POSITIVE_INFINITY;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("EVALUATION_MAX_TURNS must be a positive integer.");
  }
  return parsed;
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
