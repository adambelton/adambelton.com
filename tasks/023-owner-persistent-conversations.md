# Task 023 — Owner persistent conversations

## Goal

Give the owner a complete persistent-conversation flow in The Socratic Draft: conversations are saved against the authenticated owner, saved conversations can be listed and opened, and an opened conversation can be continued after a refresh or a later session.

## Why this task is next

Task 022 connected the conversation flow to a real LLM, and the existing database adapter already writes owner conversation turns. The persistence is not yet usable as a product feature: conversations are not associated with their owner, the conversations screen is a placeholder, and the editor cannot reload an existing conversation. Completing this vertical slice makes the owner writing flow durable before Task 025 introduces the deliberately different ephemeral demo flow.

## Scope

- Add owner association and the minimal conversation metadata needed to query persistent Socratic Draft conversations safely.
- Treat any existing Socratic Draft conversations and conversation messages as disposable development data. Clear those product records before introducing the required owner relationship if they would block the generated migration; preserve users, sessions, accounts, verifications, and all non-Socratic-Draft data.
- Generate and commit a Prisma migration using the repository migration workflow; do not hand-edit generated SQL.
- Extend the Socratic Draft-owned persistence contract with product-language operations for listing an owner's conversation summaries and loading one conversation with its messages.
- Keep owner scoping in the host-provided database adapter so product code remains independent of Prisma and Better Auth.
- Ensure owner conversation writes create and continue conversations within the authenticated owner's scope.
- Add owner-only product API routes to list conversations and load an individual conversation.
- Return a clear not-found response when a conversation does not exist or is outside the authenticated owner's scope.
- Replace the saved-conversations placeholder with a product-owned loading, empty, error, and populated conversations UI.
- Add a product-owned conversation route that loads the saved conversation into the editor and allows the owner to continue it.
- Preserve the existing new-conversation editor flow.
- Add behaviour-focused tests for the product contracts, HTTP routes, database adapter, host composition, route access, and client interactions introduced by this task.
- Update `progress.md`, `tasks/README.md`, and `docs/decisions.md` only if implementation changes an architectural decision.

## Out of scope

- Demo ephemeral mode or browser-held demo conversations.
- Durable persistence for non-owner users.
- Usage limits, request quotas, or cost controls.
- Creating or publishing a `Draft`; this task persists the conversation that may produce one later.
- Admin UI or general user conversation management.
- Conversation deletion.
- Pre-launch privacy disclosures, acknowledgement UX, temporary-session retention controls, and third-party policy messaging; these belong to Task 024.
- Manual title editing, automatic AI-generated titles, draft creation, or conversation metadata editing.
- Conversation streaming or changes to the Socratic conversation policy.
- Voice profiles, intended forms, research, readiness analysis, or cross-conversation memory.
- A generic platform-wide conversations API or repository abstraction.

## Expected files to create or modify

The exact split may change during implementation if a smaller, clearer structure emerges, but the expected surfaces are:

- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/<generated-migration>/migration.sql`
- `packages/db/src/socratic-draft/conversation-store.ts`
- `packages/db/src/socratic-draft/conversation-store-resolver.ts`
- related `packages/db/src/socratic-draft/*.test.ts` files
- `packages/products/src/socratic-draft/shared/types.ts` and its public exports
- `packages/products/src/socratic-draft/server/conversation/conversation-store.ts`
- `packages/products/src/socratic-draft/server/http/` conversation-route modules, exports, and tests
- `packages/products/src/socratic-draft/client/app/conversations/` list/detail UI, request helpers, and tests
- `packages/products/src/socratic-draft/client/app/editor/ConversationEditor.tsx` or a focused editor-loading boundary
- `packages/products/src/socratic-draft/client/app/routes.tsx` and route tests
- `apps/api/src/routes/products.ts` and composition tests
- `apps/client/src/products/resolveProductRoute.test.tsx` if host route coverage changes
- `tasks/README.md`
- `progress.md`
- `docs/decisions.md` only if a decision changes

## Definition of done

- A newly started owner conversation is persisted under the authenticated owner's identity.
- The owner conversations page lists saved conversations in a stable, useful order with a meaningful fallback label derived from existing content; automatic or editable titles are not required.
- Opening a listed conversation restores its saved conversation messages.
- The owner can send another message from the restored conversation and see the continued turn after reload.
- A missing conversation and a conversation outside the authenticated owner's scope are not exposed and produce the documented not-found behaviour.
- Non-owner and signed-out requests cannot use the persistent conversation list or detail endpoints.
- Non-owner conversations remain outside durable database persistence in this task.
- The new-conversation editor continues to work.
- Product code does not import Better Auth, Prisma, or concrete database infrastructure.
- Database access remains behind `packages/db`, and generated migration SQL is reviewed but not edited.
- Relevant behaviour tests pass, typecheck and build pass, and project context docs reflect the completed task.

## Validation commands

```txt
pnpm db:validate
pnpm db:generate
pnpm test
pnpm typecheck
pnpm build
git diff --check
pnpm db:migrate:status
```

During implementation, generate the migration with the approved Prisma development migration command and review the generated SQL before applying it to the shared Neon development branch.

## Risks / questions

- **Existing rows:** a previous owner conversation may have created a conversation because the API generates a conversation ID when the request contains `conversationId: null`. Adam has approved discarding any existing Socratic Draft conversations and conversation messages as development data. Deletion must be narrowly targeted and must not remove authentication or unrelated data.
- **Owner identity:** persistence should be scoped by the authenticated user ID, even though the current product has one configured owner, so conversation access cannot rely only on possession of a conversation ID.
- **Conversation labels:** this task proposes a deterministic fallback label from the first user message plus timestamps. Automatic AI-generated titles and title editing should remain later work unless Adam explicitly expands the scope.
- **Migration environment:** generating a migration may require the configured development database. Applying it to the shared Neon `dev` branch is an external state change and should be confirmed at implementation time.
- **Route shape:** the preferred product-owned detail route is `/products/socratic-draft/conversations/:conversationId`; implementation should preserve the existing host/product routing boundary rather than importing React Router into the product package.

## Status

Implemented and audit remediations completed.

Post-implementation audit remediation:

- Isolated non-owner in-memory conversations by authenticated user rather than sharing one process-wide store.
- Made saved-conversation route changes remount and reset editor state so messages cannot be continued against a stale conversation ID.
- Added an owner-scoped atomic message-position sequence to each persisted conversation.
- Moved deterministic conversation-label behavior into the product-owned conversation domain and reused it across host adapters.
- Updated current Socratic Draft planning documents to use the Conversation → Draft → Writing model.
- Refactored the new conversation list and detail pages into thin loading orchestrators with focused, behavior-tested state and presentation components.
