# Task 038 — Record hosted attempt lifecycles safely

## Goal

Create the host-owned, content-free attempt ledger and product-owned
authorization/completion boundary required for later atomic budgets.

## Why this task is next

The complete temporary workflow is known, but enforcement should not be combined
with the new attempt lifecycle, persistence, and integration of every model-backed action.

## Depends on

Task 036.

## Scope

- Add product-language authorization and completion operations around hosted actions.
- Reserve an admitted attempt immediately before provider invocation.
- Complete every admitted attempt exactly once with provider-neutral usage and outcome.
- Persist content-free attempt records through owner-scoped host infrastructure.
- Cover provider failure and later product persistence failure explicitly.
- Validate hosted configuration once in API composition and retain the kill switch.

## Out of scope

- User-facing budgets, rejection policy, token overshoot enforcement, billing,
  admin dashboards, or content analytics.

## Expected files to create or modify

- product usage-attempt port and hosted-action orchestration
- provider-neutral AI usage metadata
- API configuration and host adapters
- Prisma schema, generated migration, DB integration tests, and privacy docs

## Settled constraints

- Product code does not import database, auth, provider, or configuration implementations.
- Records may contain user/account reference, product/action, model, timestamps,
  token counts, and operational outcome only.
- Records never contain prompts, messages, ideas, drafts, proposals, generated
  prose, IP addresses, user-agent strings, or behavioural profiles.
- Completion and retry are idempotent; provider failure counts after admission.
- This slice records attempts but does not reject a user for exceeding a budget.

## Definition of done

- Every model-backed action uses the same narrow attempt lifecycle.
- Admitted attempts are completed once across success, provider failure, and
  persistence failure.
- Database concurrency and privacy-shape integration tests pass.
- Tests, typecheck, build, schema validation, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Blast radius

High but bounded: every hosted action, API composition, usage contracts, and one
schema migration. User-facing limit policy and UI are deferred to Task 040.

## Risks / questions

- Settle attempt identity, reservation rollback, final outcome vocabulary, and
  behavior when provider usage metadata is absent or partial.
- Avoid a migration that assumes enforcement policy before measurements exist.

## Status

Proposed. Awaiting Task 036 and a fresh approval review.
