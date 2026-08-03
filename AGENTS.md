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
apps/client
  Vite and React Router client for the personal website, writing pages, product pages, editor UIs, login, and admin UI.

apps/api
  Hono API server. Routes/controllers should be thin and should delegate to packages.

packages/shared
  Platform-wide types, API contracts, product registry types, writing types, user/access types, and usage types. Product-specific contracts do not belong here.

packages/db
  Database schema, database client, migrations, and repositories. Apps should not scatter direct DB logic.

packages/auth
  Session, magic-link, owner/demo access-level logic, and auth-related types.

packages/ai
  AI provider interfaces, provider implementations, streaming helpers, fake/test clients, and usage metadata helpers.

packages/products
  Product-specific source of truth. Each product owns its domain model, contracts, server logic, reusable client code, prompts, readiness logic, thread/claim handling, and composition logic.
```

Each product should use this extractable structure:

```txt
packages/products/src/[product-slug]/
  index.ts
  shared/
    index.ts
    types.ts
  server/
    capabilities/
    application/
    delivery/
    index.ts
  client/
    index.ts
  testing/
    fakes/
    fixtures/
    browser/
    evaluations/
```

Top-level apps are named by deployable surface, such as `apps/client` and `apps/api`. Product internals are named by reusable runtime boundary: `shared`, `server`, and `client`.

## Repository Organisation

The implemented structure documented in the root `README.md`, each product's
own `README.md`, and `docs/architecture.md` is mandatory for all future work.
Organise code by:

1. ownership boundary;
2. architectural role;
3. business or product capability;
4. single file responsibility.

This is a reasoning rule, not only a naming convention. Paths must help a reader
diagnose behaviour without knowing implementation history. Keep meaning separate
from mechanism, keep capability rules out of coordination and delivery layers,
make dependencies point toward stable contracts, colocate verification with its
owner, and introduce structure only for real implemented responsibilities.

Before placing new code, answer these questions in order:

1. Who owns the meaning?
2. Is the code a capability rule, application coordination, inbound delivery,
   an external port, a concrete adapter, presentation, or test support?
3. Which business or product capability does it concern?
4. What single reason should the file have to change?

If the proposed path does not communicate those answers, stop and resolve the
ownership or role ambiguity before implementation.

Do not place different architectural roles at the same directory level merely
because they all run on the server or client.

- `bootstrap` starts a deployable app and assembles its dependencies.
- `capabilities` contain rules owned by one product or platform capability.
- `application` coordinates capabilities for complete user operations.
- `delivery` exposes operations through HTTP or another inbound mechanism.
- `ports` describe dependencies required by an owner without implementing them.
- `adapters` connect ports to concrete host or infrastructure mechanisms.
- `testing/fakes`, `testing/fixtures`, `testing/browser`, and
  `testing/evaluations` have the distinct meanings documented in the root
  `README.md` and the owning product README.

Host product wiring belongs under `apps/[host]/src/products/[product-slug]`.
Concrete durable product persistence belongs under
`packages/db/src/adapters/[product-slug]`. Product definitions belong in
`packages/products`; `packages/shared` contains only platform-wide product
registry types.

Do not introduce generic dumping-ground directories such as `helpers`,
`utilities`, or undifferentiated `services`. A directory named `components` is
allowed only beneath a clearly owned interface capability or shared UI boundary.
Do not create empty speculative scaffold directories.

When moving or adding code, update the nearest owning README tree if the
architectural shape changes. The root README remains repository-wide; detailed
product structure, flows, integration guidance, and diagnostic maps belong in
the README at that product's root. New architectural roles or exceptions
require explicit approval and a record in `docs/decisions.md`.

## Product Dependency Boundary

- Product packages define the contracts they need to function.
- Host apps/packages provide adapters that fulfill those contracts.
- Product code must not directly depend on concrete host infrastructure for AI providers, auth/session systems, database clients, or usage enforcement.
- Products own persistence meaning and required operations, such as conversations, conversation turns, drafts, state, and publishing.
- Hosts own persistence mechanisms, such as tables, migrations, repositories, database clients, user scoping, retention, and transactions.
- Introduce product-owned ports only when a product genuinely needs the dependency.
- Product ports should use product language, not infrastructure language. Prefer `appendConversationTurn` over generic `query` or `transaction`.

## Architecture Rules

- Do not create new architectural patterns without approval.
- Consult `docs/products/socratic-draft/terminology.md` before introducing or
  changing Socratic Draft domain names in code, prompts, tasks, or documentation.
- Do not duplicate shared types inside apps.
- Platform-wide shared types belong in `packages/shared`.
- Product-specific types, contracts, and behaviour belong in that product's folder under `packages/products`.
- All TypeScript imports and re-exports must use repo-root absolute paths. Do not use relative imports or aliases, even between files in the same folder.
- Import paths should start from top-level folders such as `apps/` or `packages/`, for example `packages/products/src/socratic-draft/server/capabilities/conversation` or `apps/client/src/ui/components/Prose`.
- Product delivery routes should stay thin and invoke product application or
  capability operations. Host product mounts assemble dependencies and must not
  recreate product behaviour.
- DB access should go through `packages/db`.
- AI provider access should go through `packages/ai`.
- Auth/access logic should go through `packages/auth`.
- Do not create placeholder UI, buttons, pages, routes, or services that are not connected to working behaviour.
- Do not mark a task complete if something is only partially wired.
- Prefer vertical slices that work end to end.

## Code Quality And Testing

- Follow `docs/code-quality.md` for naming, structure, coupling, and maintainability standards.
- Follow `docs/testing.md` for test strategy and regression coverage expectations.
- Keep project rules tool-agnostic and repo-owned; tool-specific config may point to these docs but should not replace them as the source of truth.
- Prefer tests that verify observable behaviour, public contracts, and composition boundaries over implementation details.
- Product behaviour tests, browser scenarios, fixtures, and evaluations belong
  under the product they exercise. Host apps should retain only tests of host
  mounting, routing, and supplied adapters; infrastructure packages should
  retain tests of their own product-specific adapter implementations.

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

Approved implementation work should use a dedicated `codex/` branch. Before
merge, run the task's approved local validation and require the repository CI
checks to pass. Committing, pushing, and opening or merging a pull request remain
explicit actions and should only be performed when Adam requests them.

Use local `git` for branches, staging, commits, and pushes. Use the authenticated
GitHub CLI (`gh`) directly for GitHub mutations and GitHub Actions operations,
including creating pull requests, monitoring checks, reading workflow logs, and
merging pull requests. Do not attempt a GitHub connector mutation before falling
back to `gh`: the current ChatGPT Codex Connector authorization cannot create or
merge pull requests for this repository. The connector may be used for optional
read-only structured repository, issue, or pull-request context when it is more
useful than `gh`.

## Proposal Review And Approval Records

Review proposals against the following authority order:

1. `AGENTS.md` and current entries in `docs/decisions.md`
2. the canonical product architecture
3. the product brief
4. completed-task outcomes and `progress.md`
5. the current task proposal
6. adjacent planned tasks
7. explicitly historical or superseded documents as context only

Classify every review finding as one of:

- **Blocker:** the proposal is internally contradictory, violates a
  higher-authority decision, cannot deliver its stated behaviour, or creates an
  unacceptable unaddressed risk.
- **Clarification:** wording or detail that would improve the proposal but does
  not prevent approval.
- **Implementation decision:** a choice deliberately delegated to the approved
  task and not evidence that the proposal is incomplete.
- **Previously settled:** an intentional boundary or decision that must not be
  reopened without new evidence.

Do not recommend changing previously settled scope unless the review cites the
exact proposal language, the conflicting higher-authority rule or genuinely new
evidence, and why the conflict cannot be resolved during implementation. General
preferences or principles do not override an explicit approved boundary by
themselves.

When Adam approves a proposal, add an `Approval record` to the task containing
the approval date, intentional boundaries, important deferrals, implementation
decisions that remain open, and decisions that should not be reopened. This
record preserves why the task was approved across conversations; it does not
expand or replace the approved proposal.

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
