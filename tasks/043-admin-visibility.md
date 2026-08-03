# Task 043 — Add basic owner admin visibility

## Goal

Give the owner proportionate visibility into demo access and hosted usage without
exposing private writing or creating invasive analytics.

## Why this task is next

Usage events and product access now have stable semantics suitable for an admin
surface.

## Scope

Implements the operational-metadata boundary in **State ownership** and **Privacy
and data minimisation** without extending the private workspace model.

- Show demo email/domain, last access, product accessed, request usage, and model
  usage needed for cost oversight.
- Enforce owner-only access at the API.
- Avoid conversation content, prompts, generated writing, IP addresses, and
  behavioural profiling.
- Add understandable empty/error states and privacy documentation.

## Settled constraints

- Admin visibility is a host-owned operational surface and must not extend or
  inspect the private Socratic Draft workspace model.
- Both the client route and API are owner-only, with server authorization
  authoritative. Non-owner responses must not reveal whether admin data exists.
- The allowed baseline fields are demo email, derived email domain, product
  accessed, last relevant access, request count/outcome aggregates, and the
  provider-neutral model-usage fields persisted by Task 037 and governed by
  Task 039.
- Admin responses must not contain prompts, conversation messages, idea-map
  content, drafts, proposals, preferences, generated prose, IP addresses,
  user-agent strings, behavioral profiles, provider credentials, or internal
  global budget configuration.
- Aggregation uses host-owned access and usage records rather than reading product
  conversation, draft, idea, or preference stores.
- Missing, partial, expired, or deleted-user metadata must render safely without
  widening joins or exposing another user's private state.
- Empty and failure states are explicit and understandable; operational failures
  do not fall back to private-content inspection.

## Out of scope

- Analytics dashboards, user surveillance, billing, or content review.

## Expected files to create or modify

- shared admin/usage contracts where genuinely platform-wide
- host API services/routes and database queries
- owner admin client pages and tests
- privacy docs, progress, and task index

## Definition of done

- The owner can inspect access and cost-relevant metadata end to end.
- Non-owners are denied server-side.
- No private writing appears in admin data.
- The returned contract contains only the explicitly allowed operational fields.
- Missing or partial metadata and non-owner access have regression coverage.
- Tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Retention and aggregation must remain proportionate to operational need.

## Decisions this task must settle

- Operational metadata retention and deletion behavior.
- Whether email/domain values are derived at read time or retained as operational
  snapshots.
- Whether usage is grouped by UTC day, current allowance window, lifetime, or a
  documented combination.
- The precise meaning of last access: authenticated product access, admitted
  hosted action, or another recorded host event.
- Ordering, pagination, and empty-result behavior.
- Whether model identifiers are shown and whether cost estimates can be derived
  accurately enough to display; raw provider pricing assumptions must not be
  presented as settled cost.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Status

Proposed. Awaiting approval.
