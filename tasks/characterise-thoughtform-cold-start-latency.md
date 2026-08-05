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

Approved; implementation pending a clean branch after the completed
medium-effort baseline is published.

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
