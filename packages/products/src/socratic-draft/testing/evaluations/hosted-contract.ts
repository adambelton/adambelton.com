import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { DEFAULT_OPENAI_MODEL, OpenAiLlmClient } from "packages/ai/src";
import {
  ConversationService,
  getProposedIdeaActionsValidationIssues,
  getProposedIdeasValidationIssues,
  type ConversationModel,
  type ConversationModelRequest,
} from "packages/products/src/socratic-draft/server";
import type {
  ReadinessAction,
  UserIntention,
} from "packages/products/src/socratic-draft/shared";
import {
  ACTIVITIES,
  READINESS_ACTIONS,
  READINESS_ASSESSMENTS,
  USER_INTENTIONS,
} from "packages/products/src/socratic-draft/shared";

const ENABLED_VALUE = "true";
const localEnvPath = fileURLToPath(
  new URL("../../../../../../.env.local", import.meta.url),
);

loadLocalEnvironment();

if (process.env.RUN_HOSTED_EVALUATIONS !== ENABLED_VALUE) {
  throw new Error(
    "Hosted contract evaluation is disabled. Set RUN_HOSTED_EVALUATIONS=true to acknowledge model usage and cost.",
  );
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is required for hosted contract evaluation.");
}

const client = new OpenAiLlmClient({
  apiKey,
  model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
});

const scenarios: Array<{
  id: string;
  message: string;
  expectedIntention: UserIntention;
}> = [
  {
    id: "guided-exploration",
    message:
      "Guide me in exploring why I condemn Infantino's leadership without confusing FIFA's leadership with football itself.",
    expectedIntention: USER_INTENTIONS.explore,
  },
  {
    id: "reflection-request",
    message:
      "Reflect back what I mean when I say football can withdraw legitimacy from FIFA's leadership, while preserving uncertainty about how.",
    expectedIntention: USER_INTENTIONS.reflect,
  },
  {
    id: "early-draft-request",
    message:
      "Create a rough draft now even though I have not resolved how supporter pressure becomes institutional reform.",
    expectedIntention: USER_INTENTIONS.compose,
  },
];

for (const scenario of scenarios) {
  let rawContent: string | null = null;
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
  const response = await new ConversationService({
    conversationModel: model,
  }).respond({
    conversationId: scenario.id,
    message: scenario.message,
    previousMessages: [],
  });

  assert.equal(response.activity, ACTIVITIES.discovery);
  assert.equal(response.userIntention, scenario.expectedIntention);
  assert.deepEqual(
    new Set(response.assistantReadiness.map((entry) => entry.action)),
    new Set<ReadinessAction>([
      READINESS_ACTIONS.reflect,
      READINESS_ACTIONS.compose,
    ]),
  );
  for (const readiness of response.assistantReadiness) {
    if (readiness.assessment === READINESS_ASSESSMENTS.readyWithUncertainty) {
      assert.ok(readiness.explanation?.trim());
    }
  }
  assert.doesNotMatch(
    response.message.content,
    /(?:your|the) draft (?:has been|is now|was) (?:created|written)|here is (?:your|the) draft/i,
  );

  assert.ok(rawContent);
  const structured = JSON.parse(rawContent) as Record<string, unknown>;
  assert.deepEqual(
    [
      ...getProposedIdeasValidationIssues(structured.proposedIdeas),
      ...getProposedIdeaActionsValidationIssues(structured.ideaActions),
    ],
    [],
  );
  console.log(`Passed hosted contract scenario: ${scenario.id}`);
}

function loadLocalEnvironment() {
  if (!existsSync(localEnvPath)) return;
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));
  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value;
  }
}
