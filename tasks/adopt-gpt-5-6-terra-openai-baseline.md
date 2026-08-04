# Adopt GPT-5.6 Terra as the OpenAI comparison baseline

## Status

Completed.

## Goal

Make `gpt-5.6-terra` the default OpenAI model and ThoughtForm's explicitly
supported OpenAI profile, then publish and merge the completed provider-boundary
work after local validation and repository CI pass.

## Why this task is next

The generic OpenAI client had been changed to default to GPT-5.6 Terra while
ThoughtForm's product-owned supported profile still permitted only GPT-5 Mini.
That mismatch would make the selected OpenAI configuration fail closed before a
hosted request reached the provider.

## Scope

- Preserve GPT-5.6 Terra as the generic OpenAI client's explicit default.
- Make GPT-5.6 Terra the only supported OpenAI model in ThoughtForm's current
  profile contract and reject the superseded GPT-5 Mini profile.
- Align active environment examples, local-development guidance, decisions,
  progress, and tests.
- Run the complete local validation suite, publish the completed branch, wait
  for required CI, and merge only after it passes.
- Exclude the existing Task 036 proposal edit from the publication commit.

## Out of scope

- Comparative model evaluation.
- GPT-5.6 Terra prompt or reasoning tuning.
- Changing the Anthropic Sonnet 5 baseline.
- Editing historical records that accurately document earlier GPT-5 Mini use.
- Implementing Task 036.

## Expected files

- `packages/ai/src/providers/openai-llm-client.ts`
- `packages/products/src/thoughtform/server/capabilities/hosted-ai-profile/`
- `.env.example`
- `docs/local-development.md`
- `docs/decisions.md`
- `progress.md`
- `tasks/README.md`
- this task record

## Definition of done

- The generic OpenAI client defaults to `gpt-5.6-terra`.
- ThoughtForm accepts the exact OpenAI GPT-5.6 Terra profile and rejects the old
  GPT-5 Mini model slug.
- Active configuration examples and documentation agree with the runtime.
- Tests, typecheck, build, browser tests, and diff checks pass.
- The publication commit excludes the existing Task 036 edit.
- Required PR CI passes before merge.

## Validation commands

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
git diff --check
```

## Risks and questions

- GPT-5.6 defaults to medium reasoning when reasoning is omitted. This baseline
  preserves the existing request shape; reasoning and prompt tuning remain part
  of later comparative evaluation.
- Hosted availability depends on the configured OpenAI account and is not
  established by deterministic repository tests alone.

## Approval record

- **Approved:** 4 August 2026.
- **Intentional boundaries:** GPT-5.6 Terra is the explicit OpenAI comparison
  baseline; Sonnet 5 remains the development baseline.
- **Important deferrals:** comparative evaluation, prompt tuning, reasoning
  configuration, and Task 036 implementation.
- **Open implementation decisions:** none; the exact model slug and publishing
  workflow were approved.
- **Do not reopen without new evidence:** arbitrary OpenAI model acceptance or
  prompt changes during this baseline replacement.

## Completion audit

- **Runtime default:** `DEFAULT_OPENAI_MODEL` and `.env.example` select
  `gpt-5.6-terra`.
- **Product profile:** ThoughtForm's product-owned supported-profile allowlist
  accepts GPT-5.6 Terra and its focused test rejects GPT-5 Mini.
- **Documentation:** current local setup, Decision 050, progress, and the task
  index identify GPT-5.6 Terra as the OpenAI comparison baseline. Historical
  completed-task evidence remains unchanged.
- **Validation:** `pnpm test` passed 215 tests with 5 skipped; `pnpm typecheck`,
  `pnpm build`, `pnpm test:e2e` (3 scenarios), and `git diff --check` passed.
  The first browser attempt was prevented from creating its local IPC socket by
  the sandbox; the identical approved rerun passed. PR CI remains the final
  publication gate.
- **Branch audit:** the complete merge-base diff preserves product AI meaning in
  `packages/products`, provider mechanisms in `packages/ai`, host selection in
  `apps/api`, and shared presentation in `apps/client`. No migration was added.
  The existing Task 036 modification remains explicitly excluded from the
  publication commit.
