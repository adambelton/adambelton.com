# Migrate ThoughtForm observability and prompts to Langfuse

## Goal

Replace Braintrust with Langfuse and OpenTelemetry for ThoughtForm owner
observability, move active runtime prompts into Langfuse Prompt Management with
repository fallbacks, and automate reviewed fallback synchronization and exact
production promotion.

## Why this task is next

Langfuse provides one place to study live product behaviour, run evaluations,
and iterate on managed prompts while preserving the repository's privacy,
ownership, and availability boundaries.

## Scope

- Replace the Braintrust host adapter and hosted evaluation integration.
- Export owner-only traces and native generation usage through Langfuse and
  OpenTelemetry; retain no-op observation for temporary workspaces.
- Manage the five active ThoughtForm runtime prompts in Langfuse, using
  `development` locally and `production` in production.
- Retain structured Anthropic XML prompt fallbacks whose content starts on a
  newline and whose variables match the managed prompt.
- Link resolved prompt versions to generation observations.
- Automate reviewed Langfuse prompt versions into fallback pull requests and
  promote only the exact merged versions to production.
- Update tests, configuration examples, product documentation, decisions, and
  progress records.

## Out of scope

- Persisting or observing temporary-workspace content.
- Moving evaluation fixtures, score definitions, or LLM-as-judge criteria into
  Prompt Management.
- Reusing application credentials for GitHub or Langfuse automation.
- Configuring repository secrets or the external Langfuse webhook on Adam's
  behalf.

## Expected files to create or modify

- `apps/api/src/platform/observability/`
- `apps/api/src/products/thoughtform/adapters/prompts/`
- `packages/observability/`
- capability-owned `prompts/` directories under conversation, Idea Map, and drafting
- `packages/products/src/thoughtform/server/ports/`
- `packages/products/src/thoughtform/testing/evaluations/`
- `.github/workflows/` and `.github/scripts/`
- package manifests, environment examples, product/deployment documentation,
  `docs/decisions.md`, and `progress.md`

## Definition of done

- Owner operations export useful Langfuse traces, generation usage, sessions,
  environment, and prompt-version links without entering the response path.
- Temporary operations emit neither content nor metadata.
- Development and production resolve the correct managed prompt labels with
  validated repository fallbacks for all five active prompts.
- Reviewed prompt changes can create a fallback PR, and merged exact versions
  can be promoted without a direct push to `main`.
- Braintrust runtime and evaluation dependencies are removed.
- Relevant tests, typecheck, build, browser journeys, prompt validation, and
  workflow validation pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm db:migrate:status
pnpm validate:thoughtform-prompts
pnpm validate:langfuse-workflows
git diff --check
```

## Risks / questions

- GitHub workflow activation requires dedicated repository secrets and a
  separately scoped Langfuse Repository Dispatch credential.
- Managed prompt changes must fail closed when name, variables, structure,
  review label, immutable version, or fingerprint differ from the catalog.
- Langfuse export must remain best effort and outside product correctness.

## Approval record

Approved by Adam on 7 August 2026.

- **Intentional boundaries:** Langfuse owns managed runtime prompt versions and
  owner observability; the product owns prompt contracts and availability
  fallbacks; the API host owns SDKs, credentials, environment labels, and
  automation adapters. Temporary workspaces remain unobserved.
- **Important deferrals:** Adam will configure GitHub Actions secrets and the
  Langfuse Repository Dispatch automation after reviewing the implementation.
- **Implementation decisions left open:** exact SDK composition, cache policy,
  trace hierarchy, safe automation mechanics, and test organization may be
  settled during implementation without changing the boundaries above.
- **Do not reopen:** using Langfuse in development, synchronizing production
  prompt changes with fallbacks, Anthropic XML-style headings, leading-newline
  prompt content, and requiring a reviewed pull request before production
  promotion.
