# Complete the Braintrust FIFA baseline

## Goal

Establish a retained, Braintrust-native Claude Sonnet baseline using only the
synthetic FIFA accountability conversation, with enough turns and recorded
state to inspect latency, usage, continuity, and nuanced ThoughtForm behaviour.

## Why this task is next

The first Braintrust export verified behavioural scores but used isolated
OpenAI prompts and did not expose Braintrust-native LLM call or token metrics.
ThoughtForm's primary baseline is Claude Sonnet, and the existing ten-turn FIFA
scenario exercises context growth, distinctions, uncertainty, Idea Map
evolution, reflection, and practical tension without codifying personal data.

## Scope

- Use only the repository-owned synthetic FIFA accountability scenario for
  focused contracts and sustained evaluation.
- Run the complete ten-turn conversation through Claude Sonnet.
- Apply Braintrust's Anthropic wrapper only inside the synthetic evaluation.
- Preserve complete per-turn conversation, raw output, Idea Map, validation,
  latency, provider usage, cache, reasoning, and identity-retention evidence.
- Score structured output, readiness, final reflection intention, first-person
  canonical material, sustained idea identity, conceptual coverage, and
  unresolved practical tension with deterministic repo-owned criteria.
- Retain the experiment in the configured `ThoughtForm` Braintrust project and
  record its URL, metrics, and limitations.

## Out of scope

- Personal conversation fixtures or evaluation data.
- Automatic Braintrust provider instrumentation in mounted application traffic.
- Demo telemetry.
- OpenAI comparison runs.
- LLM-as-judge scoring, prompt changes, or behaviour tuning.
- Streaming, time-to-first-token, or prompt-caching implementation.

## Expected files to create or modify

- `packages/ai/src/providers/anthropic-llm-client.ts` and its tests for explicit
  client decoration without a Braintrust dependency.
- `packages/products/src/thoughtform/testing/evaluations/` for the FIFA
  Braintrust runner, reusable reporting, and deterministic tests.
- Package manifests and lockfile only if dependency ownership requires them.
- `docs/local-development.md`, `progress.md`, and task records.

## Definition of done

- Braintrust reports at least ten Claude LLM calls for the complete FIFA
  conversation, with any provenance-repair calls distinguishable.
- Input, output, cache, reasoning, duration, and total-token metrics are present
  where Anthropic reports them.
- Every evaluation input derives from the FIFA fixture; no personal scenario is
  included in this Braintrust suite.
- All deterministic behavioural criteria pass or failures are recorded honestly.
- The experiment exists under Braintrust project ID
  `9c56aca1-7e54-4e73-ace3-914d7d82fdc3`.
- The experiment link, baseline values, and limitations are recorded.
- Runtime owner/demo instrumentation is unchanged.
- Tests, typecheck, build, frozen lockfile validation, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm install --lockfile-only --offline --frozen-lockfile
git diff --check
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform-braintrust
```

## Risks / questions

- The approved hosted run makes ten paid Claude calls and may make one repair
  call when a response fails provenance validation.
- Cache and reasoning metrics may legitimately be absent or zero when Anthropic
  does not report them for this profile or request shape.
- Deterministic criteria make regressions reproducible but do not replace later
  human review or a separately approved calibrated judge.
- The full conversation is intentionally a deeper baseline and will take longer
  than the earlier three-prompt contract check.

## Approval record

- **Approved:** 5 August 2026 by Adam.
- **Intentional boundaries:** Claude Sonnet is the primary baseline; use the
  complete FIFA conversation for all evaluation inputs; record full synthetic
  content and Braintrust-native model accounting; keep wrapper instrumentation
  evaluation-only.
- **Important deferrals:** OpenAI comparison, LLM judges, prompt changes,
  streaming, caching implementation, and mounted-runtime automatic wrapping.
- **Do not reopen without new evidence:** do not introduce personal information
  into evaluation fixtures merely to diversify or deepen the suite.

## Status

Complete.

## Completion record

- **Experiment:**
  `codex/thoughtform-fifa-braintrust-baseline-1785922258`
- **Braintrust project:** `ThoughtForm`
  (`9c56aca1-7e54-4e73-ace3-914d7d82fdc3`)
- **Experiment URL:**
  `https://www.braintrust.dev/app/AdamBelton.com/p/ThoughtForm/experiments/codex%2Fthoughtform-fifa-braintrust-baseline-1785922258`
- **Calls and usage:** 10 native Claude calls; 60,860 input, 18,816 output,
  79,676 total, and 8,087 provider-reported reasoning tokens; no cache reads or
  writes; no repair calls; estimated cost $0.31.
- **Latency:** 28.0-second median turn; 202.754-second maximum turn; 513.85
  seconds end to end.
- **Behaviour:** complete conversation, structured output, readiness, final
  reflection intention, first-person canonical material, identity continuity,
  conceptual coverage, and unresolved practical tension scored 100%.
  One-question discipline scored 90% because turn one asked two questions.
- **Measurement limitation:** the wrapped non-streaming Anthropic request logs
  `time_to_first_token` when the complete response arrives. The reported
  51.38-second aggregate must not be interpreted as streaming TTFT.

## Completion audit

- **FIFA-only evaluation content:** the Braintrust runner selects only
  `fifaAccountability`; the experiment input contains its ten synthetic turns,
  and a branch search found no personal scenarios in the Braintrust runner or
  scorer fixtures.
- **Claude and native accounting:** the evaluator decorates the repository
  Anthropic client with `wrapAnthropic`; Braintrust retained ten `llm` spans and
  reported tokens, cost, duration, and per-call timing.
- **Complete per-turn evidence:** the root output contains each FIFA user
  message, assistant response, raw model output, Idea Map, validation result,
  repair count, latency, usage, cache, reasoning, and identity metrics.
- **Deterministic behaviour:** focused scorer tests cover the nine criteria. The
  hosted result records eight perfect scores and the 90% one-question result
  rather than weakening the criterion.
- **Correct target:** a read-only Braintrust API query verified experiment
  `b3d284ea-02a7-40be-9bd1-64a44ae9ab2a` belongs to approved project
  `9c56aca1-7e54-4e73-ace3-914d7d82fdc3`.
- **Runtime boundary:** the only runtime-capable change is an optional Anthropic
  client decorator whose default is identity; only the synthetic runner supplies
  Braintrust's wrapper. Owner and demo mounting are unchanged.
- **Automated validation:** 227 tests passed with 5 hosted/browser tests skipped;
  typecheck, build, frozen offline lockfile validation, and `git diff --check`
  passed.
- **Branch audit:** the complete diff adds no host product behaviour, persistence
  change, migration, personal fixture, or unsupported documentation claim. The
  unrelated existing Task 036 edit remains outside this task's change set.
