# Task 038 — Record hosted attempt lifecycles safely

## Goal

Create the host-owned, content-free attempt ledger and product-owned
authorization/completion boundary required for later atomic budgets.

## Why this task is next

Task 036 established the complete temporary-workspace lifecycle and the Langfuse
migration established provider-neutral model usage metadata without observing
temporary workspaces. Atomic enforcement should not be combined with the new
attempt lifecycle, persistence, and integration of every model-backed operation.

## Depends on

Task 036.

## Scope

- Add product-language authorization and completion operations around hosted
  model operations.
- Reserve an admitted attempt immediately before provider invocation.
- Complete every admitted attempt exactly once with provider-neutral usage and outcome.
- Persist content-free attempt records through user/account-scoped host
  infrastructure for both owner and authenticated temporary users. This is
  operational metadata and does not join or widen access to private workspace
  content.
- Cover provider failure and later product persistence failure explicitly.
- Validate hosted configuration once in API composition and retain the kill switch.
- Integrate the lifecycle with every current operation that may cross a hosted
  model boundary:
  - conversation response;
  - asynchronous Idea Map analysis;
  - Draft composition;
  - revision proposal generation;
  - saved-change interpretation when classification actually invokes a model.
- Treat the concurrently started conversation response and Idea Map analysis as
  separate hosted attempts with independent usage and outcomes.
- Aggregate all provider usage incurred inside one admitted product operation,
  including a bounded structured-output repair call. A persistence retry that
  reuses an already generated result does not create another hosted attempt.
- Define and document the lifecycle of operational records, including retention,
  user deletion, and cleanup behavior.

## Out of scope

- User-facing budgets, rejection policy, token overshoot enforcement, billing,
  admin dashboards, or content analytics.

## Expected files to create or modify

- product usage-attempt port and hosted-operation orchestration
- reuse or focused extension of the existing provider-neutral AI usage metadata
- API configuration and host adapters
- Prisma schema, generated migration, DB integration tests, and privacy docs
- host composition and mounted-operation tests for every model-backed operation

## Settled constraints

- Product code does not import database, auth, provider, or configuration implementations.
- Records may contain user/account reference, product/action, model, timestamps,
  token counts, and operational outcome only.
- Records never contain prompts, messages, ideas, drafts, proposals, generated
  prose, IP addresses, user-agent strings, or behavioural profiles.
- Completion and retry are idempotent; provider failure counts after admission.
- One admitted product operation has one attempt identity even when its concrete
  provider adapter performs the single bounded repair already allowed by that
  operation. Usage completion aggregates every provider call made for that
  attempt.
- A retry that reuses a generated model result records no second attempt.
- Conversation response and Idea Map analysis are distinct attempts because
  either can complete or fail independently.
- Invalid input, disabled hosted AI, and configuration rejection before
  admission create no attempt record.
- This slice records attempts but does not reject a user for exceeding a budget.
- Temporary-workspace content and content-free attempt metadata remain excluded
  from Langfuse; the host attempt ledger is a separate operational store.

## Definition of done

- Every model-backed action uses the same narrow attempt lifecycle.
- Conversation response, Idea Map analysis, composition, revision proposal, and
  model-backed saved-change interpretation each have observable lifecycle tests.
- Admitted attempts are completed once across success, provider failure, and
  persistence failure.
- Provider repair usage is aggregated, while persistence reuse does not duplicate
  attempts.
- Database concurrency, idempotency, user isolation, retention/deletion, and
  privacy-shape integration tests run without being skipped and pass against a
  migrated database.
- The generated migration is produced from the Prisma schema, reviewed, applied
  to the configured development/test database, and reported current afterward.
- Mounted API verification through the real host composition proves every
  current model-backed operation supplies the attempt lifecycle and that
  pre-admission disabled/invalid paths create no record.
- Tests, typecheck, build, schema validation, and diff checks pass.

## Validation commands

```txt
pnpm db:generate
pnpm db:migrate:dev
pnpm db:migrate:status
DATABASE_URL=<configured development/test database> pnpm test
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

The completion record must identify the database-backed integration and
concurrency test files and show that none were skipped. It must also record the
mounted client/API operations exercised through the configured development
adapters after the migration was applied. The migration must be generated from
the schema and must not be hand-edited.

## Blast radius

High but bounded: every hosted action, API composition, usage contracts, and one
schema migration. User-facing limit policy and UI are deferred to Task 040.

## Risks / questions

- Settle attempt identity, reservation rollback, final outcome vocabulary, and
  behavior when provider usage metadata is absent or partial.
- Settle the durable representation of an admitted attempt interrupted by
  process termination: an explicit non-terminal state with bounded
  reconciliation, or another design that does not falsely report completion.
- Settle operational-record retention, cleanup, and auth-user deletion behavior
  before persisting temporary-user metadata.
- Preserve provider-neutral aggregation across a bounded repair call without
  exposing provider response objects to product code.
- Avoid a migration that assumes enforcement policy before measurements exist.

## Status

Approved. Implementation has not started.

## Approval record

Approved by Adam on 7 August 2026.

- **Intentional boundaries:** build a host-owned, content-free, quantitative
  attempt ledger for owner and authenticated temporary-user hosted operations.
  Records may be associated with an authenticated account for later per-user
  limits, but never contain workspace content, prompts, model output, IP
  addresses, user-agent strings, or behavioural profiles. Temporary-workspace
  operations continue to send neither content nor content-free metadata to
  Langfuse.
- **Important deferrals:** user-facing budgets, admission rejection, calibrated
  request/token allowances, overshoot enforcement, allowance UI, billing, admin
  visibility, and qualitative temporary-user analytics remain outside this task.
  Tasks 039 and 040 measure and enforce the later policy.
- **Implementation decisions left open:** attempt identity and idempotency key,
  final outcome vocabulary, missing/partial usage representation, interrupted
  attempt reconciliation, transaction boundaries, schema/index design, and the
  operational record retention, cleanup, and auth-user deletion contract.
- **Do not reopen:** conversation response and asynchronous Idea Map analysis
  are distinct attempts; the five current model-backed operations share the
  lifecycle; bounded provider repair usage is aggregated into its admitted
  operation; persistence reuse creates no second attempt; invalid input and
  pre-admission disabled/configuration rejection create no record; private
  writing remains outside the durable ledger; and Langfuse remains qualitative
  and quantitative only for owner use and explicit synthetic evaluation flows.
