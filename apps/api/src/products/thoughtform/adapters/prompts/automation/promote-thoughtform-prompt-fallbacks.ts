import { LangfuseClient } from "@langfuse/client";
import { loadLocalEnvironment } from "apps/api/src/bootstrap/local-environment";
import {
  createAssignablePromptLabels,
  fingerprintPrompt,
  getFallbackVersion,
  thoughtFormPromptCatalog,
} from "apps/api/src/products/thoughtform/adapters/prompts/automation/thoughtform-prompt-catalog";

loadLocalEnvironment();

const client = new LangfuseClient();
const name = process.env.LANGFUSE_PROMPT_NAME;
const entries = name
  ? thoughtFormPromptCatalog.filter(({ definition }) =>
      definition.name === name)
  : thoughtFormPromptCatalog;
if (entries.length === 0) {
  throw new Error(`Unknown LANGFUSE_PROMPT_NAME: ${name ?? ""}`);
}
for (const { definition } of entries) {
  const metadata = getFallbackVersion(definition.name);
  const prompt = await client.prompt.get(definition.name, {
    version: metadata.version,
    type: "text",
    cacheTtlSeconds: 0,
    maxRetries: 0,
  });
  if (
    prompt.prompt !== definition.fallback ||
    fingerprintPrompt(prompt.prompt) !== metadata.sha256
  ) {
    throw new Error(
      `${definition.name} version ${metadata.version} does not match the merged fallback.`,
    );
  }
  if (!prompt.labels.includes("review")) {
    throw new Error(
      `${definition.name} version ${metadata.version} lacks the review label.`,
    );
  }
  if (prompt.labels.includes("production")) {
    console.log(`${definition.name}: version ${metadata.version} already production`);
    continue;
  }
  if (process.env.LANGFUSE_PROMPT_DRY_RUN === "true") {
    console.log(`${definition.name}: version ${metadata.version} ready for promotion`);
    continue;
  }
  await client.prompt.update({
    name: definition.name,
    version: metadata.version,
    newLabels: createAssignablePromptLabels(
      prompt.labels,
      ["development", "production"],
    ),
  });
  console.log(`${definition.name}: promoted version ${metadata.version}`);
}
