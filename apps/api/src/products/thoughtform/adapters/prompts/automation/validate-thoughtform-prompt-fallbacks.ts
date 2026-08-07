import { pathToFileURL } from "node:url";
import {
  fingerprintPrompt,
  getFallbackVersion,
  thoughtFormPromptCatalog,
  validatePromptContent,
} from "apps/api/src/products/thoughtform/adapters/prompts/automation/thoughtform-prompt-catalog";

export function getThoughtFormPromptFallbackIssues() {
  return thoughtFormPromptCatalog.flatMap(({ definition }) => {
    const metadata = getFallbackVersion(definition.name);
    const issues = validatePromptContent(
      definition.name,
      definition.fallback,
      metadata.variables,
    );
    if (!Number.isInteger(metadata.version) || metadata.version < 1) {
      issues.push(`${definition.name}: version must be a positive integer`);
    }
    const fingerprint = fingerprintPrompt(definition.fallback);
    if (fingerprint !== metadata.sha256) {
      issues.push(
        `${definition.name}: fallback fingerprint ${fingerprint} does not match ${metadata.sha256}`,
      );
    }
    return issues;
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const issues = getThoughtFormPromptFallbackIssues();
  if (issues.length > 0) throw new Error(issues.join("\n"));
  console.log("ThoughtForm prompt fallbacks are valid.");
}
