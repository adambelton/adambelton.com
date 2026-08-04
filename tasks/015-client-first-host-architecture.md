# Task 015 — Client-First Host Architecture Decision

## Status

Complete.

## Goal

Document the decision to migrate the website host from Next.js toward a Vite and React Router client app, with a clear security posture and rationale grounded in current ThoughtForm needs and known future product demos.

## Why This Task Is Next

Before changing runtime architecture, the project should capture why the change is being made.

The decision is not that Vite is inherently better than Next.js. The decision is that this portfolio host should demonstrate explicit frontend and product architecture, product mounting, auth boundaries, and security posture across current and future product demos.

## Scope

- Document the decision to move toward a client-first host architecture.
- Record that client-side route gates are UX affordances only.
- Record that API/server authorization remains authoritative for sensitive actions.
- Document why this supports ThoughtForm and future product demos.
- Add a product roadmap/context doc with high-level descriptions of ThoughtForm and the future Care Calendar product.
- Clarify that the roadmap does not approve or start future-product implementation.
- Define the migration as a staged refactor, not a rewrite.
- Preserve current product-boundary principles: product packages own product behaviour; host apps mount products and provide services.

## Out Of Scope

- No Vite install.
- No React Router install.
- No app renaming.
- No migration of `apps/web`.
- No auth behaviour changes.
- No product UI or health-tech implementation.
- No database or schema changes.
- No commits until explicitly approved after review.

## Expected Files To Create Or Modify

- `docs/decisions.md`
- `docs/architecture.md`
- `docs/product-roadmap.md`
- `progress.md`
- `tasks/README.md`
- `tasks/015-client-first-host-architecture.md`

## Definition Of Done

- The architecture decision is documented clearly.
- The future health-tech product is recorded only as context for architectural direction.
- The docs explicitly say future-product behaviour is not being built now.
- The security model is stated plainly:
  - client route gates are UX only
  - API/server authorization is authoritative
  - sensitive operations must be permission-checked server-side
- The staged migration path is referenced at a high level.
- No runtime code changes are made.

## Validation Commands

```txt
git diff --check
```

## Risks / Questions

- Avoid over-documenting the health-tech product before it becomes an approved product task.
- Avoid framing Vite as inherently more senior than Next.js; the decision is about architectural fit and explicit ownership.
- The migration should be kept staged so it does not turn into another oversized task.

## Completed Notes

- Added a product roadmap context doc with high-level descriptions of ThoughtForm and the future Care Calendar health-tech learning product.
- Documented the client-first host architecture decision in the decision log.
- Updated architecture docs to state the planned Vite and React Router migration direction.
- Updated progress and task index docs so the client migration sequence is now next.
- Kept the task documentation-only with no runtime code, dependency, auth, database, or product behaviour changes.

## Validation Results

```txt
git diff --check
```

Passed.
