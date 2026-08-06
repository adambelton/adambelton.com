# Characterise ThoughtForm cold-start latency

## Goal

Identify which measurable conditions produce ThoughtForm's approximately
33-second cold first-token outliers, determine whether the gap is caused by
prompt-cache state, connection/client reuse, structured-output first use,
provider variance, or host overhead, and recommend one evidence-backed next
optimisation without weakening model quality.

## Why this task is next

Mounted Sonnet 5 medium-effort verification ranged from 2.481 to 33.107 seconds
for provider first token. The final warm client first token met the target at
3.448 seconds, but the first two calls exceeded 33 seconds despite the second
call reporting prompt-cache reads. That evidence is too small and internally
mixed to justify pre-warming, a longer cache lifetime, connection changes, or
another architectural intervention.

The current instrumentation already separates provider first token, assistant
retention, and Idea Map completion. A controlled cold/warm protocol is therefore
the smallest next step that can distinguish a recurring system condition from
ordinary provider variance.

## Scope

- Define explicit test states for fresh API process/fresh Anthropic client,
  reused process/client, prompt-cache creation, and prompt-cache read.
- Add a synthetic FIFA-only diagnostic runner that uses the real ThoughtForm
  conversation request construction, Claude prompt, output schema, Sonnet 5
  model, medium effort, Anthropic adapter, and Braintrust observation fields.
- Keep conversation generation and Idea Map analysis separately attributable,
  including whether their distinct output schemas are being used for the first
  time in a run.
- Run at least three cold-to-warm sequences, each containing one fresh-client
  call followed by two immediate reused-client calls.
- Repeat at least one warm-cache request with a fresh Anthropic client during
  the same cache lifetime to separate connection/client reuse from prompt-cache
  reuse.
- Confirm the resulting hypothesis with one synthetic mounted owner sequence
  through the real Vite, Hono, Prisma, Anthropic, and Braintrust composition.
- Report server and client first-token time, assistant retention, Idea Map
  completion, cache creation/read state, tokens, reasoning, output size, errors,
  and estimated cost for every sample.
- Compare range, median, and cold-versus-warm distributions without claiming a
  percentile that the sample size cannot support.
- Inspect current Anthropic provider documentation for relevant cache lifetime,
  structured-output compilation, service-tier, and connection guidance, while
  distinguishing documented behavior from inference.
- Produce a recommendation and a separately approvable implementation proposal
  if the evidence supports a change.

## Out of scope

- Changing Sonnet 5, medium effort, prompts, output schemas, FIFA inputs, or
  product behavior.
- Adopting a faster model, fast mode, priority service tier, or weaker reasoning
  configuration.
- Pre-warming the model or prompt cache in production.
- Changing the prompt-cache lifetime.
- Conversation-history reduction, Idea Map deltas, tool conversion, or
  provider-managed conversation state.
- WebSockets, queues, retries, speculative duplicate requests, or background
  calls on workspace load.
- Production deployment or production traffic experiments.
- Personal conversation content or temporary-demo telemetry.

## Expected files to create or modify

- `packages/products/src/thoughtform/testing/evaluations/` for the FIFA-only
  cold/warm diagnostic protocol and result aggregation.
- `packages/ai` or `apps/api` tests only if a small read-only timing or
  client-lifecycle seam is required; no runtime behavior change is expected.
- Package scripts and local-development documentation for the opt-in paid run.
- `progress.md` and this task record.

## Definition of done

- Every sample records whether its Anthropic client is fresh or reused and
  whether the stable prompt prefix is written, read, or neither.
- At least nine controlled FIFA conversation samples complete across three
  cold-to-warm sequences, plus a warm-cache/fresh-client comparison.
- Conversation and Idea Map calls remain separately visible and all calls
  explicitly record Sonnet 5 with medium effort.
- One post-diagnostic mounted owner sequence confirms whether the measured
  behavior appears in the real interface composition.
- Results report exact sample values, range, median, cache state, usage,
  reasoning, cost, errors, and observed output quality.
- Findings explicitly state which hypotheses are supported, contradicted, or
  still unresolved; correlation is not reported as provider causation.
- No production mitigation is implemented inside the diagnostic task.
- Focused tests, full tests, typecheck, build, frozen lockfile validation,
  mounted verification, and `git diff --check` pass.
- Documentation and the requirement-by-requirement branch-diff audit are
  complete.

## Validation commands

```txt
pnpm exec vitest run <focused diagnostic and aggregation tests>
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
RUN_HOSTED_EVALUATIONS=true pnpm <approved cold-warm diagnostic command>
git diff --check
```

## Risks / questions

- Provider latency is naturally variable; this sample can identify a strong
  repeated pattern but cannot establish production percentiles.
- A genuine five-minute cache-expiry comparison lengthens the run and incurs
  additional cache-write cost; the implementation should use the minimum waits
  needed to preserve valid state labels.
- Anthropic structured-output grammar caching may outlive the diagnostic run,
  making true first-ever schema compilation impractical to reproduce. That
  hypothesis may remain unresolved rather than being simulated with a changed
  schema.
- A cache read did not prevent the second observed 33-second outlier, so prompt
  caching must not be assumed to be a latency cure.
- Paid provider calls require explicit approval and must use only the existing
  synthetic FIFA fixture.

## Status

Complete and merged through PR #15.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** diagnose the cold/warm latency gap while holding
  Sonnet 5, medium effort, prompts, schemas, FIFA content, and product behavior
  constant.
- **Important deferrals:** production pre-warming, cache-lifetime changes,
  faster modes or models, priority service tiers, prompt/history reduction,
  tools, queues, and production traffic experiments.
- **Implementation decisions:** choose the smallest diagnostic seam that can
  label fresh/reused clients and prompt-cache state without adding runtime
  behavior; use exact samples and medians rather than unsupported percentile
  claims.
- **Do not reopen without new evidence:** prompt caching is not presumed to
  explain or solve the outliers, because the second observed 33-second call was
  already a cache read; only the repository-owned FIFA fixture may be used.

## Results

### Controlled provider diagnostic

Three provider-confirmed sequences used Sonnet 5, medium effort, the unchanged
conversation and Idea Map prompts and schemas, and the first three FIFA fixture
turns. Each first turn wrote both stable prefixes; each later turn read both.
An earlier nominal sequence inherited a prior cache entry and is deliberately
excluded. The runner now fails when provider counters contradict its labels.

| Sequence | Turn | Client | Cache | Conversation TTFT / complete | Idea Map TTFT / complete |
| --- | ---: | --- | --- | ---: | ---: |
| 1 | 1 | fresh | write | 5,517 / 9,599 ms | 2,779 / 6,162 ms |
| 1 | 2 | reused | read | 3,409 / 7,634 ms | 2,699 / 7,926 ms |
| 1 | 3 | reused | read | 2,870 / 7,560 ms | 2,080 / 8,448 ms |
| 2 | 1 | fresh | write | 3,592 / 7,988 ms | 3,824 / 7,180 ms |
| 2 | 2 | reused | read | 4,469 / 9,124 ms | 3,741 / 8,703 ms |
| 2 | 3 | reused | read | 5,422 / 10,605 ms | 1,798 / 8,404 ms |
| 3 | 1 | fresh | write | 4,681 / 8,220 ms | 4,376 / 7,590 ms |
| 3 | 2 | reused | read | 3,213 / 7,272 ms | 3,010 / 7,027 ms |
| 3 | 3 | reused | read | 11,402 / 15,602 ms | 2,084 / 8,903 ms |

Conversation TTFT ranged from 2,870 to 11,402 ms with a 4,469 ms median;
completion ranged from 7,272 to 15,602 ms with an 8,220 ms median. Cold-write
TTFT had a 4,681 ms median; warm reused-cache TTFT had a 3,939 ms median but a
wider 2,870–11,402 ms range. The largest outlier was therefore a warm cache read
on a reused client. Idea Map TTFT ranged from 1,798 to 4,376 ms with a 2,779 ms
median; completion ranged from 6,162 to 8,903 ms with a 7,926 ms median.

The nine turns made 18 calls using 47,033 input tokens, 9,033 output tokens,
25,152 cache-read tokens, 12,576 cache-write tokens, and no reported reasoning
tokens. Estimated cost was approximately $0.15, or about $0.05 per three-turn
sequence. Direct evaluation has no HTTP client or persistence boundary, so
client timing and assistant-retention timing are not applicable to these rows.
All calls parsed against their unchanged structured-output schemas without an
error. Inspection found coherent, relevant FIFA responses and Idea Map state;
this diagnostic did not introduce a separate subjective quality score.

Two exact fresh-client warm-cache comparisons also contradicted connection
reuse as a material latency explanation: 4,911 ms cold-write versus 5,214 ms
fresh/read, and 4,681 ms cold-write versus 5,215 ms fresh/read.

### Mounted owner confirmation

Conversation `40b9c3d9-d8e6-4350-b29a-8b5856383399` ran the same first three
FIFA turns through Vite, Hono, Prisma, Anthropic, Braintrust, and the owner UI.

| Turn | Cache | Server / client TTFT | Provider / client complete | Retention | Idea Map complete | Usage (input / output / reasoning) | Cost |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | write | 12,559 / 13,250 ms | 16,222 / 17,353 ms | 443 ms | 8,050 ms | 4,428 / 1,594 / 269 | $0.027 |
| 2 | read | 8,998 / 9,703 ms | 12,983 / 14,203 ms | 515 ms | 8,183 ms | 5,343 / 1,451 / 98 | $0.018 |
| 3 | read | 7,871 / 8,637 ms | 12,011 / 13,322 ms | 544 ms | 10,742 ms | 5,961 / 1,624 / 155 | $0.021 |

The mounted sample showed a cold-to-warm improvement but no sub-five-second
client first token. Its conversation output remained nuanced and responsive to
the user's distinctions; the Idea Map advanced after every turn. There were no
provider, persistence, stream, or client errors. Total estimated cost was
approximately $0.065.

### Findings and recommendation

- **Prompt-cache state:** contradicted as a sufficient explanation or latency
  cure. Warm reads were sometimes faster, but the largest controlled outlier
  was also a warm read.
- **Connection/client reuse:** contradicted as a material explanation in the two
  exact fresh-client warm-cache comparisons.
- **Structured-output first use:** unresolved and not reproducible without
  changing the fixed schema. Anthropic documents a 24-hour compiled-grammar
  cache, so all repeated samples may use an existing grammar artifact.
- **Host overhead:** not the dominant delay. Mounted client first token followed
  provider first token by 691–766 ms, and retention took 443–544 ms.
- **Provider variance:** supported as the best current inference, not established
  provider causation. Standard-tier Sonnet 5 calls varied substantially under
  equivalent warm conditions.

Anthropic's current documentation says the default prompt-cache TTL is five
minutes, cache entries become available once the first response begins, and
cache usage must be verified from response counters. It also says structured
outputs add first-use grammar-compilation latency and cache the compiled grammar
for 24 hours. Standard tier is best-effort; Priority Tier is no longer available
for new commitments and does not support Sonnet 5. Anthropic publishes no
Messages API guidance that would make SDK client reuse a guaranteed TTFT
optimisation. See [prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching),
[structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs),
and [service tiers](https://platform.claude.com/docs/en/api/service-tiers).

Do not implement pre-warming, a longer cache TTL, or client reuse as a latency
mitigation from this evidence. Keep caching for its clear input-cost benefit.
The next optimisation should instead be a separately approved, larger
evaluation of the conversation call's stable input and output contract: hold
Sonnet 5 medium and response quality constant while measuring whether reducing
uncached per-turn context and constrained-output work improves TTFT and tail
latency. A larger sample is necessary before choosing a production change.

## Completion audit

- Explicit fresh/reused client and provider-confirmed write/read states are
  represented in the diagnostic contract and enforced by focused tests.
- Nine valid cold-to-warm FIFA turns across three sequences, plus two
  fresh-client warm-cache comparisons, are reported above. Conversation and
  Idea Map calls remain separate and every call recorded Sonnet 5, Anthropic,
  and medium effort.
- The mounted owner sequence exercised the real client, API, Prisma development
  database, Anthropic adapter, and Braintrust composition. Exact server/client
  TTFT, provider/client completion, retention, Idea Map completion, usage,
  reasoning, cache state, errors, quality observations, and estimated cost are
  recorded above.
- Findings classify every approved hypothesis without reporting correlation as
  provider causation. No production mitigation was implemented.
- Focused tests, 249 full tests, three Playwright tests, typecheck, build, frozen
  offline lockfile validation, mounted verification, and `git diff --check`
  passed.
- The complete branch diff keeps diagnostic behavior and verification in the
  product-owned evaluation boundary. Package scripts only expose that runner;
  no host behavior, persistence contract, schema, migration, prompt, output
  schema, model, effort, or production dependency boundary changed. The
  unrelated existing edits in `tasks/036-complete-demo-session.md` remain
  user-owned and outside this task.
