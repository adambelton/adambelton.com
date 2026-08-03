# Task 040 — Add durable confirmed owner preferences

## Goal

Extend the proven workspace preference contract with owner-confirmed durable
guidance and relevant queries for conversation and revision.

## Depends on

Tasks 033 and 034.

## Why this task is next

Temporary preference behavior must prove the contract before durable cross-work
guidance expands privacy, schema, and authorization boundaries.

## Scope

- Persist only explicitly confirmed, data-minimized owner preferences.
- Add owner inspection, correction, rescoping, rejection, supersession, and removal.
- Supply relevant guidance to conversation and revision without overriding current direction.
- Add owner-scoped Prisma and host adapters plus privacy documentation.

## Out of scope

- Automatic profiling, embeddings, mandatory style enforcement, or demo durability.

## Expected files to create or modify

- product preference contracts/server/client modules
- Prisma schema, generated migration, and DB integration tests
- API adapters/routes, owner preference UI, and privacy docs

## Definition of done

- Durable guidance is confirmed, inspectable, correctable, removable, and owner-scoped.
- Conversation and revision consume narrow guidance operations rather than storage.
- Database integration, authorization, privacy, and behavioral tests pass.

## Blast radius

High: product contracts, schema/migration, DB and API adapters, owner UI, and two
model-backed operations. Requires a fresh proposal review and approval.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Settle minimal retained provenance, confirmation, conflict, and supersession semantics.
- Prevent durable guidance from leaking private excerpts or overriding current direction.

## Status

Proposed. Awaiting completion of Tasks 033 and 034.
