# Task 034 — Add calibrated usage limits and cost protection

## Goal

Protect hosted AI with atomic per-user and global budgets, product-aware usage
records, and limits calibrated to permit a complete demo session.

## Why this task is next

The complete demo can now be measured, so budgets can represent the product's
real interaction pattern rather than an arbitrary number of chat turns.

## Scope

Implements the usage portions of **Workspace orchestration**, **Conversation
turn**, **Concurrency and consistency**, and **Privacy and data minimisation**
from the product architecture.

- Add a product-owned usage authorization port around model-backed actions.
- Persist privacy-limited, product-aware request outcomes and provider-neutral
  token metadata through host adapters.
- Enforce atomic per-user demo and global UTC daily request limits.
- Enforce bounded post-usage token guards with documented overshoot semantics.
- Retain the kill switch and refine input/output limits by action where useful.
- Return stable failure codes, reset information, and remaining demo allowance.
- Preserve the current workspace when a limit is reached.
- Validate configuration once at composition and fail closed for hosted AI.

## Out of scope

- Billing reconciliation, invasive abuse analytics, research budgets, or admin
  dashboards.

## Expected files to create or modify

- product usage port and model-backed orchestration
- `packages/ai` usage metadata contracts
- API configuration/composition
- `packages/db` usage budgets/events, repositories, and generated migration
- client limit presentation, privacy docs, environment docs, tests, and progress

## Definition of done

- Concurrent requests cannot exceed reserved request allowances.
- Token guards, global safety, owner/demo differences, and UTC reset work as
  documented.
- Every admitted hosted attempt records a content-free final outcome.
- A legitimate measured demo session fits within the configured default budget.
- Tests, typecheck, build, database validation, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Cumulative context may dominate visible output usage.
- Reservations must be atomic and completion idempotent.
- Provider failures count once a hosted attempt may have incurred cost.

## Status

Proposed. Awaiting approval.
