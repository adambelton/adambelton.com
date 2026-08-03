# Task 039 — Enforce calibrated atomic usage budgets

## Goal

Use the proven hosted-attempt ledger and committed measurements to enforce
per-user demo and global safeguards without losing recoverable work.

## Depends on

Tasks 037 and 038.

## Why this task is next

The ledger and measurements make atomic limits implementable without combining
unknown accounting behavior with policy calibration.

## Scope

- Enforce atomic per-user demo and global UTC-daily request limits.
- Add calibrated token reservation and documented overshoot behavior.
- Refine per-action input/output bounds where measurements justify it.
- Return stable limit codes, safe remaining allowance, and reset time.
- Preserve workspace and rejected local input when admission is denied.
- Add client limit presentation and configuration validation.

## Out of scope

- Billing reconciliation, admin dashboards, research budgets, or invasive abuse analytics.

## Expected files to create or modify

- host budget reservation/completion adapter and DB queries
- API configuration and product failure mapping
- client recovery/allowance presentation
- concurrency, integration, privacy, and browser tests

## Values required before approval

- per-user and global request allowances;
- token allowance or guard and permitted overshoot;
- owner allowance or exemption;
- per-action input/output limits;
- configuration names, defaults, and invalid-value behavior.

## Definition of done

- Concurrent processes cannot exceed request reservations.
- A measured legitimate demo fits the defaults.
- Rejection happens before provider invocation and mutates no workspace state.
- Token and missing-metadata behavior match the approved policy.
- Unit, database integration, API, client, and concurrency tests pass.

## Blast radius

High: atomic database enforcement, every hosted action, configuration, stable
errors, and client recovery. It must not begin until concrete values are reviewed.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Settle UTC reset, reservation overshoot, missing token metadata, owner policy,
  and safe remaining-allowance disclosure before approval.

## Status

Blocked on Tasks 037 and 038. Not approvable yet.
