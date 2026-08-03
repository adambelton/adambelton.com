# Task 042 — Publish a private draft through the host writing adapter

## Goal

Let the owner deliberately create or update a host-owned public writing post from
a Socratic Draft private draft.

## Depends on

Task 041.

## Why this task is next

With host writing stable, the product can depend on one narrow adapter rather
than co-designing public persistence and private publication in one change.

## Scope

- Add a product-language publishing operation and host writing adapter.
- Enforce owner-only authorization server-side.
- Prepare title, slug, excerpt, body, and publication date explicitly.
- Idempotently create or update the linked host post.
- Optionally include unpublishing only if separately approved in the proposal.
- Preserve the canonical private draft on every success or failure.

## Out of scope

- Demo publishing, public rendering changes, a general CMS, or draft-save coupling.

## Expected files to create or modify

- product publishing port and owner interaction
- host writing adapter and owner-authorized API route
- idempotency/relationship persistence if required
- product, host, authorization, and browser tests

## Definition of done

- Owner publication and update work end to end without duplicate posts.
- Demo users cannot publish and unpublished workspace data never becomes public.
- Failure and retry preserve both private draft and existing public post.
- Product extractability and host ownership remain covered by boundary tests.

## Blast radius

Medium: product publishing port, owner UI, API authorization, and the host writing
adapter. Public rendering and schema are already established by Task 041.

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

- Settle draft-to-post identity, preparation inputs, slug updates, retry behavior,
  and whether unpublishing is intentionally included.

## Status

Proposed. Awaiting Task 041.
