# Cache Claude's stable ThoughtForm prompt

## Goal

Add explicit five-minute Anthropic prompt caching for ThoughtForm's stable
structured conversation instructions while keeping changing workspace context
uncached, then measure the effect with the unchanged medium-effort FIFA run.

## Why this task is next

The Claude-specific prompt now has a stable instruction hierarchy and a clearly
delimited dynamic workspace context. Caching the stable part is the smallest
controlled provider optimisation that does not require redesigning Idea Map or
conversation-history state.

## Scope

- Separate stable instructions and dynamic workspace context semantically in the
  product conversation-model request and platform AI request.
- Project them into separate Anthropic system content blocks.
- Apply explicit ephemeral cache control only to the stable instruction block.
- Keep Anthropic's default five-minute TTL.
- Preserve OpenAI's existing effective prompt by concatenating the sections.
- Preserve provider-neutral product meaning and keep Anthropic cache mechanics
  inside `packages/ai`.
- Record cache creation and read tokens through the existing usage fields.
- Run the unchanged ten-turn FIFA scenario with Sonnet 5 at medium effort and
  retain a distinct Braintrust experiment.

## Out of scope

- Cache pre-warming or a one-hour TTL.
- Conversation-history caching.
- Avoiding transmission of workspace context or the Idea Map.
- Idea Map snapshots, deltas, tools, or provider-held state.
- Prompt, schema, scenario, scorer, or effort changes.
- Streaming or asynchronous Idea Map processing.
- OpenAI optimisation or evaluation.

## Expected files to create or modify

- ThoughtForm conversation model request, service, adapters, evaluations, and
  focused tests.
- `packages/ai` request contract, Anthropic and OpenAI providers, and tests.
- `progress.md` and task records.

## Definition of done

- Claude receives distinct stable and dynamic system blocks.
- Only the stable block carries `cache_control` with the ephemeral five-minute
  policy.
- The retained run reports cache creation and subsequent cache reads, or records
  exact provider evidence explaining why the cache was ineligible.
- Output schema, FIFA inputs, scorers, model, and medium effort remain unchanged.
- Behavioural and complete-output quality remain acceptable.
- OpenAI receives the same combined text it received before the request split.
- Tests, typecheck, build, frozen lockfile validation, and diff checks pass.

## Validation commands

```txt
pnpm vitest run packages/ai/src/providers/anthropic-llm-client.test.ts packages/ai/src/providers/openai-llm-client.test.ts apps/api/src/products/thoughtform/adapters/ai/conversation-model-adapter.test.ts packages/products/src/thoughtform/server/capabilities/conversation/conversation-service.test.ts
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
git diff --check
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform-braintrust
```

## Risks / questions

- The stable content may fall below Anthropic's cache minimum after provider
  projection.
- Caching may reduce cost more than latency because generation remains unchanged.
- A run exceeding five minutes may require another cache write after expiry.
- Conversation history remains uncached because changing system context appears
  before messages in Anthropic's prompt hierarchy.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** cache only the stable Claude prompt using explicit
  five-minute ephemeral caching; hold every behavioural variable fixed; measure
  real provider-reported cache fields.
- **Important deferrals:** conversation caching, workspace-state reduction,
  pre-warming, longer TTLs, streaming, delta output, and asynchronous processing.
- **Implementation decision:** expose a provider-neutral stable/dynamic semantic
  split and keep `cache_control` inside the concrete Anthropic adapter.
- **Do not reopen without new evidence:** this task must not claim that prompt
  caching stores application state or removes the need to transmit the Idea Map.

## Status

Complete.

## Completion record

- **Experiment:**
  `codex/thoughtform-fifa-claude-stable-prompt-cache-20260805-1147`
- **Experiment ID:** `f39559bf-98fa-4ac3-a326-d919c491b2cc`
- **Braintrust project:** `ThoughtForm`
  (`9c56aca1-7e54-4e73-ace3-914d7d82fdc3`)
- **Experiment URL:**
  `https://www.braintrust.dev/app/AdamBelton.com/p/ThoughtForm/experiments/codex%2Fthoughtform-fifa-claude-stable-prompt-cache-20260805-1147`
- **Cache behaviour:** turn one wrote 4,363 cache tokens. Turns two through ten
  each read exactly 4,363 tokens, totalling 39,267 cache-read tokens. No later
  turn rewrote the prefix and the complete run remained inside the five-minute
  TTL.
- **Cost and usage:** estimated cost fell from $0.25 to $0.18. Inclusive input
  tokens changed from 60,692 to 60,057, output tokens from 12,799 to 12,712,
  reasoning tokens from 1,650 to 1,436, and total tokens from 73,491 to 72,769.
  Cache reads represented 65.4% of inclusive input tokens.
- **Latency:** relative to the uncached structured baseline, median turn latency
  fell from 17.300 to 15.669 seconds, maximum latency from 76.085 to 28.668
  seconds, and complete-run duration from 244.84 to 161.11 seconds. Relative to
  the earlier unstructured medium run, median latency was essentially unchanged
  at 15.463 versus 15.669 seconds.
- **Behaviour:** complete conversation, structured output, readiness, final
  intention, first-person canonical material, identity continuity, conceptual
  coverage, and unresolved practical tension scored 100%. One-question
  discipline scored 90% because turn two contained one rhetorical question and
  one direct question. There were no repairs or model errors.
- **Quality:** complete-output inspection found the conversation conceptually
  faithful and the final Idea Map retained one continuous active idea with
  richer substance (2,183 characters). The single question-mark regression did
  not create competing lines of inquiry and is recorded rather than prompt-tuned
  inside the caching experiment.

## Completion audit

- **Stable/dynamic split:** the product and platform request contracts distinguish
  stable system instructions from dynamic context without naming provider cache
  mechanics.
- **Anthropic projection:** the Anthropic client sends two system text blocks;
  only the stable block carries `cache_control: { type: "ephemeral" }`.
- **OpenAI preservation:** the OpenAI client rejoins system and context with the
  same two-newline boundary used before the split; focused tests verify the exact
  combined instructions.
- **Provider evidence:** Braintrust and the repository response normalisation
  independently recorded the cold write and nine equal cache reads.
- **Controlled comparison:** model, medium effort, prompt text, schema, FIFA
  messages, and scorers were unchanged from the clean structured baseline.
- **State boundary:** the complete Draft and Idea Map workspace context is still
  transmitted on every call and is not marked cacheable; no application state is
  delegated to Anthropic.
- **Automated validation:** 230 tests passed with 5 hosted/browser tests skipped;
  typecheck, build, and frozen offline lockfile validation passed.
- **Architecture:** cache policy remains in the concrete Anthropic adapter;
  product code owns only the semantic stable/dynamic context distinction. No
  persistence, host product behaviour, migration, or new architectural role was
  introduced.
