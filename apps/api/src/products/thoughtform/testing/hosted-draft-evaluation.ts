import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { DEFAULT_OPENAI_MODEL, OpenAiLlmClient } from "packages/ai/src";
import { LlmDraftModelAdapter } from "apps/api/src/products/thoughtform/adapters/ai/draft-model-adapter";

const ENABLED_VALUE = "true";
const localEnvPath = fileURLToPath(
  new URL("../../../../../../.env.local", import.meta.url),
);

if (existsSync(localEnvPath)) {
  const localEnv = parseEnv(readFileSync(localEnvPath, "utf8"));
  for (const [key, value] of Object.entries(localEnv)) {
    process.env[key] ??= value;
  }
}

if (process.env.RUN_HOSTED_EVALUATIONS !== ENABLED_VALUE) {
  throw new Error(
    "Hosted draft evaluation is disabled. Set RUN_HOSTED_EVALUATIONS=true to acknowledge model usage and cost.",
  );
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY is required for hosted draft evaluation.");

const adapter = new LlmDraftModelAdapter(new OpenAiLlmClient({
  apiKey,
  model: process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL,
}));
const result = await adapter.compose({
  selectedIdeas: [{
    id: "idea-dog-barking",
    title: "My dog is barking",
    synthesis: "My dog's barking makes me angry, even though I know he is reacting naturally.",
    substance: "My dog barks at squirrels and birds in the garden. It makes me angry. I know it is his nature and not his fault, but I also feel responsible because I have not trained him properly.",
  }],
  relevantConversationLanguage: [
    "My dog is really annoying today.",
    "He's barking. A lot.",
  ],
  instruction: "Compose an intentionally early private journal entry.",
});

assert.doesNotMatch(
  result.body,
  /\b(?:the )?user (?:reports?|says?|said|states?|wrote|mentions?)\b|exact user|assistant assessment|^synthesis:|^substance:|unresolved questions|importance\s*=|exploration\s*=/im,
);
assert.match(result.body, /\b(?:I|my|me)\b/i);
console.log("Passed hosted draft composition perspective evaluation.");
