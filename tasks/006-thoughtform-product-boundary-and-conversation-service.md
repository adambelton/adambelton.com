# Task 006 — ThoughtForm Product Boundary And Conversation Service

## Status

Complete.

## Goal

Establish ThoughtForm as an extractable product package, move its product-specific contracts into that package, add the first minimal server-side conversation service, and introduce tests with that business logic.

## Scope

- Add minimal test setup with Vitest and a root `pnpm test` command.
- Establish the ThoughtForm product package shape using `shared`, `server`, and `client` boundaries.
- Move ThoughtForm product contracts out of `packages/shared` and into the ThoughtForm product package.
- Add a minimal `ConversationService` under the product server boundary.
- Add contract-focused tests for the service's public behaviour.
- Document product ownership, extraction-oriented structure, naming, and Pinpoint Assignment lessons.
- Update progress and task tracking.

## Out Of Scope

- API route.
- UI/editor.
- Persistence.
- Auth.
- Real LLM calls.
- Coverage/readiness scoring.
- Welcome/start flow.
- Advanced Socratic conversation design.
- Renaming `apps/web` or `apps/api`.

## Definition Of Done

- ThoughtForm's product-specific contracts live in the ThoughtForm product package.
- Product-local contracts use direct domain names without repeating the product name.
- `packages/shared` no longer exports ThoughtForm domain types.
- TypeScript imports use repo-root absolute paths rather than relative paths or aliases.
- ThoughtForm has the standard `shared/server/client` product shape in code.
- The server conversation service returns a typed, stable minimal response for a typed request.
- Tests assert observable contract behaviour and avoid implementation details.
- Repo docs record the product ownership and extraction decisions.
- `pnpm test` and `pnpm typecheck` pass.

## Validation

```txt
rg -n 'from "\\.|from '\\.|import "\\.|import '\\.' apps packages'
pnpm test
pnpm typecheck
```
