# Task 031 — Add private drafts and approved revision proposals

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

## Settled constraints

- A draft is a product-owned private resource distinct from conversation history
  and the idea map. Its body is the user's canonical current composition and
  need not contain every important or explored idea.
- Every draft has a revision identity or concurrency token. A direct user save is
  made against an expected revision; after a successful save the submitted
  content is canonical immediately and does not require assistant approval.
- Composition receives explicitly selected workspace material, relevant
  unresolved uncertainty, conversation language, and available preference
  guidance. A user may request an intentionally early or rough draft.
- An assistant proposal identifies its bounded scope, intended effect, proposed
  content, and base draft revision. Generating a proposal never mutates canonical
  draft content.
- Accepting a proposal applies the exact reviewed proposal rather than silently
  regenerating different content. Acceptance verifies the base revision and
  atomically applies the proposal while advancing the draft revision.
- A proposal based on an older draft becomes stale and must never overwrite newer
  user edits. Rebase, regeneration, or dismissal requires a new explicit choice.
- Acceptance and other retryable lifecycle operations are idempotent where a
  network retry could otherwise duplicate an effect.
- Rejection and amendment preserve canonical draft content until an explicit
  application succeeds.
- Demo and owner drafts use identical domain semantics. Demo drafts and proposals
  follow the temporary workspace lifetime; owner drafts are durably owner-scoped.
- Product code defines draft-language ports and must not import Prisma, auth,
  provider, or other host infrastructure.
- Publishing remains a separate, explicit, owner-only host operation.

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
- Stale direct saves and stale proposals preserve the newer canonical draft.
- Accepting a proposal applies the reviewed content exactly once without another
  model call.
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

## Decisions this task must settle

- The first supported proposal scope and its accessible comparison UI.
- Whether amending a proposal edits the reviewed proposal directly or creates a
  new proposal revision; it must not mutate the draft implicitly.
- Draft/proposal identifiers, revision tokens, stale-result contracts, and the
  idempotency key or operation semantics used for retries.
- The exact selected workspace material and unresolved uncertainty supplied to
  composition.
- The schema and transaction boundary required to apply a proposal and advance
  its draft revision atomically.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Status

Proposed. Awaiting approval.
