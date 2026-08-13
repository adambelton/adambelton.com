# Task 044 — Add minimum portfolio-demo operations visibility

## Goal

Give the owner the minimum content-free visibility needed to operate the
authenticated ThoughtForm portfolio demo, diagnose hosted-operation failures,
and monitor usage without exposing private writing or creating invasive
analytics.

## Why this task is next

Tasks 038–040 establish authoritative attempt, allowance-window, and outcome
semantics. Task 044 should present those existing host-owned contracts rather
than inventing parallel analytics or querying private product stores. The
portfolio-demo release task needs a proportionate way to detect unusual usage
and repeated hosted-operation failure before opening the production gate. A
future public beta or commercial release is a separate project and does not
expand this portfolio-host requirement.

## Depends on

- Completed Tasks 038–040.
- The retention, deletion, allowance, and disclosure contracts settled by those
  tasks.
- A fresh review that narrows this proposal to the minimum evidence needed for
  portfolio-demo operation.

## Scope

- Add an owner-only host administration route and API surface showing:
  - authenticated account email;
  - most recent admitted ThoughtForm hosted operation, explicitly labelled as
    operation activity rather than login or page access;
  - admitted hosted-operation counts and outcomes;
  - provider-neutral model and token totals allowed by Task 038;
  - current per-user allowance-window usage and reset time allowed by Task 040;
  - current global operation and token totals;
  - enough failure aggregation to distinguish provider failure, persistence
    failure, and interrupted work without revealing content.
- Derive every view from host-owned auth/access and usage records. Do not read
  conversation, Idea Map, drafting, proposal, or Langfuse content.
- Enforce owner-only access at the API; the client route mirrors but does not
  replace server authorization.
- Provide understandable loading, empty, partial-data, authorization, and
  operational-failure states.
- Order accounts by most recent admitted operation and use cursor pagination
  with 25 accounts per page. Accounts without hosted attempts remain visible
  with an explicit empty-operation state.
- Document the operational purpose, field allowlist, retention source, and the
  distinction between current UTC-day and retained 90-day totals.

## Out of scope

- Conversation, prompt, Idea Map, Draft, proposal, or generated-content review.
- Langfuse trace browsing or qualitative evaluation inside the website.
- User surveillance, IP/device fingerprinting, behavioural profiles, funnels,
  product analytics, billing, or payment reconciliation.
- Editing allowances or deployment configuration through the admin UI.
- A rich charting/dashboard system when a concise operational table and totals
  meet the portfolio-demo need.
- Monetary cost estimates or billing-style presentation.
- Login, email-delivery, page-view, or pre-admission access diagnostics.

## Expected files to create or modify

- platform-wide admin/usage response contracts only where genuinely shared
- host API administration application/delivery code and database queries
- owner-only client route and focused presentation components
- host composition, authorization, database, client, accessibility, and browser tests
- privacy, deployment, progress, and task documentation

## Settled constraints

- The exact usage records, retention, cleanup, and auth-user deletion behavior
  come from Tasks 038–040 and are not redefined here.
- Both client and API routes are owner-only, with server authorization
  authoritative. Non-owner responses reveal neither records nor whether records
  exist.
- The response contract is an explicit allowlist. It contains no prompts,
  messages, Idea Map content, Drafts, proposals, generated prose, IP addresses,
  user-agent strings, behavioural profiles, provider credentials, or internal
  global budget configuration.
- Missing, partial, or expired metadata renders safely without widening joins or
  falling back to private-content inspection. Deleted accounts and their
  cascaded attempt records do not appear.
- Retained 90-day totals are never described as lifetime usage.
- Model identifiers may be shown in aggregate to diagnose provider-configuration
  drift. Monetary estimates are not shown.

## Review decisions

- **Operational audience:** this surface supports a small authenticated
  portfolio demo. A future public beta or commercial release is a separate
  project.
- **Activity meaning:** “most recent operation” means the latest admitted hosted
  operation. It does not claim to represent authentication or page access.
- **Identity:** show the full authentication email because it is the primary
  account identity needed to support a small authenticated audience. Do not add
  a redundant domain column.
- **Aggregates:** show current UTC-day personal usage and allowance, current
  global operation/token totals, and retained 90-day operation, token, model,
  and outcome totals.
- **Failure categories:** aggregate `provider_failed`, `persistence_failed`, and
  `interrupted` outcomes for the current UTC day and retained 90-day window.
  Rejected admissions are not persisted and are not counted; current allowance
  exhaustion remains visible through authoritative Task 040 calculations.
- **Presentation:** order by most recent admitted operation, use cursor-based
  pagination with 25 accounts per page, and show explicit no-record and
  no-operation states.
- **Cost:** show provider-neutral token totals and aggregate model identifiers,
  but no monetary estimate.

## Definition of done

- The owner can inspect account identity, hosted-operation activity, allowance,
  outcome, model, and token metadata end to end through the mounted
  production-shaped host.
- Non-owner and logged-out requests are denied server-side without existence
  disclosure.
- The API returns only the approved field allowlist and no private writing.
- Missing or partial data, deleted-account absence, pagination, empty state, and
  operational failure have regression coverage.
- A privacy-shape test fails if a forbidden content field enters the contract.
- Database integration, API, client, accessibility, browser, typecheck, build,
  and diff checks pass.

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

The completion record must include non-skipped database queries, mounted owner
and non-owner verification, the final field allowlist, and browser inspection.
If a schema change is unexpectedly required, it needs a fresh scope review and
must follow the schema-first generated-migration workflow.

## Risks / questions

- Full email addresses are personal operational data justified here only by the
  small authenticated portfolio-demo support need. A future public release must
  review that decision again.
- Aggregates must remain explainable when provider usage is partial or an
  admitted operation is interrupted.
- Do not let a convenient join turn operational oversight into private-content
  access.

## Status

Revised on 13 August 2026 as a minimum authenticated portfolio-demo operations
surface after Tasks 038–040. Adam approved implementation on 13 August 2026.

## Approval record

- **Approval date:** 13 August 2026.
- **Intentional boundaries:** build a concise owner-only, content-free
  operational surface for the portfolio website's small authenticated demo;
  derive it only from authentication accounts and the Tasks 038–040 hosted
  attempt ledger; include autonomous Idea Map merge/split in the later demo
  release.
- **Important deferrals:** a future public beta or commercial release, billing,
  monetary estimates, login/email/page-view diagnostics, persisted rejection
  events, behavioural analytics, allowance editing, and private-content or
  Langfuse inspection remain outside this task.
- **Implementation decisions:** choose the smallest host-owned application,
  query, API, and presentation structure that fulfils the approved allowlist;
  define a stable cursor without adding a schema; settle accessible table/detail
  presentation through mounted verification.
- **Do not reopen:** full authentication email as the account identity; latest
  admitted operation as the only activity meaning; current UTC-day personal and
  global totals; retained 90-day operation/token/model/outcome totals; the three
  existing failure outcomes; 25-account cursor pages; no cost conversion; and
  deleted-account absence through the existing cascade.
