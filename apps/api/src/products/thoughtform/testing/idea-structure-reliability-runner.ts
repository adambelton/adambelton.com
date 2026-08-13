import { AnthropicLlmClient, type LlmClient, type LlmRequest, type LlmResponse } from "packages/ai/src";
import { loadLocalEnvironment } from "apps/api/src/bootstrap/local-environment";
import { LlmIdeaMapAnalysisModelAdapter } from "apps/api/src/products/thoughtform/adapters/ai/idea-map-analysis-model-adapter";
import { ThoughtFormLlmClientAdapter } from "apps/api/src/products/thoughtform/adapters/ai/thoughtform-llm-client-adapter";
import { estimateAnthropicUsageCost, type AnthropicUsageForCost } from "apps/api/src/products/thoughtform/testing/anthropic-usage-cost";
import { noOpObservability } from "packages/observability/src";
import { IdeaMapAnalysisService } from "packages/products/src/thoughtform/server/capabilities/idea-map";
import { fallbackThoughtFormPromptProvider } from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";
import {
  IDEA_STRUCTURE_RELIABILITY_SCENARIOS,
  observeIdeaStructureReliability,
  summariseIdeaStructureReliability,
  type IdeaStructureReliabilityObservation,
} from "packages/products/src/thoughtform/testing/evaluations/idea-structure-reliability";
import { USAGE_MEASUREMENT_MODEL_PROFILE } from "packages/products/src/thoughtform/testing/evaluations/usage-measurement-scenarios";

class UsageRecordingLlmClient implements LlmClient {
  constructor(
    private readonly delegate: LlmClient,
    private readonly usage: AnthropicUsageForCost[],
  ) {}

  async createMessage(request: LlmRequest): Promise<LlmResponse> {
    const response = await this.delegate.createMessage(request);
    this.usage.push({
      inputTokens: response.inputTokens ?? null,
      outputTokens: response.outputTokens ?? null,
      cacheReadTokens: response.cacheReadTokens ?? null,
      cacheWriteTokens: response.cacheWriteTokens ?? null,
    });
    return response;
  }
}

loadLocalEnvironment();

const executionAcknowledgement = "RUN_HOSTED_IDEA_STRUCTURE_RELIABILITY";
const costLimitEnvironmentName = "IDEA_STRUCTURE_RELIABILITY_COST_LIMIT_USD";
const repetitions = positiveInteger(process.env.IDEA_STRUCTURE_RELIABILITY_REPETITIONS) ?? 3;
const configuredCostLimit = positiveNumber(process.env[costLimitEnvironmentName]);
const prices = { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 } as const;
const evaluationScope = process.env.IDEA_STRUCTURE_RELIABILITY_SCOPE?.trim() || "all";
const scenarios = evaluationScope === "expected-changes"
  ? IDEA_STRUCTURE_RELIABILITY_SCENARIOS.filter((scenario) => scenario.expectedStructure !== "none")
  : [...IDEA_STRUCTURE_RELIABILITY_SCENARIOS];
if (evaluationScope !== "all" && evaluationScope !== "expected-changes") {
  throw new Error("IDEA_STRUCTURE_RELIABILITY_SCOPE must be all or expected-changes.");
}
const plan = {
  mode: "plan",
  modelProfile: USAGE_MEASUREMENT_MODEL_PROFILE,
  evaluationScope,
  scenarioCount: scenarios.length,
  repetitions,
  expectedHostedCallCount: scenarios.length * repetitions,
  categories: Object.fromEntries(["merge", "split", "control", "correction"].map((category) => [
    category,
    scenarios.filter((scenario) => scenario.category === category).length,
  ])),
  scenarioIds: scenarios.map((scenario) => scenario.id),
  estimatedCostLimitUsd: configuredCostLimit,
  pricing: {
    checkedAt: "2026-08-13",
    validThrough: "2026-08-31",
    inputPerMillion: 2,
    outputPerMillion: 10,
    cacheReadPerMillion: 0.2,
    cacheWritePerMillion: 2.5,
  },
  executionRequires: [executionAcknowledgement, costLimitEnvironmentName],
};

if (process.env[executionAcknowledgement] !== "true") {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}

const apiKey = required("ANTHROPIC_API_KEY");
const costLimit = requiredPositiveNumber(costLimitEnvironmentName);
const usage: AnthropicUsageForCost[] = [];
const client = new UsageRecordingLlmClient(
  new ThoughtFormLlmClientAdapter(
    USAGE_MEASUREMENT_MODEL_PROFILE.provider,
    new AnthropicLlmClient({
      apiKey,
      model: USAGE_MEASUREMENT_MODEL_PROFILE.model,
      effort: USAGE_MEASUREMENT_MODEL_PROFILE.effort,
    }),
  ),
  usage,
);
const model = new LlmIdeaMapAnalysisModelAdapter(
  client,
  noOpObservability,
  USAGE_MEASUREMENT_MODEL_PROFILE.provider,
  USAGE_MEASUREMENT_MODEL_PROFILE.effort,
);
const service = new IdeaMapAnalysisService(model, fallbackThoughtFormPromptProvider);
const observations: IdeaStructureReliabilityObservation[] = [];

for (let repetition = 1; repetition <= repetitions; repetition += 1) {
  for (const scenario of scenarios) {
    const analysis = await service.analyse({
      message: scenario.message,
      previousMessages: scenario.previousMessages,
      ideaMap: scenario.ideaMap,
    });
    observations.push(observeIdeaStructureReliability({
      scenario,
      repetition,
      proposal: analysis.proposedStructure ?? null,
    }));
    const estimatedCost = estimateAnthropicUsageCost(usage, prices);
    if (estimatedCost > costLimit) {
      throw new Error(`Idea Map reliability estimated-cost limit exceeded: $${estimatedCost.toFixed(4)} USD.`);
    }
    console.log(`Completed ${scenario.id} repetition ${repetition}; estimated usage cost $${estimatedCost.toFixed(4)} USD.`);
  }
}

console.log(JSON.stringify({
  measuredAt: new Date().toISOString(),
  modelProfile: USAGE_MEASUREMENT_MODEL_PROFILE,
  estimatedCostUsd: estimateAnthropicUsageCost(usage, prices),
  ...summariseIdeaStructureReliability(observations),
}, null, 2));

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for the hosted reliability evaluation.`);
  return value;
}

function positiveInteger(value: string | undefined) {
  if (value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("IDEA_STRUCTURE_RELIABILITY_REPETITIONS must be a positive integer.");
  }
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
