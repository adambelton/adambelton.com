# Task 035 — Publish private drafts to site writing

## Goal

Let the owner deliberately prepare and publish a Socratic Draft private draft as
a host-owned public writing post.

## Why this task is next

The private inquiry and draft lifecycle is complete and safely hosted. Publishing
can now act as the explicit bridge to the website rather than defining draft
semantics prematurely.

## Scope

Implements the publishing boundary in **State ownership**, **Package and
dependency boundaries**, and the owner portion of **Persistence architecture**.

- Add publishing intent and preparation behaviour.
- Create/update host-owned writing from an owner-authorized private draft.
- Use `published_at` as public visibility truth.
- Render published writing through the public website.
- Preserve the private draft as canonical product work.

## Settled constraints

- The Socratic Draft owns the private `Draft`; the host website owns the public
  `WritingPost`. Publishing is an explicit bridge and must not make a conversation
  or working draft directly public.
- Publishing is owner-only and authorization is enforced server-side. Demo and
  temporary workspaces cannot invoke the publishing operation.
- The product defines a publishing operation in product language; the host
  supplies a writing-system adapter. Product code must not import host database,
  auth, or site-rendering implementations.
- `published_at = null` means a host writing post is private. A non-null
  `published_at` is the source of truth for public visibility; do not introduce a
  parallel general publishing phase.
- Publishing and updating public writing are outside the private draft's ordinary
  save lifecycle. A publish operation must not silently change canonical private
  draft content.
- A publish failure preserves the private draft and any existing public post.
- Repeated publication must identify and update the intended existing writing
  post rather than accidentally creating duplicates.
- Public writing rendering belongs to the host client. The root route remains the
  writing collection, `/writing` is the archive, and individual public posts use
  `/writing/:slug`.
- Public responses and pages must never expose unpublished draft, conversation,
  idea-map, proposal, or preference content.

## Out of scope

- Demo publishing, a heavy CMS, or live research.

## Expected files to create or modify

- product publishing port and owner client flow
- host writing contracts/routes and database adapters
- public writing pages, generated migration if required, tests, docs, and progress

## Definition of done

- The owner can deliberately publish and update a public piece end to end.
- Demo users cannot publish and private content is never public accidentally.
- Publishing failure or retry cannot corrupt the private draft or duplicate the
  public post.
- Public visibility is determined solely by the host writing post's
  `published_at` value.
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

- Public preparation must not overwrite private meaning or invent outcomes.

## Decisions this task must settle

- The stable relationship between one product draft and its host writing post.
- Writing-post title, slug, excerpt, body, and publication-date inputs, including
  slug collision and later-update behavior.
- What publishing intent and preparation store or change before the explicit
  publish operation.
- Whether unpublishing is included; if included, it clears public visibility
  without deleting or rewriting the private draft.
- Public empty, archive, not-found, and detail behavior for the settled writing
  routes.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Status

Proposed. Awaiting approval.
