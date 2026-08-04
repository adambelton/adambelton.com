# Rename the product to ThoughtForm

## Goal

Replace the former Socratic Draft identity with ThoughtForm across the complete
product, host integrations, persistence schema, routes, tests, and repository
documentation.

## Approval record

Approved by Adam on 2026-08-04 as the fourth unnumbered course-correction task.

- `ThoughtForm` is the public product name, without a leading article.
- `thoughtform` is the product id, slug, route segment, package path, API path,
  structured-output prefix, and database table prefix.
- `ThoughtForm` and `thoughtForm` are the corresponding PascalCase and camelCase
  code identities.
- Valid domain concepts such as Draft, Discovery, Composition, conversation, and
  Idea Map remain unchanged.
- Existing development data has no preservation requirement.
- The complete disposable development database may be reset, including auth,
  session, verification, product data, and Prisma migration history.
- Existing migrations may be deleted and replaced with one schema-first generated
  initial migration for the complete current platform schema.
- Compatibility redirects and data migrations are intentionally out of scope.
- The rename remains on the current course-correction branch and belongs in the
  same eventual PR; committing, pushing, and opening that PR remain explicit
  later actions.

## Why this task is next

The old name describes a writing-first product that no longer exists. Continuing
planned work would deepen an identity that contradicts the corrected product.

## Scope

- Rename public copy, product registry identity, routes, links, API mounts,
  package paths, host product paths, code identifiers, test support, evaluation
  names, documentation, task references, and architectural examples.
- Rename Prisma models and relations and replace product tables with
  `thoughtform_*` tables.
- Delete all existing migration files, reset the disposable Neon development
  database, generate one new initial migration from the current schema, and
  apply it.
- Verify stale identity references explicitly and retain the former name only in
  this rename record or a decision entry where historical explanation requires
  it.

## Out of scope

- Product-behaviour changes.
- Renaming established domain concepts.
- Route redirects or persistence compatibility.
- Data preservation or production deployment.
- Git publication actions.

## Expected files

Repository-wide product and host paths under `packages/products`, `apps/client`,
`apps/api`, and `packages/db`; Prisma schema and migrations; root configuration;
product documentation; task records; deterministic and hosted tests.

## Definition of done

- ThoughtForm is the only active identity in UI, routes, APIs, paths, code,
  schema, tables, tests, and current documentation.
- One generated initial migration represents the complete platform schema and is
  applied to the empty development database.
- Fresh authentication and the complete mounted owner flow work.
- Unit, integration, database, browser, typecheck, build, schema, hosted,
  migration, stale-reference, and diff validation pass.
- A complete branch-diff audit finds no ownership, boundary, documentation, or
  generated-migration blocker.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
pnpm db:migrate:status
RUN_DATABASE_TESTS=true pnpm vitest run packages/db/src/adapters/thoughtform
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform-composition
git diff --check
```

## Risks

- The database reset intentionally destroys all development data and login state.
- Mechanical replacement can miss semantic references, filenames, generated
  names, URL expectations, or historical examples.
- Replacing migration history removes incremental provenance and is acceptable
  only because this is a pre-production disposable database reset.

## Status

Completed on 2026-08-04.

## Completion audit

- **Identity and paths:** public copy uses `ThoughtForm`; product id/slug, route,
  package path, API mount, output schemas, test hosts, commands, and table prefix
  use `thoughtform`; PascalCase/camelCase symbols use `ThoughtForm` and
  `thoughtForm`. Repository paths contain no old identity.
- **Domain boundary:** Draft, Discovery, Composition, conversation, Idea Map,
  product capabilities, ports, application coordination, delivery, and host
  adapter ownership are unchanged. This is an identity replacement rather than
  a behaviour rewrite.
- **Routes:** `/products/thoughtform`, its editor, privacy, conversations, and
  owner editor routes work. The authenticated old product route returns the host
  Not Found page; no alias or redirect was introduced.
- **Persistence:** Prisma models, generated client delegates, relations,
  adapters, fixtures, tests, constraints, indexes, foreign keys, and all eight
  product tables use the ThoughtForm identity.
- **Migration reset:** all ten previous migration files were deleted after the
  approved destructive reset. Prisma generated and applied only
  `20260804154812_initial`; migration status reports one migration and an
  up-to-date schema. The generated SQL was reviewed and not edited.
- **Data consequence:** prior users, sessions, verifications, conversations,
  messages, ideas, Drafts, revisions, proposals, operations, and migration
  history were intentionally deleted. A fresh owner account/session was created
  during mounted verification.
- **Deterministic evidence:** 200 unit/integration tests pass; the three complete
  Playwright journeys pass through renamed paths. The browser correction scenario
  now opens its collapsed Idea Map item before asserting hidden substance.
- **Database evidence:** five Prisma integration tests pass against the reset
  Neon schema. The concurrency test now invokes two persistence commits from the
  same exact snapshot, removing timing-dependent store loads while preserving its
  atomic conflict assertion.
- **Hosted evidence:** one bounded hosted conversation evaluation and the hosted
  first-person Draft composition evaluation pass using renamed structured-output
  contracts.
- **Mounted evidence:** the catalogue and overview show ThoughtForm; a fresh
  owner workspace persisted a hosted reflection, Idea Map, composed Draft, manual
  revision 2, and automatic saved-edit response, then restored them after reload.
  Final database counts are one conversation, three messages, one Draft, and two
  Draft revisions.
- **Stale-reference evidence:** repository search finds the former name only in
  Decision 048 and this task's explanatory rename sentence. There are no old
  paths, imports, URLs, database identifiers, generated models, or active copy.
- **Branch audit:** the complete diff against `main` was reviewed for ownership,
  product/host boundaries, duplicate compatibility code, unsupported docs,
  migration provenance, and accidental behaviour changes. No blocker remains.

## Summary

Renamed the complete product and persistence identity to ThoughtForm and replaced
the disposable development database/migration history with one generated initial
schema.

## Files changed

- Repository-wide product, host, database, documentation, task, configuration,
  test, fixture, and evaluation paths and contents
- Prisma schema, generated client, and one generated initial migration
- Decision 048, progress, task index, and this completion record

## Commands run

`pnpm test`, `pnpm test:e2e`, `pnpm typecheck`, `pnpm build`,
`pnpm db:generate`, `pnpm db:validate`, `pnpm db:migrate:status`, Prisma
`migrate reset --force`, `pnpm db:migrate:dev --name initial`, five database
integration tests, bounded `pnpm evaluate:thoughtform`, bounded
`pnpm evaluate:thoughtform-composition`, stale-reference searches, database
schema/count inspection, and `git diff --check`.

## What works end to end

ThoughtForm is discoverable from the product catalogue; fresh owners can create
and reopen conversations, use hosted conversational thinking and the Idea Map,
compose and edit an optional Draft, and restore its revisions through the renamed
mounted stack.

## Not implemented

Legacy redirects, aliases, dual exports, data migration, data preservation, or
production deployment.

## Risks / follow-ups

- Existing bookmarks using the former slug intentionally fail.
- The first mounted Draft request was deliberately interrupted by an API restart
  while clearing stale local processes, producing an empty-response JSON error;
  it persisted no Draft or operation. Reload recovery and the clean retry worked.
- Hosted response latency remains probabilistic and is unrelated to the rename.

## Suggested next task

Review Task 036 against the ThoughtForm identity, then resume the temporary
workspace lifecycle and recovery work if approved.
