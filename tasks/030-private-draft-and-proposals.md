# Task 030 — Add private drafts and approved revision proposals

## Goal

Create the user-owned private draft as a domain object separate from conversation,
with composition and assistant changes governed by explicit approval.

## Why this task is next

The product can only demonstrate questioning before drafting once explored ideas
can become mutable writing without surrendering authorship to the assistant.

## Scope

Implements **Drafting and revision**, **Draft composition**, **Assistant
revision**, and the draft invariants in **Authority and invariants** from the
product architecture.

- Compose a private draft from selected workspace material after user approval.
- Support deliberately early or rough composition when requested.
- Allow unrestricted direct draft editing.
- Propose a bounded assistant revision with visible scope.
- Support acceptance, rejection, and amendment before applying a proposal.
- Add temporary demo and durable owner persistence semantics through product ports.

## Out of scope

- Publishing, rich version history, partial multi-hunk acceptance, or automatic
  long-term preference inference.

## Expected files to create or modify

- draft shared/server/client modules under the product
- product-owned draft persistence ports and host database adapters
- Prisma schema/migration for owner drafts if required
- integration/rendering tests, privacy docs, progress, and task index

## Definition of done

- Conversation and draft are separate observable concepts.
- Manual edits are canonical; assistant edits cannot apply without approval.
- Demo content remains temporary and owner drafts persist.
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

- Proposal comparison must remain understandable and accessible.
- Persistence should preserve authorship semantics without premature versioning.

## Status

Proposed. Awaiting approval.
