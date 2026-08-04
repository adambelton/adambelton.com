# Task 038 — Export a temporary workspace deliberately

## Goal

Let a demo user copy the canonical draft and download explicit Markdown or
versioned JSON exports without creating persistence or publication.

## Depends on

Task 037.

## Why this task is next

Recovery must be coherent before export freezes a public file contract around
workspace state.

## Scope

- Copy canonical draft content.
- Define Markdown export ordering and headings.
- Define a versioned, privacy-reviewed JSON export with explicit history inclusion.
- Keep exports client-initiated and preserve degraded-state availability.
- Add browser download, content, and accessibility tests.

## Out of scope

- Server persistence, publishing, automatic backup, or browser-held recovery.

## Expected files to create or modify

- product export contracts and pure serializers
- editor export controls and browser tests
- privacy/help copy and task documentation

## Definition of done

- Canonical copy, Markdown, and versioned JSON exports are explicit and accurate.
- History inclusion is deliberate and documented.
- Export remains available without hosted AI and creates no server state.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

## Blast radius

Low to medium: product export contracts and client behavior only; no schema or
host persistence changes are expected.

## Risks / questions

- Settle versioning, history defaults, filenames, Markdown headings, and handling
  of active or rejected proposal content.

## Status

Proposed. Awaiting completion of Task 037.
