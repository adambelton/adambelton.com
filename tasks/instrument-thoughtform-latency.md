# Instrument ThoughtForm Latency

## Goal

Instrument the current combined ThoughtForm owner conversation operation with
the Braintrust SDK and export evaluation-relevant traces, creating
a reproducible latency and quality baseline before changing the workspace
architecture.

## Why this task is next

ThoughtForm conversation turns feel oppressively slow, but the current evidence
does not distinguish provider prompt processing, generation, structured-output
validation and repair, persistence, HTTP transport, or client rendering. The
same measurements must compare the current flow with later prompt caching,
streaming, and separate conversational and Idea Map operations.

## Scope

- Add a platform-owned observability package for contracts and instrumentation
  used by both browser and server runtimes.
- Keep the Braintrust SDK, credentials, and API-host assembly outside the shared
  package.
- Trace one accepted user turn end to end.
- Measure workspace loading, hosted-model requests, available provider timing,
  structured-output validation and repair, Idea Map application, persistence,
  total server response, and client-perceived completion.
- Record complete owner and synthetic-evaluation content alongside dimensions
  and measurements, including provider,
  model, prompt-profile version, token usage, input size, output size, cache
  usage, repair attempts, message and Idea counts, result classifications, and
  durations.
- Extend hosted evaluations to report comparable measurements.
- Make export optional and harmless when it is absent or unavailable.
- Exclude temporary demo traffic from Braintrust entirely and document the
  owner-only telemetry boundary.
- Record baseline results for approved hosted profiles when paid hosted runs are
  explicitly authorised.

## Out of scope

- REST and SSE workspace changes.
- Prompt caching.
- Separating conversation and Idea Map generation.
- Changing prompts, model profiles, or product behaviour.
- Capturing any demo content or metadata, email addresses, or durable raw user
  and conversation identifiers.
- Moving canonical prompts, fixtures, or evaluation rules into Braintrust.
- Production alert thresholds, general website analytics, or Sentry adoption.

## Expected files to create or modify

- `packages/observability/` for shared runtime-neutral contracts and
  instrumentation helpers.
- `packages/ai/src/` for provider timing and usage metadata.
- `apps/api/src/` for Braintrust export and host assembly.
- `packages/products/src/thoughtform/` for operation spans and evaluation
  measurements owned by ThoughtForm.
- `apps/client/src/` or ThoughtForm client-owned actions for client-perceived
  timing submission.
- Package manifests, workspace lockfile, `.env.example`, and local-development
  documentation.
- `docs/decisions.md`, `progress.md`, and `tasks/README.md`.

## Definition of done

- The server phases of a single owner turn are inspectable as one hierarchical
  trace, with client-perceived completion linked by an ephemeral correlation ID.
- Provider duration and total application duration are separately visible.
- Time to first provider chunk is reported where supported by the approved
  provider contract; unsupported measurements are represented honestly.
- Cache reads, cache writes, reasoning tokens, and repair calls are observable
  when providers report them.
- Owner and synthetic content is available for evaluation; no demo event or
  durable raw identity is exported.
- Telemetry failures cannot fail a user turn and export is disabled without
  explicit configuration.
- Hosted scenarios produce comparable latency and quality results.
- Relevant tests, typecheck, build, and diff checks pass.
- Baseline measurements and their limitations are documented.
- The completion audit checks every export point against the owner/demo policy
  and the complete branch diff against repository boundaries.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

Local verification must cover telemetry-disabled host composition and an
explicitly configured Braintrust export. Paid hosted provider runs require
separate explicit authorisation. Automated checks, trace inspection, browser
inspection, and any human verification must be recorded separately.

## Risks / questions

- Provider streaming may be required to observe first-token timing before the
  client-facing SSE task exists; the provider-neutral contract must not promise
  unsupported precision.
- Automatic AI instrumentation cannot distinguish owner from demo traffic, so
  ThoughtForm uses manual spans and explicitly separated service composition.
- Trace correlation must not export durable user or conversation identifiers.
- Export must be asynchronous and bounded so Braintrust never enters the
  user-facing success path.
- Braintrust must not become the source of truth for prompts, fixtures, product
  rules, or evaluation criteria.

## Approval record

- **Approved:** 5 August 2026 by Adam; direct Braintrust SDK use confirmed after
  reviewing the initial OpenTelemetry approach.
- **Intentional boundaries:** adopt Braintrust directly for tracing and
  evaluation; capture complete evaluation-relevant content only for owner and
  synthetic-evaluation flows; exclude the temporary demo from Braintrust
  entirely; preserve repo-owned prompts,
  fixtures, and evaluation criteria; do not begin REST/SSE, prompt caching, or
  the conversation/Idea Map split in this task.
- **Important deferrals:** public-user content tracing and its distinct consent,
  retention, access, and deletion policy; production alerting; workspace
  transport changes; caching; and asynchronous Idea Map processing.
- **Open implementation decisions:** exact span hierarchy, safe correlation
  mechanism, and which provider timing fields can be observed without changing
  mounted user behaviour.
- **Approved package boundary:** because correlation and perceived-latency
  contracts span client and server, shared observability code belongs in a
  package; Braintrust-specific runtime assembly remains host-owned.
- **Owner-only capture amendment:** approved 5 August 2026 by Adam. Owner and
  synthetic evaluation traces may contain the user message, assistant response,
  model output required to evaluate the Idea Map, and relevant prompt/profile
  context. Demo requests must use a no-op adapter and emit nothing to Braintrust.
- **Do not reopen without new evidence:** Braintrust is the selected backend and
  its SDK is preferred over an OpenTelemetry intermediate layer; demo content or
  metadata must not be exported; automatic provider instrumentation remains
  prohibited because it cannot enforce this route-level boundary safely.

## Status

Implementation and local validation are complete and merged. The follow-up FIFA
baseline established Braintrust-native Claude accounting; a mounted owner trace
has not yet been manually inspected, so this task remains incomplete against
that explicit validation criterion.

## First configured baseline

- **Run:** 5 August 2026
- **Experiment:** the initial experiment was exported to an accidentally created
  lowercase `thoughtform` project because Braintrust project-name resolution is
  case-sensitive. That project was deleted after configuration was corrected to
  the intended `ThoughtForm` project; a retained baseline rerun remains pending.
- **Scenarios:** 3, serial execution
- **Behavioural scores:** intention 100%, readiness contract 100%, structured
  output 100%
- **Errors:** 0
- **Reported duration:** 9.01 seconds
- **Instrumentation limitation:** the deleted run reported zero LLM calls and zero
  tokens because the synthetic evaluator invokes the repository OpenAI client
  without Braintrust's evaluation-only OpenAI wrapper. The model calls did run;
  these zero values are missing instrumentation, not zero usage.

## Retained Claude baseline

- **Run:** 5 August 2026
- **Experiment:** `codex/thoughtform-fifa-braintrust-baseline-1785922258`
- **Project:** `ThoughtForm` (`9c56aca1-7e54-4e73-ace3-914d7d82fdc3`)
- **Scenario:** complete ten-turn synthetic FIFA accountability conversation
- **Native accounting:** 10 Claude LLM calls, 60,860 input tokens, 18,816 output
  tokens, 79,676 total tokens, 8,087 provider-reported reasoning tokens, zero
  cache reads/writes, $0.31 estimated cost, and no errors or repair calls
- **Latency:** 28.0-second median turn, 202.754-second maximum turn, and
  513.85-second complete experiment duration
- **Behaviour:** eight scores at 100%; one-question discipline at 90% because
  the first assistant response asked two questions
- **Limitation:** Braintrust's wrapper records `time_to_first_token` only when the
  non-streaming response completes, so its 51.38-second summary is response
  latency rather than a genuine first-token measurement.
