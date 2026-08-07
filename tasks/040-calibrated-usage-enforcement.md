# Task 040 — Enforce calibrated atomic usage budgets

## Goal

Use the proven Task 038 attempt ledger and Task 039 measurements to enforce
atomic per-user and global beta safeguards without invoking a provider or losing
recoverable work when admission is denied.

## Why this task is next

Task 038 separates attempt lifecycle correctness from policy, and Task 039
provides the measured values. Only then can enforcement combine concurrency,
request and token policy, stable failures, and user presentation without
guessing at legitimate use.

## Depends on

- Completed Task 038 attempt accounting and its retention/idempotency contract.
- Completed Task 039 measurements and reviewed calibration recommendations.
- A fresh approval review of every concrete policy value below.

## Scope

- Enforce atomic authenticated temporary-user and global UTC-daily request
  reservations through the host usage adapter before provider invocation.
- Apply the approved owner allowance or exemption without weakening global
  emergency protection.
- Add calibrated token reservation, completion, and bounded overshoot behavior
  using Task 038 provider-neutral usage totals.
- Apply only the per-operation input/output bounds justified by Task 039 while
  retaining the hosted-AI kill switch and existing complete-input safety bound.
- Return stable product/API limit outcomes containing only the safe remaining
  allowance and reset time approved for disclosure.
- Preserve retained workspace state and the user's rejected local input when
  admission is denied; rejection must not call a model or mutate canonical
  workspace state.
- Present accessible temporary-workspace limited states, reset timing, recovery,
  and copy/edit/clear actions through the existing workspace structure.
- Validate configuration once in host composition, fail closed on missing or
  invalid production values, and document emergency disable/rollback.
- Prove atomic reservation across concurrent API processes using the Task 038
  database ledger rather than process-local counters.

## Out of scope

- Billing, subscriptions, payment reconciliation, or pricing promises.
- Admin dashboards beyond the contracts required by Task 044.
- Research budgets, IP/device fingerprinting, invasive abuse analytics, or
  qualitative temporary-user monitoring.
- Changing the fixed 24-hour temporary-workspace deadline.
- Changing provider/model selection solely to fit an arbitrary budget.

## Expected files to create or modify

- product-owned hosted-operation admission outcomes and stable failure mapping
- host budget reservation/completion adapter and database queries
- API configuration and ThoughtForm host composition
- product client limited-state presentation and recovery tests
- concurrency, database integration, API, privacy, and browser tests
- deployment/privacy documentation and Task 044 operational contracts

## Values required before approval

- temporary-user requests per UTC day and whether allowances vary by operation;
- global requests per UTC day and emergency behavior when exhausted;
- token allowance/reservation method and permitted post-completion overshoot;
- treatment of input, output, reasoning, cache-read, and cache-write tokens;
- owner allowance or exemption and the global safeguard that still applies;
- per-operation input/output limits justified by Task 039;
- missing/partial usage behavior;
- safe remaining-allowance and reset-time disclosure;
- configuration names, development defaults, production requirements, and
  invalid-value behavior.

## Settled constraints

- Admission is atomic across processes and occurs immediately before the hosted
  model boundary.
- A denied operation creates no admitted attempt, invokes no provider, and
  mutates no workspace state.
- A legitimate measured beta journey fits the approved default allowance.
- Token completion uses Task 038's aggregated attempt usage, including bounded
  provider repair calls.
- Internal global totals, other users' state, and provider failure details are
  never disclosed to a client.
- Temporary-user limited states remain content-free in operational storage and
  produce no Langfuse trace.
- The client presents authoritative server decisions; it does not calculate or
  enforce eligibility locally.

## Definition of done

- Concurrent processes cannot exceed request reservations under database
  integration testing.
- Every current hosted operation is denied or admitted through the same product
  contract and host policy adapter.
- Request, token, overshoot, owner, missing-metadata, and UTC-reset behavior
  match the explicitly approved values.
- Rejection occurs before provider invocation and preserves retained and local
  recoverable work.
- Disabled, unavailable, limited, and successful states remain distinguishable
  through stable API outcomes and accessible mounted UI.
- Production configuration fails closed and the emergency kill switch remains
  independently usable.
- Schema/client generation, migrated database tests, unit/API/client/browser
  tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
pnpm db:generate
pnpm db:validate
pnpm db:migrate:status
DATABASE_URL=<configured development/test database> pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

The completion record must show non-skipped database concurrency tests, mounted
client/API behavior through configured development adapters, and the exact
approved configuration values. If the schema changes, generate the migration
from the Prisma schema, apply it, and verify current status; never hand-edit
generated migration SQL.

## Risks / questions

- Atomic request admission is exact; token use is known only after a provider
  responds, so the approved reservation and overshoot policy must remain honest.
- Process termination after admission must follow Task 038's interrupted-attempt
  reconciliation contract without permanently consuming an allowance or
  silently refunding paid work.
- UTC reset, owner policy, missing usage, cache-token treatment, and disclosure
  remain open until Task 039 provides evidence and Adam approves exact values.

## Status

Revised from the completed lifecycle and current accounting architecture.
Blocked on Tasks 038 and 039 and the explicit calibration-value review. Not
approved.
