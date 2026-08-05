import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { Eval } from "braintrust";
import { DEFAULT_OPENAI_MODEL, OpenAiLlmClient } from "packages/ai/src";
import {
  ConversationService,
  getProposedIdeaActionsValidationIssues,
  getProposedIdeasValidationIssues,
  type ConversationModel,
  type ConversationModelRequest,
} from "packages/products/src/thoughtform/server";
import {
  READINESS_ACTIONS,
  USER_INTENTIONS,
  type UserIntention,
} from "packages/products/src/thoughtform/shared";

const ENABLED_VALUE = "true";
const localEnvPath = fileURLToPath(new URL("../../../../../../.env.local", import.meta.url));
loadLocalEnvironment();

if (process.env.RUN_HOSTED_EVALUATIONS !== ENABLED_VALUE) {
  throw new Error("Set RUN_HOSTED_EVALUATIONS=true to acknowledge model usage and cost.");
}
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required.");
if (!process.env.BRAINTRUST_API_KEY) throw new Error("BRAINTRUST_API_KEY is required.");

const client = new OpenAiLlmClient({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
});

const scenarios: Array<{
  input: { id: string; message: string };
  expected: { intention: UserIntention };
}> = [
  {
    input: { id: "guided-exploration", message: "Guide me in exploring why I condemn Infantino's leadership without confusing FIFA's leadership with football itself." },
    expected: { intention: USER_INTENTIONS.explore },
  },
  {
    input: { id: "reflection-request", message: "Reflect back what I mean when I say football can withdraw legitimacy from FIFA's leadership, while preserving uncertainty about how." },
    expected: { intention: USER_INTENTIONS.reflect },
  },
  {
    input: { id: "early-draft-request", message: "Create a rough draft now even though I have not resolved how supporter pressure becomes institutional reform." },
    expected: { intention: USER_INTENTIONS.compose },
  },
];

await Eval(process.env.BRAINTRUST_PROJECT ?? "thoughtform-development", {
  data: scenarios,
  experimentName: process.env.BRAINTRUST_EXPERIMENT,
  metadata: {
    model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
    evaluation: "thoughtform-hosted-contract",
  },
  task: async (input) => {
    let rawContent = "";
    const model: ConversationModel = {
      async createResponse(request: ConversationModelRequest) {
        const response = await client.createMessage({
          maxTokens: request.maxOutputTokens,
          messages: request.messages,
          outputFormat: request.outputFormat,
          system: request.system,
        });
        rawContent = response.content;
        return { content: response.content };
      },
    };
    const response = await new ConversationService({ conversationModel: model }).respond({
      conversationId: input.id,
      message: input.message,
      previousMessages: [],
    });
    return { response, rawContent };
  },
  scores: [
    ({ output, expected }) => ({
      name: "intention",
      score: output.response.userIntention === expected?.intention ? 1 : 0,
    }),
    ({ output }) => ({
      name: "readiness-contract",
      score: new Set(output.response.assistantReadiness.map((entry) => entry.action)).size === 2 &&
        output.response.assistantReadiness.some((entry) => entry.action === READINESS_ACTIONS.reflect) &&
        output.response.assistantReadiness.some((entry) => entry.action === READINESS_ACTIONS.compose) ? 1 : 0,
    }),
    ({ output }) => {
      try {
        const structured = JSON.parse(output.rawContent) as Record<string, unknown>;
        const issues = [
          ...getProposedIdeasValidationIssues(structured.proposedIdeas),
          ...getProposedIdeaActionsValidationIssues(structured.ideaActions),
        ];
        return { name: "structured-output", score: issues.length === 0 ? 1 : 0 };
      } catch {
        return { name: "structured-output", score: 0 };
      }
    },
  ],
  maxConcurrency: 1,
});

function loadLocalEnvironment() {
  if (!existsSync(localEnvPath)) return;
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));
  for (const [key, value] of Object.entries(localEnv)) process.env[key] ??= value;
}
