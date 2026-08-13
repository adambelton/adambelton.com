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

## Values required before implementation approval

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

## Agreed daily budgets

Adam agreed the following budget values on 13 August 2026 after reviewing the
dated [Task 039 measurement report](../docs/products/thoughtform/usage-measurement-2026-08-13.md)
and choosing to favor a thorough temporary-workspace experience of roughly 50
conversation turns. This agreement settles the numerical daily budgets but does
not itself approve Task 040 implementation:

- 120 temporary-user and 600 global admitted hosted operations per UTC day;
- 600,000 temporary-user and 3,000,000 global completed tokens per UTC day;

## Agreed policy values

- owner exemption from the personal allowance but inclusion in global limits;
- reservations of 5,000 conversation, 7,000 Idea Map, 2,500 Draft composition,
  1,500 revision-proposal, and 2,500 saved-change-interpretation tokens;
- admission only when the complete operation reservation fits both the
  temporary user's and global remaining budgets;
- no deliberate one-operation overshoot exception; completion replaces the
  reservation with actual usage, and any actual-over-reservation excess denies
  subsequent admission until reset;
- an honest worst-case overshoot bound derived from hard operation bounds and
  every concurrently admitted operation rather than one reservation;
- full-reservation retention when complete input/output metadata is missing;
- output caps of 1,024 conversation, 1,536 Idea Map, and 512 for each Draft
  operation;
- a proposed 16 KiB serialized Draft-operation input bound that Task 040 must
  validate against measured request bytes before adoption;
- safe remaining-allowance and UTC-reset disclosure, with exact user-facing
  terminology and copy deliberately deferred to implementation.

Adam agreed these remaining policy values on 13 August 2026. The 16 KiB Draft-
operation input bound remains conditional: implementation must measure the
serialized representative requests and stop for review if legitimate cases do
not fit rather than silently increasing the bound.

## Settled constraints

- Admission is atomic across processes and occurs immediately before the hosted
  model boundary.
- Admission atomically reserves the complete operation amount against both the
  applicable temporary-user window and the global window. An operation is
  denied if either reservation would not fit.
- Completion replaces that operation's reservation with actual
  `inputTokens + outputTokens`. There is no intentional over-budget admission;
  actual usage above its reservation may move a window over budget, after which
  subsequent admissions are denied until reset.
- An admitted operation remains attributed to the UTC window in which it was
  admitted even when it completes after that window ends.
- A denied operation creates no admitted attempt, invokes no provider, and
  mutates no workspace state.
- A legitimate measured beta journey fits the approved default allowance.
- Token completion uses Task 038's aggregated attempt usage, including bounded
  provider repair calls.
- Daily token charging uses `inputTokens + outputTokens` only. Cache-read,
  cache-write, and reasoning values remain diagnostic subdivisions and are not
  added again.
- If complete input or output usage is unavailable, the operation retains its
  full reservation for its admission window. Reconciliation must not treat
  missing usage as zero or move an interrupted operation into a later window.
- Internal global totals, other users' state, and provider failure details are
  never disclosed to a client.
- The client contract may disclose only whether the operation was limited, the
  authenticated user's safe remaining hosted-operation allowance, and its UTC
  reset timestamp. Exact presentation wording remains an implementation
  decision. Personal token usage, global capacity, reservations, internal cost,
  other users' activity, and provider failures remain undisclosed.
- Temporary-user limited states remain content-free in operational storage and
  produce no Langfuse trace.
- The client presents authoritative server decisions; it does not calculate or
  enforce eligibility locally.

## Definition of done

- Concurrent processes cannot exceed request reservations under database
  integration testing.
- Every current hosted operation is denied or admitted through the same product
  contract and host policy adapter.
- Request, token, reservation, concurrent-overshoot, owner, missing-metadata,
  admission-window attribution, and UTC-reset behavior
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
  responds. The implementation must calculate and document the maximum possible
  aggregate excess from concurrently admitted operations under the approved
  hard bounds rather than describe one reservation as a guaranteed cap.
- Process termination after admission must follow Task 038's interrupted-attempt
  reconciliation contract without permanently consuming an allowance or
  silently refunding paid work.
- Exact user-facing terminology and copy remain intentionally deferred to
  implementation. The 16 KiB Draft-operation input bound requires the approved
  measurement check described above.

## Status

Revised from the completed lifecycle, accounting architecture, and Task 039
measurements. All required policy values were agreed on 13 August 2026, and Adam
approved implementation on 13 August 2026. Implementation is in progress.

## Approval record

- **Approval date:** 13 August 2026.
- **Intentional boundaries:** enforce the agreed personal/global UTC-daily
  operation and completed-token budgets atomically through the Task 038 attempt
  lifecycle; preserve denied local work; expose only the agreed safe allowance
  state; keep temporary-user operational data content-free and outside
  Langfuse.
- **Important deferrals:** billing, subscriptions, qualitative temporary-user
  analytics, IP/device abuse tracking, admin presentation beyond Task 044, and
  exact user-facing wording remain outside this task.
- **Implementation decisions:** measure representative serialized Draft-
  operation inputs before adopting the proposed 16 KiB bound; calculate the
  possible aggregate excess from every concurrently admitted operation under
  the final hard bounds; choose configuration names and accessible wording that
  implement, but do not change, the approved policy.
- **Do not reopen:** the agreed 120/600 operation budgets, 600,000/3,000,000
  completed-token budgets, reservation values, owner personal exemption with
  global inclusion, admission-window attribution, input-plus-output accounting,
  fail-closed missing usage, no deliberate overshoot admission, and limited
  disclosure contract.

## Policy review record

- **Review date:** 13 August 2026.
- **Daily budgets:** 120 temporary-user and 600 global admitted hosted
  operations; 600,000 temporary-user and 3,000,000 global completed tokens.
- **Reservations:** 5,000 conversation response, 7,000 Idea Map analysis,
  2,500 Draft composition, 1,500 revision proposal, and 2,500 saved-change
  interpretation tokens.
- **Concurrency:** the full reservation must fit both applicable windows; there
  is no deliberate overshoot admission. Already admitted operations complete,
  actual usage replaces reservations, and subsequent work is denied after an
  actual-over-reservation excess.
- **Bounds:** retain the 32 KiB conversation/Idea Map input bound; use 1,024 and
  1,536 output-token bounds respectively; use 512 output tokens for Draft
  operations; validate the proposed 16 KiB Draft-operation input bound before
  adoption.
- **Accounting:** charge input plus output once; retain reservations when
  complete usage is missing; attribute admission, completion, and interruption
  to the admission UTC window.
- **Owner and disclosure:** owner is exempt from personal budgets but remains
  within global safeguards. Disclose only the limited outcome, safe remaining
  hosted-operation allowance, and UTC reset timestamp; presentation copy is
  deferred.
