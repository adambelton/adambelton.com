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

## Out of scope

- Demo publishing, a heavy CMS, or live research.

## Expected files to create or modify

- product publishing port and owner client flow
- host writing contracts/routes and database adapters
- public writing pages, generated migration if required, tests, docs, and progress

## Definition of done

- The owner can deliberately publish and update a public piece end to end.
- Demo users cannot publish and private content is never public accidentally.
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

## Status

Proposed. Awaiting approval.
