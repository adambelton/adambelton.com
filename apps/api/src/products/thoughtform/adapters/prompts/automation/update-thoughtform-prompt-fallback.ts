import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { LangfuseClient } from "@langfuse/client";
import { loadLocalEnvironment } from "apps/api/src/bootstrap/local-environment";
import {
  fallbackVersionPath,
  fingerprintPrompt,
  getFallbackVersion,
  getPromptCatalogEntry,
  readFallbackVersionsFromDisk,
  repositoryRoot,
  validatePromptContent,
} from "apps/api/src/products/thoughtform/adapters/prompts/automation/thoughtform-prompt-catalog";
import { replacePromptFallback } from "apps/api/src/products/thoughtform/adapters/prompts/automation/prompt-fallback-source";

loadLocalEnvironment();

const name = process.env.LANGFUSE_PROMPT_NAME;
const version = Number(process.env.LANGFUSE_PROMPT_VERSION);
if (!name || !Number.isInteger(version) || version < 1) {
  throw new Error("LANGFUSE_PROMPT_NAME and a positive LANGFUSE_PROMPT_VERSION are required.");
}
const catalogEntry = getPromptCatalogEntry(name);
if (!catalogEntry) throw new Error(`Unknown ThoughtForm prompt: ${name}`);

const client = new LangfuseClient();
const prompt = await client.prompt.get(name, {
  version,
  type: "text",
  cacheTtlSeconds: 0,
  maxRetries: 0,
});
if (!prompt.labels.includes("review")) {
  throw new Error(`${name} version ${version} does not carry the review label.`);
}
const currentMetadata = getFallbackVersion(catalogEntry.definition.name);
const issues = validatePromptContent(
  catalogEntry.definition.name,
  prompt.prompt,
  currentMetadata.variables,
);
if (issues.length > 0) throw new Error(issues.join("\n"));

const sourceFile = resolve(repositoryRoot, catalogEntry.sourcePath);
const source = readFileSync(sourceFile, "utf8");
writeFileSync(
  sourceFile,
  replacePromptFallback(source, catalogEntry.exportName, prompt.prompt),
);

const versions = readFallbackVersionsFromDisk();
versions[catalogEntry.definition.name] = {
  ...versions[catalogEntry.definition.name],
  version: prompt.version,
  sha256: fingerprintPrompt(prompt.prompt),
};
writeFileSync(
  resolve(repositoryRoot, fallbackVersionPath),
  `${JSON.stringify(versions, null, 2)}\n`,
);
console.log(`${prompt.name}: repository fallback updated to version ${prompt.version}`);
