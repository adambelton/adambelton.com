# Task 034 — Establish temporary explicit preferences and one guidance path

## Goal

Introduce an inspectable, correctable workspace preference capability and prove
one narrow guidance path without durable owner profiling.

## Why this task is next

The workspace now produces explicit preferences and editorial evidence. A stable
boundary lets the baseline remain simple while supporting richer later learning.

## Depends on

Task 033.

## Scope

Implements **Preference learning**, **Preference evidence**, and the applicable
**Privacy and data minimisation** rules from the product architecture.

- Record temporary workspace-scoped explicit preferences and corrections.
- Distinguish evidence, preference, scope, and confirmation.
- Let the user inspect, correct, scope, and remove workspace preferences.
- Supply context-relevant guidance to one approved operation, initially draft
  composition, while explicit current instruction takes precedence.
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
- Demo preferences expire with the temporary workspace.
- Confirming, correcting, rescoping, rejecting, superseding, or removing a
  preference changes subsequent guidance without mutating prior conversation or
  draft history.

## Out of scope

- Automatic profiling from every edit, opaque embeddings, or mandatory style
  enforcement.

## Expected files to create or modify

- product preference shared/server/client modules
- product-owned preference operations and temporary host adapter
- workspace preference UI, temporary host adapter, and tests
- privacy docs, progress, and task index

## Definition of done

- At least one end-to-end scenario proves that an explicit preference changes a
  later composition result while a conflicting current
  instruction still takes precedence.
- Retained preferences are inspectable, correctable, removable, and scoped.
- Other capabilities depend only on preference operations, not storage or
  inference internals.
- Tests, typecheck, build, browser behavior, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
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
- How corrections and removal change current guidance without rewriting prior
  conversation or draft history.

## Blast radius

Medium: new product capability, temporary adapter, composition guidance, and UI.
Durable schema and multi-operation prompt changes are deliberately deferred.

## Status

Proposed. Awaiting approval.
