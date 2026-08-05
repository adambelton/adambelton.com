# Verify mounted ThoughtForm at medium effort

## Goal

Make Anthropic effort an explicit host configuration, align the development
runtime with the retained Sonnet 5 medium-effort evaluation baseline, and repeat
mounted FIFA verification with phase-separated latency and usage evidence.

## Why this task is next

The split streaming task's controlled FIFA evaluations used medium effort, but
its real mounted verification omitted the effort parameter and therefore used
Sonnet 5's high-effort default. That mismatch invalidates direct latency
comparison between the mounted result and the retained evaluation baseline.

## Scope

- Add provider-owned Anthropic effort configuration to API host assembly.
- Make medium effort the explicit development and evaluation baseline.
- Record the selected effort in owner observations so traces cannot be
  misidentified.
- Run at least five synthetic mounted FIFA samples through the real owner
  composition.
- Measure client and server first-token time, assistant retention time, Idea Map
  completion time, usage, caching, reasoning tokens, and estimated cost.
- Correct prior findings that compare medium-effort evaluations with the
  high-effort mounted run.
- Update progress and task records with evidence and a completion audit.

## Out of scope

- Prompt or output-schema changes.
- Changing the selected model.
- Conversation-history reduction or summarisation.
- Forced-tool conversion.
- WebSockets, queues, or demo telemetry.
- Production deployment configuration.

## Expected files to create or modify

- Anthropic provider configuration contracts and tests in `packages/ai`.
- ThoughtForm API host assembly and owner-observation tests.
- Development environment examples and documentation.
- ThoughtForm evaluation or measurement support where required for comparable
  mounted samples.
- `progress.md` and task records.

## Definition of done

- The mounted development owner flow demonstrably sends `medium` effort.
- Owner observations identify the selected effort and expose phase-separated
  latency for each sample.
- At least five synthetic FIFA samples use the real mounted composition.
- Results distinguish provider first token, assistant retention, and Idea Map
  completion rather than reporting only total request time.
- Findings report usage, caching, reasoning tokens, cost, range, and median
  without treating the earlier high-effort mounted outlier as medium evidence.
- Focused tests, full tests, typecheck, build, frozen lockfile validation,
  mounted verification, and `git diff --check` pass.
- Documentation and the requirement-by-requirement branch-diff audit are
  complete.

## Validation commands

```txt
pnpm exec vitest run <focused provider, host, observation, and measurement tests>
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
git diff --check
```

## Risks / questions

- Five real mounted samples incur provider cost and may encounter natural
  long-tail variance.
- Braintrust dashboard access may require Adam's signed-in browser; repository
  tooling must still retain enough local aggregate evidence to complete the
  comparison.
- Medium effort is an evaluation and development baseline in this task, not an
  implicit production deployment decision.

## Approval record

- **Approved:** 5 August 2026 by Adam after identifying that the retained FIFA
  experiments used medium effort while mounted host assembly still used the
  provider's high-effort default.
- **Intentional boundaries:** align development mounting and measurement with
  the existing medium-effort baseline; preserve the model, prompts, schemas,
  privacy boundary, and temporary-demo exclusion.
- **Important deferrals:** production deployment configuration, per-operation
  effort divergence, smaller models, prompt/history changes, and tool-based
  structured output.
- **Implementation decisions:** expose effort through the concrete Anthropic
  provider/host configuration and make it observable without leaking provider
  mechanics into product contracts.
- **Do not reopen without new evidence:** medium is already the retained
  evaluation baseline; the earlier mounted high-effort outlier is not evidence
  about medium-effort latency.
- **Mounted defect extension approved:** 5 August 2026 after the five-sample
  verification showed complete-message rendering and a stale Idea Map. Forward
  the existing stream callbacks through the persistent editor boundary and add
  regression coverage; do not change provider, prompt, schema, or persistence
  behavior.

## Status

Complete.

## Outcome

The mounted API host now accepts `ANTHROPIC_EFFORT`, validates it against the
provider-owned effort values, and passes it into the concrete Anthropic client.
The development example pins `medium`. Owner conversation and Idea Map provider
spans record `effort: medium`; temporary demo operations remain unobserved.

The approved owner verification used six synthetic FIFA turns in conversation
`d0bdb3d5-4c72-4a3a-914b-bb3c1bd8bd1e`. The first five established the
medium-effort timing sample. They also exposed a mounted client defect: the
persistent editor wrapper discarded stream callbacks, causing complete-message
rendering and a stale Idea Map even though revisions 1–3 were retained. The
approved extension forwards the callbacks and adds a controlled regression. A
sixth owner turn confirmed visible incremental rendering and the later Idea Map
event after the fix.

### Mounted measurements

| Turn | Server first token | Client first token | Assistant retained | Idea Map phase complete |
| --- | ---: | ---: | ---: | ---: |
| 1 | 33.107s | 34.265s | 37.276s | 36.782s |
| 2 | 32.947s | 33.872s | 37.548s | 36.958s |
| 3 | 6.891s | 7.599s | 12.271s | 12.103s |
| 4 | 5.590s | 6.512s | 10.373s | 11.167s |
| 5 | 4.877s | 5.744s | 10.706s | 14.894s |
| 6, post-fix | 2.481s | 3.448s | 5.943s | 9.861s |
| Median | 6.241s | 7.056s | 11.489s | 13.499s |

The range is material: cold provider first-token time was about 33 seconds,
while the final warm client first token was 3.448 seconds. Medium effort can
therefore meet the target when warm, but does not guarantee it. The first five
turns retained Idea Map revisions 1–3; the first two valid analyses proposed no
map change. The sixth analysis also retained no revision change but delivered
the completion event to the repaired client.

Across six turns and twelve model calls, Braintrust recorded 36,785 input
tokens, including 20,960 cache-read and 4,192 cache-write tokens, 6,220 output
tokens, and 971 reasoning tokens. Applying the published Sonnet-class standard
rates used by earlier comparisons gives an estimated cost of approximately
$0.15. All calls recorded `model: claude-sonnet-5`, `provider: anthropic`, and
`effort: medium`.

## Completion audit

- **Explicit mounted effort:** `createAnthropicLlmClientOptions` validates and
  supplies `ANTHROPIC_EFFORT`; its host test asserts `medium` reaches the client
  options and unsupported values fail closed.
- **Observable effort and phases:** owner provider adapters record the shared
  `effort` attribute alongside existing provider, model, usage, cache,
  reasoning, server first-token, retention, and correlated client timings.
- **Mounted evidence:** six FIFA-only owner turns used the real Vite, Hono,
  Prisma, Anthropic, and Braintrust composition. Database inspection found all
  turns retained and Idea Map revision 3; the post-fix turn visibly streamed and
  applied its later map event.
- **Measurement completeness:** the table records ranges and medians for server
  and client first token, assistant retention, and complete Idea Map phase. The
  usage record separates cache reads, cache writes, reasoning, output, and
  estimated cost.
- **Validation:** focused tests passed 14/14; full Vitest passed 246 tests with
  5 skipped; recursive typecheck and build passed; frozen offline lockfile
  validation passed; Playwright passed 3/3; `git diff --check` passed.
- **Branch-diff audit:** product behavior remains in `packages/products`; host
  configuration and concrete provider metadata remain in `apps/api`; the
  runtime-neutral observation vocabulary remains in `packages/observability`.
  No schema, migration, prompt, output contract, privacy boundary, or demo
  telemetry changed. The existing unrelated Task 036 edit remains excluded.

## Remaining evidence limits

- This is one sequential conversation, not a latency distribution across
  sessions or cache-expiry windows.
- The UI observation confirms multiple visible updates but does not count every
  provider delta.
- Cost is estimated from token classes and published rates rather than an
  invoice line item.
