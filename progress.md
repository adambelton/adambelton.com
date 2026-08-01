# Progress

## Current status

The monorepo has been scaffolded with the intended app/package structure. The first minimal Socratic Draft product-domain service, API conversation endpoint, product-owned editor UI loop, owner-scoped Prisma persistence and saved-conversation flow, complete temporary demo lifecycle, hosted-AI immediate safety boundary, Neon dev database setup, host-mounted product app boundary, owner auth foundation, and LLM-backed product flow exist.

The repo currently has a Vite and React Router client host with the shared public website shell, auth UX, product mounting, and public privacy page, a minimal Tailwind styling foundation, static public routes, a basic Hono API shell, a working health route, shared platform contracts, an initial product registry, an extractable Socratic Draft product package shape, host-owned in-memory and Prisma-backed conversation adapters, product-owned Socratic Draft client and API route entrypoints, Better Auth magic-link auth with Prisma tables, a Neon `dev` database branch with committed migrations applied, an OpenAI-backed LLM adapter supplied by the API host, a pre-editor privacy acknowledgement, and a fixed temporary-conversation lifecycle for non-owner users. A post-migration codebase audit has been completed and accepted fixes have been applied.

The Socratic Draft product model has been refined before usage-limit work. The
product is now documented as a shared inquiry and articulation workspace with
conversation history, an inspectable idea map, and a user-owned draft. Conceptual
capability boundaries and a staged implementation plan now cover idea mapping,
fluid discovery/articulation, approved draft revisions, manual-edit
interpretation, preference learning, a complete demo session, calibrated usage
protection, publishing, and admin visibility.

## Implemented

- Monorepo structure with `apps/client`, `apps/api`, and the intended `packages/*` boundaries.
- Root `pnpm` workspace configuration.
- Root TypeScript configuration.
- Repo-root absolute TypeScript import rule with workspace path resolution.
- `apps/client` Vite and React Router website host.
- Minimal `apps/client` Tailwind styling foundation and small owned site components.
- Accessibility-first UI guidance: semantic HTML first, React Aria Components for future complex interactive UI when genuinely needed.
- Public site accessibility baseline with skip link, semantic landmarks, visible focus states, and documented alt text policy.
- Static public routes for `/` and `/about`; authenticated product routes under `/products`.
- Socratic Draft temporary demo editor at `/products/socratic-draft/editor` for every authenticated user, including the owner.
- Product-owned client request helper for the conversation endpoint.
- Host-owned React Router products route at `/products/:productSlug/*` that dispatches into product-owned route handling.
- Socratic Draft-owned client app surface under `packages/products/src/socratic-draft/client`.
- Socratic Draft client files organised by responsibility under `pages`,
  `components`, and `modules`, with demo and persistent editor pages named
  explicitly as `DemoEditorPage` and `EditorPage`.
- Socratic Draft-owned API route surface under `packages/products/src/socratic-draft/server/http`.
- API host mount for product API routes under `/products`.
- Product route access requirements for authenticated and owner-only Socratic Draft routes.
- Platform-wide `ACCESS_LEVELS` constant as the source of truth for owner and demo access-level values.
- Product roadmap context for The Socratic Draft and the future Care Calendar health-tech learning product.
- Client-first host architecture decision: move toward Vite and React Router in staged tasks.
- Initial `apps/client` Vite and React Router scaffold with placeholder routes and dev proxy config.
- Shared public website shell ported into `apps/client`, including skip link, header/nav, footer, prose/layout primitives, and current public route content.
- Better Auth magic-link login, login verification, logout, session-aware header state, and client-side `/products` gating ported into `apps/client`.
- Product mounting ported into the Vite client through React Router, with Socratic Draft overview, editor, and conversations routes dispatched from the host into the product-owned route renderer.
- Host-owned functional navigation adapter for product apps, with product-owned link styling preserved inside the product package.
- Security posture for the future client host: client route gates are UX only; API/server authorization is authoritative.
- Vite local API proxy for `/api/*` to the Hono API host.
- Vite local auth proxy for `/auth/*` to the Better Auth route on the Hono API host.
- Basic `apps/api` Hono server.
- `GET /health` API route.
- Better Auth handler mounted at `/auth/*` on the API host.
- `POST /products/socratic-draft/conversation/respond` API route mounted by the host and handled by the Socratic Draft product package.
- Minimal magic-link sign-in page at `/sign-in`.
- Owner-only Socratic Draft saved-conversation list at `/products/socratic-draft/conversations`, with explicit persistent creation and ID-addressed editors at `/products/socratic-draft/conversations/:id/editor`.
- `packages/shared` API response, user/access, writing, usage, and product registry types.
- Product registry containing The Socratic Draft, with lookup helpers by id and slug.
- Socratic Draft-owned shared conversation/domain contract types under `packages/products`.
- Minimal Socratic Draft server conversation service with contract-focused tests and a product-owned conversation model port.
- Socratic Draft conversation endpoint now reads existing conversation messages before calling the product conversation service.
- OpenAI-backed LLM adapter in `packages/ai`, using `OPENAI_API_KEY` and `OPENAI_MODEL`, with `gpt-5-mini` as the default.
- OpenAI Responses API requests explicitly disable optional application-state storage with `store: false`.
- Socratic Draft hosted model calls fail closed unless
  `HOSTED_AI_ENABLED=true` and a non-empty OpenAI API key are configured; the
  wider site and API continue running when the product is disabled.
- Disabled, unconfigured, or unavailable hosted AI never falls back to fake
  product responses; the fake LLM client is retained only as a deterministic
  test adapter.
- Socratic Draft enforces a provider-neutral 32 KiB complete-input boundary over
  system instructions, retained history, and the new message, measured in UTF-8
  bytes before model invocation or persistence changes.
- Every Socratic Draft model request carries a required provisional 1,024-token
  output cap through the product model port and provider-neutral AI client to
  OpenAI `max_output_tokens`.
- Stable hosted-disabled, hosted-unavailable, and input-too-large failures retain
  conversation state, expiry metadata, and rejected editor text for recovery.
- Host-owned `LlmConversationModelAdapter` composition bridge in a generic API adapter module.
- Product-owned affirmative privacy acknowledgement before Socratic Draft editor controls become available in the current browser session.
- One temporary in-memory conversation per authenticated user using the demo editor, with a fixed visible 24-hour deadline, authenticated restoration, immediate clearing, and safe unavailable-conversation recovery.
- Temporary conversation responses expose their fixed deadline without extending it, and atomic turn retention prevents an expired conversation from reporting an unretained model response as successful.
- Structured conversation client failures distinguish unavailable temporary conversations from unrelated request failures.
- Public host `/privacy` page for shared platform processing, with registry-driven links to public product-owned privacy pages.
- Socratic Draft-owned privacy route and lifecycle note covering model processing, conversation retention boundaries, provider behavior, and user choices.
- Socratic Draft overview and acknowledgement links to its product-owned privacy information.
- API host wiring that supplies the OpenAI-backed adapter to the Socratic Draft product conversation port while keeping provider details out of the product package.
- Socratic Draft product-owned `ConversationStore` persistence port.
- Host/API-owned in-memory `ConversationStore` adapter for the conversation endpoint.
- Prisma schema and generated initial SQL migration for Socratic Draft conversations and conversation messages.
- Prisma schema and generated SQL migration for Better Auth users, sessions, accounts, and verifications.
- Prisma-backed Socratic Draft `ConversationStore` adapter in `packages/db`.
- Socratic Draft conversations are associated with the authenticated owner user and all persistent reads are owner-scoped.
- Persistent conversation appends are owner-scoped in the database operation itself and allocate message positions through an atomic per-conversation sequence.
- Signed-in non-owner conversations are isolated in temporary in-memory stores by authenticated user.
- Saved-conversation route changes reset editor state before loading the newly requested conversation.
- Socratic Draft conversation list and detail pages use thin loading orchestrators with focused components for list, item, and state presentation; loading, error, empty, populated, and restored states have rendering regression coverage.
- Owner-only conversation list/detail API routes with not-found behaviour for missing or inaccessible conversation IDs.
- Deterministic saved-conversation labels derived from the first user message and conversations ordered by latest conversation activity.
- Generated owner-association migration applied to the Neon `dev` branch after clearing disposable legacy Socratic Draft development records.
- DB-side Socratic Draft conversation-store resolver that uses Prisma for owner sessions when `DATABASE_URL` is set and uses user-isolated in-memory storage for signed-in non-owner sessions or no-DB local fallback.
- Strict Prisma migration workflow: schema first, generated migrations only, no hand-edited migration files.
- Neon Postgres development database setup with a `dev` branch and applied initial migration.
- Local development docs and `.env.example` for database environment setup.
- Root `pnpm test` command using Vitest.
- Initial `packages/auth` access-level helper.
- Initial `packages/ai` LLM interface and fake LLM client.
- Initial Prisma-backed `packages/db` database client and Socratic Draft repository adapter.
- Initial `packages/products` package boundary.
- Standard product package shape using `shared`, `server`, and `client` boundaries.
- Product dependency boundary: products define required contracts, hosts provide infrastructure adapters.
- `AGENTS.md` repo instructions for future agents.
- Repo-native code quality and testing guidelines.
- `docs/decisions.md` decision log.
- Socratic Draft product planning docs live in `docs/products/socratic-draft/`.
- Socratic Draft product architecture documents conceptually rich conversation,
  idea-map, draft, preference, and workspace-orchestration capability boundaries.
- Socratic Draft planning separates interaction-scoped discovery/articulation
  activity, assistant moves, action-specific readiness, explicit user intention,
  and resource-derived lifecycle; Task 027 owns the clean removal of the obsolete
  general conversation-phase contract.
- `tasks/README.md` task index.
- `tasks/001-scaffold-repo.md` scaffold/context task record.

## Partially implemented

- Product registry exists as a shared constant and is used by the static products page.
- `packages/ai` has an OpenAI adapter and a test-only fake client, but no streaming, provider routing, or usage tracking yet.
- The Socratic Draft conversation service is LLM-backed only when the hosted-AI kill switch and OpenAI configuration are present, but its conversation policy is intentionally minimal.
- Socratic Draft persistence is selected by operation semantics: the shared demo editor uses ephemeral application memory, while owner-only ID-addressed conversation operations use Prisma when `DATABASE_URL` is configured.

## Not implemented

- Public writing system.
- Individual writing pages.
- Browser-held demo writing mode; the current non-owner flow is ephemeral in API-process memory with best-effort restoration.
- Usage limits and cost protection.
- Draft creation and collaborative editing from a conversation.
- Idea-map presentation and user/assistant interpretation controls.
- Fluid discovery and articulation behaviour.
- Manual draft-edit interpretation and preference learning.
- Complete demo copy and export flow.
- Publishing flow from private drafts to public writing.
- Admin UI.

## Known gaps / risks

- The current homepage is an empty writing collection and should not be treated as the finished public writing system.
- The fake LLM client remains as a deterministic test adapter but is not used by API composition.
- The Socratic Draft conversation service is deliberately minimal and currently establishes the model boundary rather than final assistant behaviour.
- Product-owned ports for auth/access and usage have not been introduced yet; they should be added only when a product service genuinely needs those dependencies.
- The Neon dev database is configured locally through `.env.local`, but those secrets are intentionally not committed.
- The in-memory conversation adapter remains the no-DB local fallback and holds temporary user-isolated state for the life of the API process.
- The current Socratic Draft editor UI is product-owned and can restore owner conversations, but remains a minimal interface rather than the final Socratic Draft product experience.
- Demo writing persistence and temporary lifecycle rules are enforced across the client and API boundaries, but broader usage limits still need a later task.
- Auth exists as a minimal foundation, but production cookie/domain settings may need a deployment-specific pass later.
- Database and AI boundaries contain initial real implementation; usage and admin boundaries remain placeholders.
- Daily usage limits are not implemented yet; the kill switch and per-request
  bounds reduce immediate exposure but do not replace Task 034 cost protection.

## Next recommended task

Task 027 — Workspace and capability foundations.
