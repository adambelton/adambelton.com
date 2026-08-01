# Task 032 — Establish the preference-learning baseline

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

## Out of scope

- Automatic profiling from every edit, opaque embeddings, or mandatory style
  enforcement.

## Expected files to create or modify

- product preference shared/server/client modules
- product-owned persistence ports and host adapters
- owner preference UI, schema/migration if required, and tests
- privacy docs, progress, and task index

## Definition of done

- Explicit preferences measurably inform a later suggestion.
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

## Status

Proposed. Awaiting approval.
