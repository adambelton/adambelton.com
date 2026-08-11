import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import {
  AnthropicLlmClient,
  DEFAULT_ANTHROPIC_MODEL,
} from "packages/ai/src";
import {
  applyIdeaStructure,
  IDEA_MAP_UPDATE_STATUSES,
  IdeaMapAnalysisService,
} from "packages/products/src/thoughtform/server/capabilities/idea-map";
import {
  IDEA_DISPOSITIONS,
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_OPERATION_TYPES,
  type Idea,
  type IdeaMap,
  type IdeaStructureOperationType,
} from "packages/products/src/thoughtform/shared";
import {
  projectThoughtFormOutputSchema,
  THOUGHTFORM_AI_PROFILES,
} from "packages/products/src/thoughtform/server/capabilities/hosted-ai-profile";
import { createLangfuseEvaluationPromptProvider } from "packages/products/src/thoughtform/testing/evaluations/langfuse-evaluation-prompt-provider";
import { runLangfuseEvaluation } from "packages/products/src/thoughtform/testing/evaluations/langfuse-evaluation";

const ENABLED_VALUE = "true";
const EFFORT = "medium";
const localEnvPath = fileURLToPath(new URL("../../../../../../.env.local", import.meta.url));

if (existsSync(localEnvPath)) Object.assign(process.env, parseEnv(readFileSync(localEnvPath, "utf8")));
if (process.env.RUN_HOSTED_EVALUATIONS !== ENABLED_VALUE) {
  throw new Error("Set RUN_HOSTED_EVALUATIONS=true to acknowledge Claude model usage and cost.");
}
if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required.");
if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY || !process.env.LANGFUSE_BASE_URL) {
  throw new Error("Langfuse credentials and LANGFUSE_BASE_URL are required.");
}

const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;
const client = new AnthropicLlmClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
  effort: EFFORT,
  model,
});
const service = new IdeaMapAnalysisService({
  async createAnalysis(request) {
    const response = await client.createMessage({
      system: request.system,
      context: request.context,
      messages: request.messages,
      maxTokens: request.maxOutputTokens,
      outputFormat: {
        ...request.outputFormat,
        schema: projectThoughtFormOutputSchema(
          THOUGHTFORM_AI_PROFILES.anthropic,
          request.outputFormat.schema,
        ),
      },
    });
    return { content: response.content };
  },
}, createLangfuseEvaluationPromptProvider());

type Scenario = {
  id: string;
  expectedType: IdeaStructureOperationType;
  message: string;
  ideaMap: IdeaMap;
};

const scenarios: Scenario[] = [
  {
    id: "merge-overlapping-established-ideas",
    expectedType: IDEA_STRUCTURE_OPERATION_TYPES.merge,
    message: "These are the same underlying concern. Please represent them as one idea without losing either statement.",
    ideaMap: map([
      idea("idea-1", "Authority must remain open to scrutiny."),
      idea("idea-2", "Legitimacy disappears when leaders avoid accountability."),
    ]),
  },
  {
    id: "split-overloaded-established-idea",
    expectedType: IDEA_STRUCTURE_OPERATION_TYPES.split,
    message: "This contains two distinct ideas. Please separate the concern about scrutiny from the concern about personal independence.",
    ideaMap: map([
      idea("idea-1", "Authority must remain open to scrutiny. My independence also requires room to make my own choices."),
    ]),
  },
];

await runLangfuseEvaluation({
  data: scenarios.map((input) => ({ input, expected: { type: input.expectedType } })),
  experimentName: process.env.LANGFUSE_EXPERIMENT ?? "thoughtform-idea-structure",
  metadata: {
    evaluation: "thoughtform-idea-structure",
    effort: EFFORT,
    model,
    provider: THOUGHTFORM_AI_PROFILES.anthropic,
    synthetic_content: true,
  },
  task: async (scenario) => {
    const analysis = await service.analyse({
      message: scenario.message,
      previousMessages: [],
      ideaMap: scenario.ideaMap,
    });
    if (!analysis.proposedStructure) {
      return { proposalType: null, applicationStatus: null };
    }
    const result = applyIdeaStructure({
      current: scenario.ideaMap,
      source: IDEA_STRUCTURE_CHANGE_SOURCES.assistant,
      request: {
        ...analysis.proposedStructure,
        expectedRevision: scenario.ideaMap.revision,
      } as Parameters<typeof applyIdeaStructure>[0]["request"],
    });
    return {
      proposalType: analysis.proposedStructure.type,
      applicationStatus: result.status,
    };
  },
  scores: [
    ({ output, expected }) => ({
      name: "expected-structural-proposal",
      score: output.proposalType === expected?.type,
    }),
    ({ output }) => ({
      name: "product-validation",
      score: output.applicationStatus === IDEA_MAP_UPDATE_STATUSES.changed,
    }),
  ],
  maxConcurrency: 1,
});

function map(ideas: Idea[]): IdeaMap {
  return { revision: 1, ideas, potentialConflicts: [] };
}

function idea(id: string, substance: string): Idea {
  return {
    id,
    title: id === "idea-1" ? "Scrutiny of authority" : "Accountability and legitimacy",
    synthesis: substance,
    substance,
    unresolvedQuestions: [],
    assistantAssessment: { exploration: "developing", importance: "central" },
    userInterpretation: null,
    disposition: IDEA_DISPOSITIONS.active,
  };
}
