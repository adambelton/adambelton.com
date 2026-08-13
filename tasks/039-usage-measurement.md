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

Approved by Adam on 11 August 2026. Implementation has not started. Paid hosted
measurement calls remain separately gated by the staged workflow above.

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
