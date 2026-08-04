# Task 042 — Establish the host public-writing system

> **Superseded on 2026-08-04.** Public writing remains valid host-website work,
> but this database-backed `WritingPost` proposal no longer represents the
> intended delivery. After ThoughtForm v1 is ready for release, prepare a new
> proposal for local Markdown ingestion and static content pages. That work must
> remain independent of product Drafts. This proposal is historical context and
> is not approved for implementation.

## Goal

Give the host a complete `WritingPost` persistence and public rendering boundary
without coupling it to ThoughtForm publishing yet.

## Why this task is next

The host needs a proven public-writing contract and visibility boundary before a
product adapter can publish into it safely.

## Scope

- Define platform-wide writing contracts in `packages/shared`.
- Add host-owned writing schema, Prisma repository, and thin public API reads.
- Render the root writing collection, `/writing` archive, and `/writing/:slug`.
- Use `published_at` as the sole public-visibility truth.
- Cover empty, published, unpublished, not-found, slug, and owner-scoping behavior.

## Out of scope

- Product publishing, demo publishing, a heavy CMS, or live research.

## Expected files to create or modify

- shared writing contracts
- Prisma schema, generated migration, repository, and integration tests
- thin public API routes and host writing pages
- privacy/architecture/progress documentation

## Settled constraints

- Public responses never expose unpublished writing or product workspace state.
- `WritingPost` is host-owned and independent of the private product `Draft`.
- This task does not add a product publishing command or make a draft public.
- Schema changes follow the generated Prisma migration workflow.

## Definition of done

- Published fixture posts render end to end and unpublished posts remain private.
- Public collection, archive, detail, and not-found contracts are tested.
- Tests, typecheck, build, schema validation, and diff checks pass.

## Blast radius

Medium to high but host-contained: shared writing contracts, schema, DB adapter,
API, and public client pages. The product package should not change.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Settle slug collision/update behavior, public ordering, date semantics, and
  whether an owner-only host preparation surface belongs in this slice.

## Status

Superseded. Replace with a fresh host-website proposal after ThoughtForm v1.
