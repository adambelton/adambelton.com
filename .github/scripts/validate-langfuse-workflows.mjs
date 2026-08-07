import { readFileSync } from "node:fs";
import { parse } from "yaml";

const workflowPaths = [
  ".github/workflows/langfuse-prompt-sync.yml",
  ".github/workflows/langfuse-prompt-promote.yml",
];
const workflows = workflowPaths.map((path) => ({
  path,
  source: readFileSync(path, "utf8"),
  workflow: parse(readFileSync(path, "utf8")),
}));
const issues = [];

for (const { path, workflow } of workflows) {
  if (!workflow?.name || !workflow?.on || !workflow?.jobs) {
    issues.push(`${path}: name, on, and jobs are required`);
  }
}

const sync = workflows[0];
if (!sync.workflow.on.repository_dispatch?.types?.includes("langfuse-prompt-review")) {
  issues.push(`${sync.path}: must accept only the langfuse-prompt-review dispatch type`);
}
if (sync.workflow.on.push) {
  issues.push(`${sync.path}: fallback synchronization must not run on push`);
}
if (!sync.source.includes("GH_TOKEN: ${{ github.token }}")) {
  issues.push(`${sync.path}: must use GitHub's temporary workflow token`);
}
if (sync.source.includes("PROMPT_SYNC_GITHUB_TOKEN")) {
  issues.push(`${sync.path}: must not require a long-lived prompt-sync token`);
}
if (!sync.source.includes("gh pr create")) {
  issues.push(`${sync.path}: must open a review pull request`);
}
for (const path of [
  "packages/products/src/thoughtform/server/capabilities/conversation/prompts",
  "packages/products/src/thoughtform/server/capabilities/drafting/prompts",
  "packages/products/src/thoughtform/server/capabilities/idea-map/prompts",
  "apps/api/src/products/thoughtform/adapters/prompts/automation/prompt-fallback-versions.json",
]) {
  if (!sync.source.includes(path)) {
    issues.push(`${sync.path}: must stage ${path}`);
  }
}

const promote = workflows[1];
if (!promote.workflow.on.push?.branches?.includes("main")) {
  issues.push(`${promote.path}: promotion must run only after a merge reaches main`);
}
if (!promote.workflow.on.push?.paths?.includes(
  "apps/api/src/products/thoughtform/adapters/prompts/automation/prompt-fallback-versions.json",
)) {
  issues.push(`${promote.path}: promotion must require merged fallback metadata`);
}

if (issues.length > 0) throw new Error(issues.join("\n"));
console.log("Langfuse GitHub workflows are valid.");
