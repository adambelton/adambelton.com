# Task 037 — Export a temporary workspace deliberately

> **Retired on 2026-08-04.** Product-owned Markdown/JSON export is outside the
> corrected ThoughtForm boundary. Plain-text content can be copied manually;
> any later local-Markdown or static-content pipeline belongs to host-website
> delivery after product v1. This proposal is historical context and is not
> approved for implementation.

## Goal

Let a demo user copy the canonical draft and download explicit Markdown or
versioned JSON exports without creating persistence or publication.

## Depends on

Task 036.

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

Retired. Not planned.
