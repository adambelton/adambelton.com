# Task 044 — Add minimum beta operations visibility

## Goal

Give the owner the minimum content-free visibility needed to operate public
ThoughtForm beta access, diagnose failures, and monitor hosted usage without
exposing private writing or creating invasive analytics.

## Why this task is next

Tasks 038–040 establish authoritative attempt, allowance-window, and outcome
semantics. Task 044 should present those existing host-owned contracts rather
than inventing parallel analytics or querying private product stores. The beta
release task needs a proportionate way to detect unusual cost, repeated failure,
and access problems before opening the production gate.

## Depends on

- Completed Tasks 038–040.
- The retention, deletion, allowance, and disclosure contracts settled by those
  tasks.
- A fresh review that narrows this proposal to the minimum evidence needed for
  beta operation.

## Scope

- Add an owner-only host administration route and API surface showing:
  - authenticated account email and derived domain;
  - last relevant ThoughtForm access under an explicitly defined meaning;
  - admitted hosted-operation counts and outcomes;
  - provider-neutral model and token totals allowed by Task 038;
  - current per-user allowance-window usage and reset time allowed by Task 040;
  - enough failure aggregation to distinguish ordinary provider failure,
    persistence failure, and repeated limit rejection without revealing content.
- Derive every view from host-owned auth/access and usage records. Do not read
  conversation, Idea Map, drafting, proposal, or Langfuse content.
- Enforce owner-only access at the API; the client route mirrors but does not
  replace server authorization.
- Provide understandable loading, empty, partial-data, stale/deleted-user,
  authorization, and operational-failure states.
- Add bounded ordering and pagination so the surface remains useful without
  becoming an analytics dashboard.
- Document the operational purpose, field allowlist, retention source, and
  limitations of any cost estimate.

## Out of scope

- Conversation, prompt, Idea Map, Draft, proposal, or generated-content review.
- Langfuse trace browsing or qualitative evaluation inside the website.
- User surveillance, IP/device fingerprinting, behavioural profiles, funnels,
  product analytics, billing, or payment reconciliation.
- Editing allowances or deployment configuration through the admin UI.
- A rich charting/dashboard system when a concise operational table and totals
  meet the beta need.

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
- Missing, partial, expired, or deleted-user metadata renders safely without
  widening joins or falling back to private-content inspection.
- Monetary estimates, if approved, are clearly dated operational estimates from
  documented provider-neutral token totals and never presented as billing truth.

## Decisions required before approval

- The precise meaning of last access: authenticated product access, admitted
  hosted operation, or another existing host event.
- Whether full email is operationally necessary or whether a minimized value is
  sufficient alongside domain.
- Which current-window, daily, and lifetime aggregates are required for beta.
- Ordering, page size, pagination, and empty-result behavior.
- Whether model identifiers are useful and whether any dated price conversion is
  accurate enough to display.
- The minimum failure categories and time window needed for diagnosis.

## Definition of done

- The owner can inspect access, allowance, outcome, and cost-relevant metadata
  end to end through the mounted production-shaped host.
- Non-owner and logged-out requests are denied server-side without existence
  disclosure.
- The API returns only the approved field allowlist and no private writing.
- Missing/partial/deleted-user data, pagination, empty state, and operational
  failure have regression coverage.
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

- Full email addresses are personal operational data; show them only if the
  beta-support need outweighs minimization.
- Aggregates must remain explainable when provider usage is partial or an
  admitted operation is interrupted.
- Do not let a convenient join turn operational oversight into private-content
  access.

## Status

Revised as a minimum beta-operations surface. Blocked on Tasks 038–040 and a
fresh review of the decisions above. Not approved.
