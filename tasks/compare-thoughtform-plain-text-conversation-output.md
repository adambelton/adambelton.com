# Compare ThoughtForm plain-text conversation output

## Goal

Determine whether removing Anthropic constrained structured output from the
conversation response improves first-token latency, streaming behavior,
completion time, and cost without reducing conversational quality.

## Why this task is next

Conversation and Idea Map calls are now independent. The completed cold-start
diagnostic contradicted prompt-cache state and Anthropic client reuse as
sufficient latency explanations and found that most mounted delay remains
inside the conversation provider call. Constrained conversation output is the
smallest remaining application-controlled variable on that critical path.

## Scope

- Compare the current structured JSON conversation output with an experimental
  unconstrained text envelope while keeping Sonnet 5, medium effort, semantic
  prompt policy, FIFA inputs, history, Idea Map context, and downstream
  conversation behavior constant.
- Preserve response, move, readiness, and intention semantics in both variants;
  the experimental adapter may translate a validated unconstrained provider
  envelope back into the existing product contract.
- Run at least 30 conversation calls per variant across repeated paired or
  alternating sequences, with cache state and client lifecycle recorded and
  balanced.
- Measure server/provider and useful-text first token, completion, usage, cache
  state, output size, parse errors, estimated cost, and streaming progression.
- Apply the same Braintrust quality criteria to both variants, covering empathy,
  nuance, continuity, relevance, and question quality alongside the existing
  product-contract checks.
- If plain text wins offline, confirm it with one mounted owner FIFA sequence.
- Produce an evidence-backed recommendation without changing the production
  default.

## Out of scope

- Prompt-policy changes beyond the output-envelope instruction required by the
  variant.
- Conversation-history or Idea Map context reduction.
- Model, effort, cache TTL, service tier, or provider changes.
- Removing structured output from Idea Map analysis.
- Production migration, retries, speculative calls, or pre-warming.

## Expected files to create or modify

- `packages/products/src/thoughtform/testing/evaluations/` for the comparative
  runner, scoring, aggregation, and tests.
- A product-owned experimental conversation-model adapter seam if required.
- `packages/ai` only if the existing optional output-format contract cannot
  issue unconstrained Anthropic requests.
- Package scripts and local-development documentation.
- `progress.md` and this task record.

## Definition of done

- Structured JSON and unconstrained text run against identical FIFA
  conversations with at least 30 conversation calls per variant.
- Cache states and client lifecycle are recorded and balanced between variants.
- Braintrust evaluates both variants against the same conversational and
  product-contract quality criteria.
- Exact sample values, ranges, and medians are reported without unsupported
  percentile claims.
- Plain-text streaming exposes useful response text incrementally and parse or
  contract failures remain visible.
- If plain text wins, one mounted owner sequence confirms the result.
- No production default changes.
- Focused tests, full tests, typecheck, build, Playwright, frozen lockfile
  validation, and `git diff --check` pass.
- The requirement-by-requirement and complete branch-diff audit is recorded.

## Validation commands

```txt
pnpm exec vitest run <focused evaluation tests>
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm install --lockfile-only --offline --frozen-lockfile
RUN_HOSTED_EVALUATIONS=true pnpm <comparative evaluation command>
git diff --check
```

## Risks / questions

- The current structured response also carries move, readiness, and intention;
  a plain provider response must preserve those semantics or explicitly fail
  rather than silently substituting metadata.
- Structured-output grammar compilation may already be warm, so this compares
  steady-state constrained decoding rather than first-ever compilation.
- Provider variance may exceed the effect size; paired or alternating variants
  and repeated sequences reduce but cannot remove time-of-day bias.
- Unconstrained output may begin faster but be less reliable at its metadata
  boundary. Parse failures are part of the result, not something to repair away.
- At least 60 paid conversation calls plus quality evaluation will incur
  Anthropic usage.

## Status

Complete and merged through PR #16.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** compare only the conversation provider output
  contract while holding Sonnet 5, medium effort, semantic prompt policy, FIFA
  content, history, Idea Map context, and downstream behavior constant.
- **Important deferrals:** context reduction, model or effort changes, cache TTL,
  service tier, Idea Map output changes, pre-warming, retries, and production
  migration.
- **Implementation decisions:** choose the smallest experiment-only adapter
  that can expose useful plain text while translating validated metadata into
  the existing product contract; balance variant ordering and cache state; use
  exact samples and medians.
- **Do not reopen without new evidence:** the production default remains
  structured output during this task, and only the repository-owned FIFA fixture
  may be used for paid evaluation.

## Results

The completed Braintrust experiment is
[`codex/thoughtform-plain-text-comparison-20260805`](https://www.braintrust.dev/app/AdamBelton.com/p/ThoughtForm/experiments/codex%2Fthoughtform-plain-text-comparison-20260805).
It contains every exact per-turn measurement and all six judged transcripts.
Three alternating paired repetitions produced 30 conversation calls per variant
and six identical Sonnet 5 medium-effort transcript judgments. Each repetition
began after more than Anthropic's five-minute cache lifetime; both variants
recorded one cache write followed by nine reads. The same empty Idea Map context
was supplied to both variants so output-contract behavior was the only product
variable.

| Metric | Structured JSON | Plain text plus metadata |
| --- | ---: | ---: |
| Useful-text TTFT range | 3,089–12,472 ms | 3,272–14,743 ms |
| Median provider TTFT | 6,046 ms | 5,969 ms |
| Median useful-text TTFT | 6,052 ms | 5,969 ms |
| Median completion | 11,681 ms | 11,002 ms |
| Useful text below 5 seconds | 8/30 | 13/30 |
| Contract-valid calls | 29/30 | 26/30 |
| Input / output tokens | 95,279 / 17,872 | 84,268 / 18,157 |
| Cache reads / writes | 56,241 / 6,249 | 44,307 / 4,923 |
| Estimated measured-call cost | $0.271 | $0.273 |

Plain text was faster on 18 paired turns and structured output on 12. The
paired plain-text-minus-structured difference had a -679 ms median but ranged
from -6,435 to +7,860 ms. The aggregate useful-TTFT median improved by only 83
ms (1.4%), while the plain-text worst case was 2,271 ms slower. Completion was
679 ms faster at the median, but neither variant approached a dependable
sub-five-second result.

| Repetition | Structured useful TTFT median | Plain useful TTFT median | Structured / plain failures |
| ---: | ---: | ---: | ---: |
| 1 | 5,535 ms | 4,139 ms | 0 / 2 |
| 2 | 5,602 ms | 6,089 ms | 0 / 1 |
| 3 | 6,688 ms | 6,084 ms | 1 / 1 |

Cold useful-text TTFT was 7,615, 5,489, and 6,493 ms for structured output and
3,272, 4,029, and 6,712 ms for plain text. Warm medians were 5,727 and 6,004 ms
respectively, so the result does not support a general warm-call advantage for
plain text.

Plain text omitted its metadata envelope on 4/30 calls: turns 2 and 6 of the
first repetition and turn 6 in both later repetitions. Turn 6 therefore failed
systematically in every plain-text transcript. No retry or repair hid those
failures; the experimental adapter retained the visible prose and recorded the
missing move/readiness metadata. Structured output had one stricter product
contract issue where only one readiness action was returned, despite remaining
valid against Anthropic's projected schema.

The quality judge tied both variants at 3/5 empathy, 5/5 continuity, 5/5
relevance, and 4/5 question quality in every repetition. Structured nuance was
4/5 throughout; plain text scored 4, 4, and 5. The qualitative rationales found
both variants coherent, relevant, and faithful to the evolving FIFA argument,
with similarly restrained empathy and occasional either/or questions. There is
no evidence of a meaningful quality difference.

Braintrust estimated $0.61 for the complete experiment, including 60 measured
conversation calls and six quality-judge calls. There were no provider errors.
The conditional mounted owner sequence was not run because plain text did not
win: its negligible median TTFT change, slower worst case, equal cost, and four
metadata failures make it unsuitable for production verification.

## Findings and recommendation

Keep the structured JSON conversation output. Removing constrained output does
not materially improve first-token latency or cost, and it makes product
metadata substantially less reliable. The provider sometimes emits plain prose
earlier, but that advantage is too small and inconsistent to justify losing
move, readiness, and intention guarantees.

The next meaningful experiment is changing context size rather than output
format: compare the current complete bounded history with smaller, explicitly
defined context variants while holding Sonnet 5 medium, structured output,
semantic prompt policy, FIFA content, cache protocol, and quality judgment
constant.

## Completion audit

- The runner alternates variant order, creates a fresh client for each sequence,
  verifies cache state from provider counters, and records provider/useful TTFT,
  completion, usage, output size, contract issues, model, and cost inputs.
- Thirty calls per variant completed across three cache-expired paired FIFA
  repetitions. Exact per-turn values and transcript judgments are retained in
  the linked Braintrust experiment; ranges, medians, paired differences,
  repetition breakdowns, usage, reliability, quality, and cost are recorded
  above.
- Both variants translate into the same product response, move, readiness, and
  intention contract. The plain-text adapter is evaluation-only; no production
  default or runtime behavior changed.
- The plain-text decoder exposes user-facing prose incrementally before the
  metadata suffix. Its parser records malformed or missing metadata without a
  retry or repair.
- The mounted verification criterion was conditional on an offline plain-text
  win. That condition was not met, so no mounted variant was introduced.
- Focused tests, 254 full tests, three Playwright tests, typecheck, build, frozen
  offline lockfile validation, and `git diff --check` passed.
- The complete branch diff places experiment behavior, aggregation, and tests in
  the product-owned evaluation boundary. Package scripts only expose the paid
  runner. No host behavior, persistence, schema, migration, prompt policy,
  production provider adapter, or dependency boundary changed. The unrelated
  existing edit in `tasks/036-complete-demo-session.md` remains user-owned and
  outside this task.
