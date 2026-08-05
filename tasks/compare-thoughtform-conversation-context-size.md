# Compare ThoughtForm conversation context size

## Goal

Determine whether reducing the conversation history sent to Claude materially
improves time-to-first-token and cost without harming conversational continuity,
empathy, nuance, relevance, or contract reliability.

## Why this task is next

The plain-text output experiment improved aggregate median useful-text TTFT by
only 83 ms and reduced contract reliability. Conversation history is the largest
application-controlled part of the request that grows on every turn, so context
size is the next isolated latency variable.

## Scope

- Measure exact UTF-8 payload bytes for the system prompt, workspace/Idea Map
  context, retained history, current user message, and output schema.
- Compare the current complete bounded history with the four and two most recent
  completed conversation turns.
- Hold Sonnet 5, medium effort, structured output, prompt policy, output schema,
  FIFA content, per-turn Idea Map snapshot, cache protocol, and quality criteria
  constant.
- Build one deterministic progressive FIFA Idea Map from user-established
  fixture text and supply the same snapshot to every variant at each turn.
- Run at least 30 calls per variant using balanced variant ordering and cache
  expiry controls.
- Record provider/useful-text TTFT, completion, token usage, cache state, output
  size, contract issues, estimated cost inputs, and per-turn payload composition.
- Apply the same Braintrust quality criteria to all variants and make an
  evidence-backed recommendation.

## Out of scope

- Production behavior changes or mounted verification unless a later approved
  task adopts a winning treatment.
- Conversation summaries, summarisation calls, or provider-managed state.
- Prompt, schema, Idea Map architecture, model, effort, token-limit, cache-TTL,
  service-tier, retry, or pre-warming changes.
- Personal or owner conversation content.
- Additional evaluation scenarios in this first experiment.

## Expected files to create or modify

- `packages/products/src/thoughtform/testing/evaluations/` for context strategy,
  payload measurement, runner, and focused tests.
- Product and root package scripts.
- `docs/local-development.md`, `progress.md`, and this task record.

## Definition of done

- Exact payload composition is reported for every variant and turn.
- At least 30 calls per variant complete under the balanced protocol.
- Timing, tokens, cache, cost inputs, reliability, and quality are recorded.
- Results distinguish early turns from later context-heavy turns.
- Any speed improvement is assessed against continuity and nuance loss.
- No production behavior changes.
- Focused tests, full tests, typecheck, build, Playwright, frozen lockfile
  validation, and `git diff --check` pass.
- The requirement-by-requirement and complete branch-diff audit is recorded.

## Validation commands

```txt
pnpm exec vitest run packages/products/src/thoughtform/testing/evaluations/conversation-context-size.test.ts
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
pnpm install --lockfile-only --offline --frozen-lockfile
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform-context-size
git diff --check
```

## Risks / questions

- Ten turns may not expose the full benefit of truncation; per-turn growth will
  show whether a longer synthetic scenario is warranted later.
- FIFA exercises sustained continuity but not every correction, selection, or
  draft-related flow.
- Provider variance may exceed context-size effects, so balanced ordering and
  cache-expired repetitions are required.
- Two turns may deliberately expose a poor quality boundary; inclusion does not
  imply it is expected to be the production choice.
- The progressive evaluation Idea Map is deterministic test support, not a
  replacement for product Idea Map analysis.

## Status

Complete on `codex/thoughtform-context-size-evaluation`; not yet committed or
published.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** compare only retained conversation-history size
  while keeping Sonnet 5, medium effort, structured output, prompt policy,
  output schema, FIFA content, cache protocol, and per-turn Idea Map input
  constant.
- **Important deferrals:** summaries, provider-managed state, additional
  fixtures, production adoption, model/effort changes, and Idea Map architecture.
- **Implementation decisions:** measure exact payload segments before paid
  execution; use full bounded history, four completed turns, and two completed
  turns; build shared per-turn deterministic Idea Map snapshots only from prior
  FIFA user messages; balance three-variant ordering across repetitions.
- **Do not reopen without new evidence:** structured output remains the baseline,
  the paid run uses only repository-owned FIFA content, and this task makes no
  production behavior change.

## Results

The completed Braintrust experiment is
[`codex/thoughtform-context-size-comparison-20260805`](https://www.braintrust.dev/app/AdamBelton.com/p/ThoughtForm/experiments/codex%2Fthoughtform-context-size-comparison-20260805).
Three cache-expired, order-rotated repetitions produced 30 calls per variant and
nine same-model transcript judgments. Braintrust recorded 99 total model calls,
no provider errors, and an estimated experiment cost of $0.80 including judges.

| Metric | Full bounded history | Four recent turns | Two recent turns |
| --- | ---: | ---: | ---: |
| Useful TTFT range | 2,861–13,476 ms | 2,818–22,626 ms | 2,861–40,720 ms |
| Median provider TTFT | 4,482 ms | 4,206 ms | 3,816 ms |
| Median useful TTFT | 4,847 ms | 4,491 ms | 3,987 ms |
| Median completion | 9,449 ms | 8,816 ms | 8,993 ms |
| Median provider-input bytes | 9,063 | 8,772 | 7,527 |
| Total input tokens | 101,761 | 94,141 | 86,627 |
| Total output tokens | 15,204 | 15,149 | 15,294 |
| Cache reads / writes | 60,407 / 2,083 | 60,407 / 2,083 | 60,407 / 2,083 |
| Contract-valid calls | 29/30 | 30/30 | 30/30 |

The invariant payload segments were a 4,503-byte system prompt and 860-byte
output schema. The progressive workspace context grew from 174 bytes on turn 1
to 1,751 bytes on turn 10 and was identical across variants. History alone grew
to roughly 6–6.6 KB in the full variant on turn 10, remained roughly 3.2–3.4 KB
with four turns, and roughly 1.65–1.7 KB with two turns. Current-message size
ranged from 115 to 179 bytes.

Two turns reduced median useful TTFT by 860 ms (17.7%) and input tokens by
14.9% relative to full history. Four turns reduced median useful TTFT by 356 ms
(7.3%), median completion by 633 ms (6.7%), and input tokens by 7.5%. Neither
strategy made latency reliably sub-five-seconds: provider variance remained
large, and the shortened variants produced the two worst outliers.

The three transcript judges scored four turns at 3.3/5 empathy, 4.3 nuance,
5 continuity, 5 relevance, and 4 question quality. Two turns scored 3 empathy,
4.3 nuance, 5 continuity, 5 relevance, and 4 question quality. Full history
scored 3.7 empathy, 3.7 nuance, 3 continuity, 3.7 relevance, and 3.3 question
quality. Those full-history aggregate scores are confounded by one malformed
turn in repetition 3, where the constrained response contained no useful text
or complete readiness metadata. They do not establish that truncation improves
quality; they do show no observed continuity loss when the progressive Idea Map
preserved earlier user-established material.

## Findings and recommendation

Do not adopt two-turn history. Its median TTFT improvement is meaningful, but
its 40.7-second worst case shows that smaller context does not control provider
tail latency, and it removes more verbatim conversational detail than this one
fixture can safely validate.

Four recent completed turns is the only treatment worth mounted verification.
It modestly improves TTFT, completion, and input usage; retains more recent
dialogue; and showed no quality or contract regression in this experiment. The
effect is not large enough for immediate production adoption. A separate task
should verify four-turn history through the real owner FIFA flow and explicitly
inspect continuity before changing the default.

## Completion audit

- The adapter receives the exact production-built request, changes only retained
  history, and records exact UTF-8 bytes for system, context, history, current
  message, output schema, and provider input.
- Full, four-turn, and two-turn variants completed 30 calls each using all three
  order positions and three cache-expired repetitions. Provider cache counters
  were identical across variants.
- Every variant received the same deterministic, progressive FIFA Idea Map for
  each turn. It contains only prior user fixture text and leaks no future turn.
- Braintrust retained all measurements and same-model quality judgments. Exact
  ranges and medians, token totals, contract failures, and the quality confound
  are recorded above without unsupported percentile claims.
- Production services, prompts, output schema, persistence, host wiring, and
  mounted behavior are unchanged. The experiment is product-owned test support.
- Focused tests passed (5), the full suite passed (259 with 5 skipped), typecheck
  and build passed, the frozen offline lockfile check passed, Playwright passed
  all 3 scenarios, and `git diff --check` passed. The first sandboxed Playwright
  launch could not create its local tsx IPC socket; the identical command passed
  outside that restriction.
- The complete branch diff adds only product-owned evaluation behavior and test
  support, package command exposure, development documentation, the approved
  task record, and progress evidence. It introduces no host behavior,
  persistence, migration, duplicated product decision, or unsupported mounted
  claim. The unrelated pre-existing edit in
  `tasks/036-complete-demo-session.md` remains user-owned and outside this task.
