import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import fallbackVersions from "apps/api/src/products/thoughtform/adapters/prompts/automation/prompt-fallback-versions.json";
import { THOUGHTFORM_SYSTEM_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/conversation/prompts/discovery-prompt";
import { DRAFT_COMPOSITION_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/draft-composition-prompt";
import { REVISION_PROPOSAL_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/revision-proposal-prompt";
import { SAVED_CHANGE_INTERPRETATION_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/drafting/prompts/saved-change-interpretation-prompt";
import { IDEA_MAP_ANALYSIS_PROMPT_DEFINITION } from "packages/products/src/thoughtform/server/capabilities/idea-map/prompts/idea-map-analysis-prompt";

export const repositoryRoot = fileURLToPath(
  new URL("../../../../../../../../", import.meta.url),
);

export const thoughtFormPromptCatalog = [
  {
    definition: THOUGHTFORM_SYSTEM_PROMPT_DEFINITION,
    sourcePath:
      "packages/products/src/thoughtform/server/capabilities/conversation/prompts/discovery-prompt.ts",
    exportName: "THOUGHTFORM_SYSTEM_PROMPT_FALLBACK",
  },
  {
    definition: IDEA_MAP_ANALYSIS_PROMPT_DEFINITION,
    sourcePath:
      "packages/products/src/thoughtform/server/capabilities/idea-map/prompts/idea-map-analysis-prompt.ts",
    exportName: "IDEA_MAP_ANALYSIS_PROMPT_FALLBACK",
  },
  {
    definition: DRAFT_COMPOSITION_PROMPT_DEFINITION,
    sourcePath:
      "packages/products/src/thoughtform/server/capabilities/drafting/prompts/draft-composition-prompt.ts",
    exportName: "DRAFT_COMPOSITION_PROMPT_FALLBACK",
  },
  {
    definition: REVISION_PROPOSAL_PROMPT_DEFINITION,
    sourcePath:
      "packages/products/src/thoughtform/server/capabilities/drafting/prompts/revision-proposal-prompt.ts",
    exportName: "REVISION_PROPOSAL_PROMPT_FALLBACK",
  },
  {
    definition: SAVED_CHANGE_INTERPRETATION_PROMPT_DEFINITION,
    sourcePath:
      "packages/products/src/thoughtform/server/capabilities/drafting/prompts/saved-change-interpretation-prompt.ts",
    exportName: "SAVED_CHANGE_INTERPRETATION_PROMPT_FALLBACK",
  },
] as const;

export type ThoughtFormPromptName =
  (typeof thoughtFormPromptCatalog)[number]["definition"]["name"];

export const fallbackVersionPath =
  "apps/api/src/products/thoughtform/adapters/prompts/automation/prompt-fallback-versions.json";

export function getPromptCatalogEntry(name: string) {
  return thoughtFormPromptCatalog.find((entry) => entry.definition.name === name) ?? null;
}

export function getFallbackVersion(name: ThoughtFormPromptName) {
  return fallbackVersions[name];
}

export function fingerprintPrompt(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function createAssignablePromptLabels(
  currentLabels: readonly string[],
  requiredLabels: readonly string[],
) {
  return [...new Set([
    ...currentLabels.filter((label) => label !== "latest"),
    ...requiredLabels,
  ])];
}

export function validatePromptContent(
  name: ThoughtFormPromptName,
  content: string,
  allowedVariables: readonly string[],
) {
  const issues: string[] = [];
  if (!content.startsWith("\n")) issues.push("content must start with a newline");
  for (const tag of ["role", "output_contract"]) {
    if (!content.includes(`<${tag}>`) || !content.includes(`</${tag}>`)) {
      issues.push(`content must contain a complete <${tag}> section`);
    }
  }
  if (content.includes("`") || content.includes("${")) {
    issues.push("content cannot contain TypeScript template-literal delimiters");
  }
  const variables = [...content.matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)]
    .map((match) => match[1]!)
    .sort();
  const expected = [...allowedVariables].sort();
  if (JSON.stringify(variables) !== JSON.stringify(expected)) {
    issues.push(
      `variables ${JSON.stringify(variables)} do not match ${JSON.stringify(expected)}`,
    );
  }
  return issues.map((issue) => `${name}: ${issue}`);
}

export function readFallbackVersionsFromDisk() {
  return JSON.parse(readFileSync(
    new URL(
      `../../../../../../../../${fallbackVersionPath}`,
      import.meta.url,
    ),
    "utf8",
  )) as Record<ThoughtFormPromptName, {
    version: number;
    sha256: string;
    variables: string[];
  }>;
}
