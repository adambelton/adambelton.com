# Task 039 — Measure representative hosted usage

## Goal

Produce committed, privacy-safe measurements for representative complete beta
journeys so Task 040 can calibrate request and token safeguards from evidence.

## Why this task is next

Task 038 will provide the authoritative content-free attempt ledger. Once the
complete beta capability set is fixed, representative journeys can use that
ledger to measure real hosted operations without committing private fixture or
generated content. Limits should be based on ranges and safe upper assumptions,
not arbitrary turn counts or one synthetic average.

## Depends on

- Completed Task 038 hosted-attempt accounting.
- Completion, or an explicit beta deferral, of autonomous user-correctable Idea
  Map merge/split behavior.
- A fresh review confirming the beta capability set and current hosted model
  profile before any paid measurement run.

## Scope

- Define privacy-safe hosted fixtures for:
  - guided Discovery from a vague opening;
  - user-led Discovery from a strong initial view;
  - a useful conversation and Idea Map with no Draft;
  - early and later Draft composition;
  - revision proposal generation and acceptance;
  - saved-change interpretation after meaningful direct edits;
  - short-form and long-form complete journeys;
  - Idea Map merge/split behavior if it remains in beta scope.
- Run the scenarios against the current approved Anthropic baseline and record
  the exact provider/model profile and date.
- Read measurements from the Task 038 attempt ledger rather than adding
  temporary-user Langfuse tracing or a second accounting mechanism.
- Measure, per scenario and hosted operation:
  - admitted request counts and outcomes;
  - bounded input size;
  - input, output, reasoning, cache-read, and cache-write tokens where supplied;
  - bounded structured-output repair calls and their aggregated usage;
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

## Expected files to create or modify

- ThoughtForm hosted evaluation scenarios and fixtures under product-owned
  testing/evaluation boundaries
- content-free measurement summarizers that read provider-neutral attempt data
- a dated, privacy-safe committed measurement report
- Task 040 calibration inputs and task/progress documentation

## Definition of done

- Every approved representative scenario completes against the current hosted
  profile or has a documented, investigated failure.
- The report identifies all hosted operations and distinguishes the concurrent
  conversation and Idea Map attempts.
- Measurements include provider-neutral token categories, repairs, missing
  metadata, ranges, outliers, and sample counts without false precision.
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

Revised from the completed Task 036, approved Task 038, current Sonnet 5 and
Langfuse architecture, and known beta gates. Blocked on Task 038, the final beta
capability set, and a fresh review. Not approved.
