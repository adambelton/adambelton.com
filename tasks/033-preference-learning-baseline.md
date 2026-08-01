# Task 033 — Establish the preference-learning baseline

## Goal

Introduce an inspectable, correctable preference capability that improves inquiry,
composition, and revision without coupling those modules to inference mechanics.

## Why this task is next

The workspace now produces explicit preferences and editorial evidence. A stable
boundary lets the baseline remain simple while supporting richer later learning.

## Scope

Implements **Preference learning**, **Preference evidence**, and the applicable
**Privacy and data minimisation** rules from the product architecture.

- Record workspace-scoped explicit preferences and corrections.
- Support owner-only confirmed persistent preferences.
- Distinguish evidence, preference, scope, and confirmation.
- Let the owner inspect, correct, scope, and remove retained preferences.
- Supply context-relevant guidance to conversation, composition, and revision.
- Keep demo preferences temporary.

## Settled constraints

- The preference capability owns evidence, preference statements, status, scope,
  confirmation, correction, rejection/supersession where exercised, removal, and
  relevant-guidance queries.
- It does not own conversation messages, idea-map state, draft content, user
  identity, or model-provider access. Other capabilities submit concise
  product-level evidence and request guidance through narrow operations.
- The baseline favors explicit preferences and corrections. Workspace-scoped
  explicit preferences may remain temporary; durable cross-work owner guidance
  requires confirmation. Do not infer a profile from every edit.
- The richer status vocabulary may distinguish observed, inferred, confirmed,
  corrected, rejected, and superseded preferences, but this task should implement
  only statuses exercised by its observable behavior.
- Guidance influences inquiry, composition, and revision but never overrides an
  explicit current user instruction or becomes a mandatory writing rule.
- Stored evidence is data-minimized: prefer a concise derived statement and safe
  provenance over unnecessary excerpts of private writing.
- Demo preferences expire with the temporary workspace. Persistent preferences
  are owner-only, inspectable, and owner-scoped on every durable read and write.
- Confirming, correcting, rescoping, rejecting, superseding, or removing a
  preference changes subsequent guidance without mutating prior conversation or
  draft history.

## Out of scope

- Automatic profiling from every edit, opaque embeddings, or mandatory style
  enforcement.

## Expected files to create or modify

- product preference shared/server/client modules
- product-owned persistence ports and host adapters
- owner preference UI, schema/migration if required, and tests
- privacy docs, progress, and task index

## Definition of done

- At least one end-to-end scenario proves that an explicit preference changes a
  later conversation, composition, or revision result while a conflicting current
  instruction still takes precedence.
- Retained preferences are inspectable, correctable, removable, and scoped.
- Other capabilities depend only on preference operations, not storage or
  inference internals.
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

- Store enough provenance to explain a preference without unnecessarily retaining
  sensitive writing excerpts.
- Later inference must extend this boundary rather than bypass it.

## Decisions this task must settle

- The minimal status and scope vocabularies required by the baseline UI and
  guidance query.
- Which provenance is retained for correction and explanation, and which source
  material is deliberately discarded.
- The explicit confirmation flow that permits owner guidance to become durable.
- How conflicts, corrections, and supersession are represented without silently
  rewriting historical evidence.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Status

Proposed. Awaiting approval.
