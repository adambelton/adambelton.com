# Task 036 — Add basic owner admin visibility

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
- Tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- Retention and aggregation must remain proportionate to operational need.

## Status

Proposed. Awaiting approval.
