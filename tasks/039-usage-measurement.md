# Task 039 — Measure representative hosted usage

## Goal

Produce committed, privacy-safe measurements for representative complete demo
journeys so usage limits can be calibrated from evidence.

## Depends on

Tasks 036 and 038.

## Why this task is next

Limits need evidence from the complete capability set rather than arbitrary turn counts.

## Scope

- Define guided, user-led, short-form, and long-form hosted fixtures.
- Record request counts, action types, bounded context sizes, and token metadata.
- Exclude private fixture content from the committed measurement report.
- Add concrete recommendations consumed by Task 040.

## Out of scope

- Production accounting, enforcement, pricing promises, or private-content analytics.

## Expected files to create or modify

- hosted evaluation scenarios and measurement summarizers
- privacy-safe committed measurement report
- concrete calibration inputs for Tasks 038 and 040

## Definition of done

- All representative scenarios run with recorded provider-neutral metrics.
- The committed report contains no private prompt or generated content.
- Recommended allowances, action bounds, and overshoot assumptions are explicit.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Blast radius

Low runtime risk but real provider cost and non-determinism. This task changes
evaluation fixtures and documentation, not production enforcement.

## Risks / questions

- Hosted results are non-deterministic and incur cost; record ranges and assumptions,
  not false precision.

## Status

Proposed. Awaiting the complete demo capability set.
