import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { LangfuseClient } from "@langfuse/client";
import { THOUGHTFORM_SYSTEM_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/conversation/prompts/discovery-prompt";
import { DRAFT_COMPOSITION_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/draft-composition-prompt";
import { REVISION_PROPOSAL_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/revision-proposal-prompt";
import { SAVED_CHANGE_INTERPRETATION_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/saved-change-interpretation-prompt";
import { IDEA_MAP_ANALYSIS_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/idea-map/prompts/idea-map-analysis-prompt";


const localEnvPath = fileURLToPath(
  new URL("../../../../../../../../.env.local", import.meta.url),
);

if (existsSync(localEnvPath)) {
  Object.assign(process.env, parseEnv(readFileSync(localEnvPath, "utf8")));
}
if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY ||
  !process.env.LANGFUSE_BASE_URL) {
  throw new Error("Langfuse credentials and LANGFUSE_BASE_URL are required.");
}

const client = new LangfuseClient();
const prompts = [
  THOUGHTFORM_SYSTEM_PROMPT_DEFINITION,
  IDEA_MAP_ANALYSIS_PROMPT_DEFINITION,
  DRAFT_COMPOSITION_PROMPT_DEFINITION,
  REVISION_PROPOSAL_PROMPT_DEFINITION,
  SAVED_CHANGE_INTERPRETATION_PROMPT_DEFINITION,
];

for (const prompt of prompts) {
  const development = await getPrompt(prompt.name, "development");
  if (development?.prompt === prompt.fallback) {
    console.log(`${prompt.name}: development already synchronized`);
    continue;
  }
  const created = await client.prompt.create({
    name: prompt.name,
    type: "text",
    prompt: prompt.fallback,
    labels: ["development"],
    commitMessage: "Synchronize reviewed repository fallback for development",
  });
  console.log(`${created.name}: development version ${created.version}`);
}

async function getPrompt(name: string, label: string) {
  try {
    return await client.prompt.get(name, {
      label,
      cacheTtlSeconds: 0,
      type: "text",
      maxRetries: 0,
    });
  } catch {
    return null;
  }
}
