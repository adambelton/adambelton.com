# Agent Instructions

## Repo Purpose

This repo is Adam's personal website and product demo platform.

It includes:

- public website
- published writing
- product overview pages
- interactive product demos
- shared API/server
- shared auth
- shared database layer
- shared AI provider layer
- usage tracking/admin
- product-specific domain logic

The first product is **The Socratic Draft**.

The Socratic Draft is the first product inside this system, not the whole app.

## Package Boundaries

```txt
apps/web
  Next.js frontend for the personal website, writing pages, product pages, editor UIs, login, and admin UI.

apps/api
  Hono API server. Routes/controllers should be thin and should delegate to packages.

packages/shared
  Cross-package types, API contracts, product registry types, writing types, user/access types, and Socratic Draft shared conversation types.

packages/db
  Database schema, database client, migrations, and repositories. Apps should not scatter direct DB logic.

packages/auth
  Session, magic-link, owner/demo access-level logic, and auth-related types.

packages/ai
  AI provider interfaces, provider implementations, streaming helpers, fake/test clients, and usage metadata helpers.

packages/products
  Product-specific domain logic. The Socratic Draft conversation service, prompts, readiness logic, thread/claim handling, and composition logic belong here.
```

## Architecture Rules

- Do not create new architectural patterns without approval.
- Do not duplicate shared types inside apps.
- If a type crosses a package boundary, define it in `packages/shared`.
- Product-specific behaviour belongs in `packages/products`.
- API routes should stay thin and call controllers/services.
- DB access should go through `packages/db`.
- AI provider access should go through `packages/ai`.
- Auth/access logic should go through `packages/auth`.
- Do not create placeholder UI, buttons, pages, routes, or services that are not connected to working behaviour.
- Do not mark a task complete if something is only partially wired.
- Prefer vertical slices that work end to end.

## Proposal-Before-Implementation Workflow

Before starting any new implementation task, propose the task and wait for Adam's explicit approval.

The proposal must include:

- goal
- why this task is next
- scope
- out of scope
- expected files to create or modify
- definition of done
- validation commands
- risks/questions

Do not begin implementation until Adam confirms.

After each completed task, you may suggest the next task, but that suggestion is not approval to begin.

## Completion Rules

Every implementation task is only complete when:

- relevant tests pass
- typecheck passes
- the intended flow works end to end, or the task explicitly says it is contract/scaffold-only
- files changed are summarised
- commands run are listed
- known gaps are documented
- `progress.md` is updated
- `docs/decisions.md` is updated if a decision changed

## End-of-Task Report Format

Use this report format at the end of each implementation task:

```md
## Summary

## Files changed

## Commands run

## What works end to end

## Not implemented

## Risks / follow-ups

## Suggested next task
```
