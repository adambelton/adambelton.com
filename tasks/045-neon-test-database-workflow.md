# Task 045 — Add a dedicated Neon test-database workflow

## Goal

Create a safe, explicit workflow for running the repository's real-Prisma
integration suites against a dedicated Neon test branch without risking the
shared development or production databases.

## Why this task is later

The existing conversation and drafting persistence suites already provide gated
real-Postgres coverage, and ordinary development remains protected by fast
deterministic tests. A dedicated test database would make that coverage easier
and safer to run repeatedly, but it does not currently block product work.

This task therefore sits at the back of the roadmap unless database changes or
unverified persistence behaviour make it more urgent.

## Scope

- Create a dedicated Neon `test` branch from the appropriate migrated parent.
- Define a repository-owned test-database environment convention using
  `TEST_DATABASE_URL` rather than overloading the application's `DATABASE_URL`.
- Add an explicit command for running real-Prisma integration tests.
- Apply committed migrations to the test branch before running the suites.
- Run the existing conversation and drafting persistence integration suites
  against the test branch.
- Preserve randomized, self-cleaning test records and strengthen cleanup where
  necessary.
- Add safeguards that reject production and shared-development database targets.
- Document setup, migration, execution, cleanup, and secret-handling workflows.
- Decide separately whether the test branch and secret should later be used by
  CI; local or explicitly triggered execution is an acceptable baseline.

## Settled constraints

- The Neon `production` and shared `dev` branches must not be used as routine
  integration-test targets.
- Test credentials and connection strings remain uncommitted.
- Integration tests continue to exercise the concrete Prisma adapters and real
  Postgres transaction behaviour.
- Ordinary `pnpm test` remains deterministic and must not silently connect to a
  hosted database.
- Creating the Neon branch, applying migrations, and configuring external
  secrets are explicit infrastructure changes performed only during approved
  implementation.
- This task does not change ThoughtForm product behaviour or persistence
  semantics.

## Out of scope

- Product features or schema changes unrelated to the test workflow.
- Replacing deterministic adapter tests with hosted-database tests.
- Running tests against production or shared development data.
- Making database integration tests mandatory for every local test run.
- Adopting Neon Auth or another database provider.
- Provisioning per-pull-request database branches unless separately justified.

## Expected files to create or modify

- root and package scripts for an explicit database-integration test command
- database integration-test environment and target safeguards
- existing Prisma integration suites where cleanup or configuration must change
- `docs/local-development.md`
- relevant CI workflow only if CI execution is explicitly approved
- decisions, progress, and task index
- external Neon project state for the dedicated test branch

## Definition of done

- A dedicated Neon test branch exists and contains all committed migrations.
- One documented command runs every real-Prisma integration suite against it.
- The command uses `TEST_DATABASE_URL` and cannot accidentally target the known
  production or shared-development branches.
- Existing conversation and drafting persistence integration suites pass against
  real Postgres and clean up their randomized records.
- Ordinary unit tests remain database-independent.
- Setup and secret handling are documented without exposing credentials.
- CI use is either implemented and validated or explicitly deferred with a
  recorded reason.
- Tests, typecheck, build, Prisma validation, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm test:db
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Settle whether the Neon `test` branch should descend from `dev` or another
  migration-only baseline.
- Settle how branch identity is verified without committing Neon-local state or
  secrets.
- Decide whether CI should receive a long-lived test secret, use an explicitly
  triggered workflow, or remain deferred.
- Prevent parallel test runs from interfering despite randomized identifiers and
  self-cleaning records.
- Ensure failed or interrupted runs do not leave material test data behind.

## Status

Proposed. Low priority and awaiting approval.
