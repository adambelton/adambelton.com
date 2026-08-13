# Task 039 — Measure representative hosted usage

## Goal

Produce committed, privacy-safe measurements for representative complete beta
journeys so Task 040 can set reasonable request and token safeguards for demo
access to the prototype on Adam's personal website.

## Why this task is next

Task 038 now provides the authoritative content-free attempt ledger, and
autonomous user-correctable Idea Map merge/split behavior completes the current
beta capability set. Representative journeys can therefore use the ledger to
measure real hosted operations without committing private fixture or generated
content. Prototype demo safeguards should be based on ranges and conservative
upper assumptions, not arbitrary turn counts or one synthetic average.

## Depends on

- Completed Task 038 hosted-attempt accounting.
- Completed autonomous user-correctable Idea Map merge/split behavior.
- Approved current hosted baseline: Anthropic Claude Sonnet 5 at medium effort.
- Separate explicit approval of the bounded paid measurement matrix after the
  deterministic harness reports its scenario count, repetitions, expected
  hosted-operation count, and cost ceiling.

## Scope

- Define privacy-safe hosted fixtures for:
  - guided Discovery from a vague opening;
  - user-led Discovery from a strong initial view;
  - a useful conversation and Idea Map with no Draft;
  - early and later Draft composition;
  - revision proposal generation followed by acceptance, while attributing
    hosted usage only to generation;
  - saved-change interpretation after meaningful direct edits;
  - short-form and long-form complete journeys;
  - autonomous and user-corrected Idea Map merge/split behavior.
- Run the separately authorized scenarios against Anthropic Claude Sonnet 5 at
  medium effort and record the exact provider/model profile and date.
- Read measurements from the Task 038 attempt ledger rather than adding
  temporary-user Langfuse tracing or a second accounting mechanism.
- Measure, per scenario and hosted operation:
  - admitted request counts and outcomes;
  - bounded input size;
  - input, output, reasoning, cache-read, and cache-write tokens where supplied;
  - complete-operation usage for representative success and bounded
    structured-output-repair scenarios, using the ledger's aggregated totals;
  - the independent concurrent conversation-response and Idea Map attempts;
  - missing or partial provider usage metadata.
- Commit a content-free report containing observed ranges, sample counts,
  assumptions, outliers, and recommended values for Task 040.
- Recommend per-user and global request allowances, token reservation/overshoot
  assumptions, owner treatment, and justified per-operation input/output bounds.

## Out of scope

- Production admission or enforcement.
- Changing Task 038 ledger semantics.
- Pricing promises, billing, cost reimbursement, or profit calculations.
- Temporary-user prompts, messages, Idea Map content, Drafts, proposals,
  generated prose, or qualitative analytics.
- Selecting a new model or tuning product behavior merely to improve cost
  measurements.
- Individual provider-call or repair-call counts and token breakdowns.
- Repair or failure-rate measurement for commercial demo, trial, billing, or
  capacity planning; revisit that visibility only if the project moves toward
  public commercial access.

## Expected files to create or modify

- product-owned ThoughtForm scenarios, fixtures, and provider-neutral report
  contracts under `packages/products`
- mounted measurement runner and host composition under `apps/api`
- content-free ledger queries and aggregation under `packages/db`
- a dated, privacy-safe committed measurement report
- Task 040 calibration inputs and task/progress documentation

## Definition of done

- Every approved representative scenario completes against the current hosted
  profile or has a documented, investigated failure.
- The report identifies all hosted operations and distinguishes the concurrent
  conversation and Idea Map attempts.
- Measurements include provider-neutral token categories, complete-operation
  usage including aggregated repair usage, missing metadata, ranges, outliers,
  and sample counts without false precision.
- The committed report contains no private fixture text, prompt text, model
  output, or workspace content.
- Recommended allowances, reservation bounds, overshoot assumptions, owner
  treatment, and per-operation bounds are concrete enough to review Task 040.
- Repository tests, typecheck, build, and diff checks pass; paid runs are
  recorded separately from deterministic CI.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

The completion record must list the explicitly authorized hosted commands,
model/profile, run dates, sample counts, ledger queries, and content-free report
checks. Paid hosted runs remain outside normal CI and require explicit approval.

## Staged paid-run workflow

1. Implement and validate the deterministic scenario runner, mounted host
   composition, content-free ledger reader, aggregation, and privacy checks
   without paid provider calls.
2. Present the exact scenario matrix, repetitions, expected hosted-operation
   count, Anthropic profile, and cost ceiling to Adam.
3. Wait for explicit paid-run approval; implementation approval alone does not
   authorize hosted measurement calls.
4. Execute only the authorized matrix, then commit the content-free report and
   Task 040 recommendations.

## Risks / questions

- Hosted results are non-deterministic and incur cost; record ranges and
  assumptions rather than treating one run as a guarantee.
- Decide the minimum useful sample count and whether cold/warm or cached/uncached
  observations need separate ranges.
- If the current model/profile changes before Task 040, decide whether targeted
  remeasurement is required rather than silently applying stale values.
- Distinguish provider token metadata from monetary cost estimates; any price
  conversion must record its date and source and remain an operational estimate.

## Status

The implementation and hosted evaluations completed on 13 August 2026. The
executable matrix, mounted runner, content-free ledger reader, privacy-safe report, and
Task 040 calibration inputs and the approved autonomous Idea Map reliability
amendment are implemented, validated, and recorded. Adam authorized the reviewed
work for commit on 13 August 2026. The final usage report-capture run completed all six
scenarios twice with 72 successful hosted attempts. Its originally displayed monetary estimate
was withdrawn after an audit found duplicate pricing of cache and reasoning
categories; the provider token measurements are unaffected. Earlier runs and
their investigated harness or product-level failures are recorded in the dated
[measurement report](../docs/products/thoughtform/usage-measurement-2026-08-13.md).
The final targeted structure verification stopped after six successful hosted
attempts because the first journey produced no autonomous merge or split; this
documents the approved scenario's investigated product-behaviour failure rather
than claiming that the non-deterministic behaviour occurred. Its second
repetition did not run.
Any future hosted remeasurement remains separately gated by the staged workflow
above.

## Completion record

- **Hosted profile and date:** Anthropic `claude-sonnet-5`, medium effort, on
  13 August 2026.
- **Report run:**
  `RUN_HOSTED_USAGE_MEASUREMENT=true USAGE_MEASUREMENT_RUN_ID=task-039-2026-08-13-report USAGE_MEASUREMENT_REPETITIONS=2 pnpm measure:thoughtform-usage`.
  It admitted and completed 72 operations across six scenarios and two
  repetitions. A subsequent zero-call resume read reproduced the report from
  the ledger before the exact synthetic user was deleted.
- **Targeted structure run:**
  `RUN_HOSTED_USAGE_MEASUREMENT=true USAGE_MEASUREMENT_RUN_ID=task-039-2026-08-13-structure USAGE_MEASUREMENT_SCENARIO=idea-structure-correction USAGE_MEASUREMENT_REPETITIONS=2 pnpm measure:thoughtform-usage`.
  The separately approved plan allowed at most 12 operations and $0.30 USD. It
  stopped after the first six successful operations when the journey produced
  no autonomous merge or split; no second repetition or retry ran.
- **Ledger query:** `PrismaThoughtFormUsageMeasurementReader.readRun` selected
  only the synthetic user's content-free operation-ID prefix and quantitative
  Task 038 fields. Unit and configured Neon integration coverage verified run
  and user isolation.
- **Privacy check:** the report artifact contains aggregate identifiers,
  counts, outcomes, model names, timestamps, and token measurements only; tests
  verify that fixture content is absent from report output.
- **Repository validation:** `pnpm test` (354 passed, 10 skipped),
  `pnpm typecheck`, `pnpm build`, and `git diff --check` passed. The configured
  Neon checks previously passed with `pnpm db:validate`,
  `pnpm db:migrate:status`, and the hosted-attempt integration suite unskipped.
- **Cost correction:** a post-run audit found that the original estimator
  double-priced cache and reasoning categories. The displayed monetary totals
  were withdrawn, the estimator was corrected and regression-tested, and the
  provider token measurements were unaffected.
- **Prompted-structure reliability run:**
  `RUN_HOSTED_IDEA_STRUCTURE_RELIABILITY=true IDEA_STRUCTURE_RELIABILITY_COST_LIMIT_USD=0.25 IDEA_STRUCTURE_RELIABILITY_REPETITIONS=3 pnpm evaluate:thoughtform-idea-structure-reliability`.
  It completed 24 calls at an estimated $0.1126 USD. All 12 requested changes
  were correct and valid, all nine controls avoided inappropriate changes, and
  all three correction cases respected the previous correction. The completion
  audit found that positive messages explicitly requested restructuring, so the
  run is recorded as prompted reliability rather than autonomous detection.
- **Autonomous-detection reliability run:**
  `RUN_HOSTED_IDEA_STRUCTURE_RELIABILITY=true IDEA_STRUCTURE_RELIABILITY_SCOPE=expected-changes IDEA_STRUCTURE_RELIABILITY_COST_LIMIT_USD=0.15 IDEA_STRUCTURE_RELIABILITY_REPETITIONS=3 pnpm evaluate:thoughtform-idea-structure-reliability`.
  It completed 12 calls at an estimated $0.0905 USD. All 12 clear synthetic
  opportunities produced the expected operation and references; 11 passed
  product validation and one split was safely rejected. Combined with the
  first run, nine controls produced no inappropriate change and all three
  corrections were respected. The result exceeds the pre-run directional
  threshold but does not establish a production-wide probability.

## Approval record

- **Approval date:** 11 August 2026.
- **Intentional boundaries:** calibrate reasonable prototype demo allowances
  from content-free complete-operation ranges in the Task 038 ledger; include
  aggregate usage from bounded repair paths without adding provider-call
  accounting; use Anthropic Claude Sonnet 5 at medium effort; include the now
  settled Idea Map merge/split capability set.
- **Important deferrals:** granular provider-call and repair-call visibility,
  repair/failure-rate analytics, commercial trial or billing metering, capacity
  planning, enforcement, and any Task 038 ledger-semantic change remain outside
  this task.
- **Implementation decisions:** scenario repetitions, cold/warm grouping,
  cache-state grouping, and the paid cost ceiling may be settled by the
  deterministic harness, but must be presented before separate paid-run
  approval. Product scenarios and report contracts remain product-owned; host
  composition and durable ledger queries remain in their owning app and
  database package.
- **Do not reopen:** the authoritative measurement source is the content-free
  Task 038 ledger; temporary users receive no Langfuse tracing; measured journey
  usage must remain distinct from global-policy assumptions; the task does not
  change model behavior merely to improve cost measurements.

### Reliability-evaluation amendment

- **Approval date:** 13 August 2026.
- **Goal:** measure how consistently the current hosted profile proposes correct
  merges and splits, avoids structural changes in controls, and respects a
  previous user correction.
- **Intentional boundaries:** product-owned synthetic scenarios and scoring;
  host-composed current Anthropic adapter and fallback prompt; content-free
  aggregate output; no prompt or behavior changes made to improve results.
- **Important deferrals:** production monitoring, enforcement, and statistical
  certainty from a small sample remain outside Task 039.
- **Paid-run gate:** deterministic implementation approval does not authorize
  hosted calls. The exact matrix, repetitions, call count, model profile, and
  estimated-cost limit require separate explicit approval.
