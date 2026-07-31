# Task 021 — Full-codebase audit fixes

## Goal

Fix accepted findings from the full-codebase architecture and quality audit after the Vite migration.

## Scope

- Declare missing workspace package dependencies.
- Update stale architecture documentation now that `apps/client` is the host and `apps/web` has been removed.
- Make login error display handle unknown auth errors.
- Replace logout placeholder copy.
- Avoid full-page reloads for product-internal navigation by passing a host-owned functional link adapter into product routes.
- Keep product link styling product-owned rather than passing a host design-system wrapper into products.
- Ensure the Socratic Draft conversation endpoint reads existing conversation history before calling the conversation service.

## Out of scope

- Do not remove the current AI package boundary.
- Do not implement real LLM calls.
- Do not redesign the UI.
- Do not add database schema changes, entry management, publishing, usage limits, or admin UI.

## Definition of done

- Workspace manifests declare the package imports they use.
- Architecture docs reflect the completed Vite host migration.
- Product route navigation uses React Router for internal links through a host adapter.
- Product UI owns product link styling.
- Login and logout UX no longer hide unknown errors or placeholder copy.
- The conversation route has a tested history-loading seam for the upcoming LLM task.
- Typecheck, build, tests, and diff whitespace validation pass.

## Validation commands

```txt
pnpm install
pnpm typecheck
pnpm build
pnpm test
git diff --check
```

## Status

Implemented. Awaiting review.
