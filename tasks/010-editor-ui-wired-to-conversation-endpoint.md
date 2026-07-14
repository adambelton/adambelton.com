# Task 010 — Editor UI Wired To Conversation Endpoint

## Status

Complete.

## Goal

Add the first minimal Socratic Draft editor/demo page that can send a user message to the conversation endpoint and render the assistant response.

## Scope

- Add `/products/socratic-draft/editor`.
- Add a minimal client-side conversation UI.
- Send messages to `POST /products/socratic-draft/conversation/respond`.
- Track `entryId` in client state after the first response.
- Render user and assistant messages.
- Handle empty input, loading state, and basic error state.
- Preserve accessibility basics: semantic form, labelled textarea, button state, focus-visible support, and no keyboard traps.
- Keep styling minimal and consistent with the existing site foundation.
- Add focused tests for the request helper.
- Update progress/task docs.

## Out Of Scope

- Full writing editor.
- Rich Socratic Draft UI design.
- React Aria installation.
- Streaming responses.
- Auth/access control.
- Durable persistence.
- Real AI calls.
- Suggested reply interactions.
- Publishing/composition flows.

## Definition Of Done

- `/products/socratic-draft/editor` renders a usable minimal conversation UI.
- User can submit a non-empty message and see the assistant response.
- The returned `entryId` is retained for subsequent messages.
- Empty input cannot be submitted.
- Loading and error states are visible and restrained.
- Form controls are labelled and keyboard-usable.
- No product-specific final design system is introduced.
- No React Aria dependency is added.
- `pnpm test` and `pnpm typecheck` pass.

## Validation

```txt
pnpm test
pnpm typecheck
```

## Completed Notes

- Added a minimal editor page under `/products/socratic-draft/editor`.
- Added a product-specific web request helper for the conversation endpoint.
- Added a Next.js rewrite so `/api/*` proxies to the local Hono API host.
- Added request-helper tests for success and API failure.
- Linked the product page to the editor demo.
