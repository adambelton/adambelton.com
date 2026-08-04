# Add Anthropic provider support and adopt Sonnet 5

## Goal

Add an Anthropic implementation alongside the existing OpenAI client and
configure ThoughtForm to use `claude-sonnet-5` through the existing
provider-neutral AI boundary.

## Why this task is next

Observed conversation quality problems would distort Task 036 verification and
later prompt tuning. Sonnet 5 is a credible current baseline, and the repository
already has the correct abstraction boundary for multiple providers.

## Scope

- Add the official Anthropic TypeScript SDK to `packages/ai`.
- Implement an Anthropic client satisfying the existing `LlmClient` contract.
- Translate the provider-neutral JSON Schema output contract to Claude
  structured outputs.
- Normalize content, token usage, model identity, refusals, truncation, and
  provider failures behind the existing AI boundary.
- Retain OpenAI as an explicitly selectable provider.
- Add explicit provider, credential, and model configuration.
- Select Anthropic and `claude-sonnet-5` for current local ThoughtForm use.
- Use one selected provider client for conversation, Draft composition, saved
  Draft-change interpretation, and revision proposals.
- Update privacy, local-development, decision, progress, and task records.
- Verify mocked provider behavior and one real mounted Sonnet-backed operation.

## Out of scope

- Cross-provider quality evaluation or a permanent production-model decision.
- Prompt tuning beyond compatibility changes required by Sonnet 5.
- Fixing the observed Idea Map provenance and Draft-coherence defects.
- Per-operation routing, automatic fallback, load balancing, or model pickers.
- Removing OpenAI or calibrating usage limits.

## Expected files to create or modify

- `packages/ai/package.json` and `pnpm-lock.yaml`
- Anthropic provider implementation and tests under `packages/ai/src/providers`
- `packages/ai/src/index.ts`
- ThoughtForm API product mount and tests
- `.env.example` and `docs/local-development.md`
- ThoughtForm privacy UI, tests, and lifecycle documentation
- `docs/decisions.md`, `progress.md`, and `tasks/README.md`

## Definition of done

- Anthropic and OpenAI both satisfy the existing `LlmClient` boundary.
- `AI_PROVIDER=anthropic` selects Sonnet 5 for every hosted ThoughtForm model
  capability, while missing selected-provider credentials fail closed.
- OpenAI remains explicitly selectable and tested.
- Claude structured output satisfies existing ThoughtForm schemas.
- Provider refusals, incomplete or invalid output, and request failures remain
  normalized outside product capability code.
- Privacy and local-development documentation match actual behavior.
- Automated tests, typecheck, build, and diff checks pass.
- One real Sonnet 5 request works through the mounted local client and API.
- Documentation identifies Sonnet 5 as the current baseline, not the result of a
  completed comparative evaluation.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

Mounted verification must exercise one real Sonnet-backed ThoughtForm turn
through the local client and API composition. Automated checks and browser
inspection must be recorded separately.

## Risks / questions

- Sonnet 5 adaptive thinking and sampling constraints must be represented
  without leaking provider mechanics into product contracts.
- Token counts are provider-specific despite normalized usage fields.
- Privacy copy must not imply contractual Zero Data Retention without evidence
  that the account has an applicable ZDR agreement.
- Provider selection must not silently fall back to another provider.

## Approval record

- **Approved:** 4 August 2026 by Adam.
- **Intentional boundaries:** retain OpenAI; select Anthropic explicitly; use
  `claude-sonnet-5` as the current baseline; do not add silent fallback or
  operation-specific routing.
- **Important deferrals:** comparative model evaluation, permanent model choice,
  prompt tuning, Idea Map provenance correction, Draft-coherence correction,
  and usage-limit calibration.
- **Open implementation decisions:** exact provider-neutral configuration helper
  shape and the narrow error normalization required by the Anthropic SDK.
- **Do not reopen without new evidence:** provider implementations belong in
  `packages/ai`; ThoughtForm continues to depend only on its product-owned model
  contracts; current Sonnet selection is not a final quality claim.

## Status

Completed.

## Completion audit

### Scope and definition-of-done evidence

- **Official SDK and provider client:** `packages/ai` depends on the official
  Anthropic SDK and owns `AnthropicLlmClient`, which implements `LlmClient` with
  structured output, text, model identity, inclusive input usage, output usage,
  thinking usage, and non-success stop normalization. Colocated tests cover the
  request and response mapping.
- **Provider compatibility:** the Anthropic adapter translates unsupported JSON
  Schema array and nullable-enum forms while the product parser continues to
  enforce the complete ThoughtForm contract. A real full-schema conversation
  request returned a parsed product response.
- **Explicit selection and fail-closed behaviour:** the API mount selects
  `anthropic` or `openai`, validates only the selected credential, shares the
  selected client across all four model-backed capabilities, and returns
  disabled adapters for an off kill switch, missing selected key, or unknown
  provider. Host tests cover Anthropic, OpenAI, and no-fallback cases.
- **Current baseline:** `.env.example` and local-development documentation select
  `claude-sonnet-5`; OpenAI remains documented and selectable. Decision 049
  records that this is not a permanent model choice.
- **Privacy:** the product acknowledgement, privacy page, and lifecycle document
  name Anthropic's Messages API, standard 30-day retention boundary, training
  boundary, and lack of a claimed ZDR arrangement. Tests assert the mounted copy.
- **Mounted operation:** browser inspection through isolated real client and API
  hosts authenticated the temporary editor, acknowledged the provider notice,
  sent a synthetic thought to Sonnet 5, displayed the assistant reply and Idea
  Map update, retained text through an earlier normalized failure, and cleared
  the synthetic temporary conversation afterward.
- **Automated validation:** 207 tests passed with 5 gated skips; every package
  typechecked; every package built; `git diff --check` passed.

### Complete branch-diff audit

- Provider mechanisms remain in `packages/ai`; product model contracts and
  behaviour remain provider-neutral. Host code contains only configuration and
  dependency assembly.
- No production or test host duplicates ThoughtForm behaviour, no new product
  persistence or migration was introduced, and no approved implementation
  decision remains unsettled.
- Privacy, architecture, decision, task, and progress claims match the automated
  and browser evidence above. Browser inspection is recorded separately from
  automated validation and makes no assistive-technology claim.
- The pre-existing uncommitted Task 036 proposal changes were preserved and are
  unrelated to this task's implementation diff.
