# Task 008 — Conversation Endpoint With In-Memory Host Adapter

## Status

Complete.

## Goal

Add the first Socratic Draft API endpoint, wired through a host-owned in-memory adapter that fulfills the product's required persistence contract.

## Why This Task Is Next

We have the product service boundary and the product/host dependency rule. The next useful slice is an HTTP endpoint that proves the host can call the product without the product owning API or persistence infrastructure.

## Scope

- Define the smallest product-owned persistence port needed for this endpoint.
- Add a host-owned in-memory implementation for that port.
- Wire an API route/controller to `ConversationService`.
- Keep the API route thin.
- Add contract-focused tests for the endpoint or route handler.
- Update progress/task docs.

## Out Of Scope

- Real database schema.
- Real auth/session.
- Real AI calls.
- UI/editor.
- Streaming.
- Durable persistence.
- Sophisticated conversation behaviour.

## Expected Files

Likely:

```txt
apps/api/src/routes/socratic-draft/...
apps/api/src/server.ts
packages/products/src/socratic-draft/server/conversation/...
packages/products/src/socratic-draft/shared/...
progress.md
tasks/README.md
tasks/008-conversation-endpoint-with-in-memory-host-adapter.md
```

## Definition Of Done

- API exposes a Socratic Draft conversation endpoint.
- Endpoint calls product service through product-owned contracts.
- In-memory persistence lives in host/API code, not product core.
- Tests verify request/response behaviour and contract shape.
- `pnpm test` and `pnpm typecheck` pass.

## Validation Commands

```txt
pnpm test
pnpm typecheck
```

## Risks / Questions

- Keep the persistence port minimal and product-language-specific.
- The in-memory adapter is only a host test/demo adapter, not the future database design.
- Need to choose the endpoint path, likely `POST /products/socratic-draft/conversation/respond`.
