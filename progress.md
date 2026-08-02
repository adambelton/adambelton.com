# Progress

## Current status

The monorepo has been scaffolded with the intended app/package structure. The first minimal Socratic Draft product-domain service, workspace orchestration boundary, API conversation endpoint, product-owned editor UI loop, inspectable idea-map baseline, owner-scoped Prisma persistence and saved-conversation flow, complete temporary demo lifecycle, hosted-AI immediate safety boundary, Neon dev database setup, host-mounted product app boundary, owner auth foundation, and LLM-backed product flow exist.

The repo currently has a Vite and React Router client host with the shared public website shell, auth UX, product mounting, and public privacy page, a minimal Tailwind styling foundation, static public routes, a basic Hono API shell, a working health route, shared platform contracts, an initial product registry, an extractable Socratic Draft product package shape, host-owned in-memory and Prisma-backed conversation adapters, product-owned Socratic Draft client and API route entrypoints, Better Auth magic-link auth with Prisma tables, a Neon `dev` database branch with committed migrations applied, an OpenAI-backed LLM adapter supplied by the API host, a pre-editor privacy acknowledgement, and a fixed temporary-conversation lifecycle for non-owner users. A post-migration codebase audit has been completed and accepted fixes have been applied.

The Socratic Draft product model has been refined before usage-limit work. The
product is now documented as a shared discovery and composition workspace with
conversation history, an inspectable idea map, and a user-owned draft. Conceptual
capability boundaries and a staged implementation plan now cover idea mapping,
meaningful discovery and composition readiness, approved draft revisions, manual-edit
interpretation, preference learning, a complete demo session, calibrated usage
protection, publishing, and admin visibility.

Task 030 has been completed. Its implementation preserves the intentional
boundary: discovery can recognise composition readiness and intention while Task
031 performs canonical draft creation.

The Socratic Draft now has a canonical terminology reference distinguishing
artifacts, activities, operations, assistant moves, readiness, intention,
commands, events, and lifecycle facts. In particular, a `Draft` is the writing,
composing is work performed on it, and `Composition` is the activity concerned
with that work.

The repository now has deterministic Playwright coverage for the Socratic Draft
discovery flow. It runs against dedicated product-owned test client/API hosts,
an in-memory product store, and a scripted conversation model without involving
the website/API hosts, authentication, Postgres, or OpenAI. GitHub Actions runs
the deterministic test, typecheck, build, and browser suite; an opt-in real-model
contract evaluation remains outside CI.

## Implemented

- Dedicated Socratic Draft Playwright testing hosts and a comprehensive discovery-session browser test covering coherent multi-idea exploration, enrichment, assessments, unresolved questions, every visible idea disposition action, user correction, focus transfer, request state, conversation ordering, and clearing without host infrastructure.
- Product-owned deterministic `TestConversationModel` for unit, integration, and browser scenarios.
- GitHub Actions validation for tests, typecheck, build, and Playwright Chromium.
- Opt-in hosted Socratic Draft contract and product-policy evaluation, excluded from CI.
- Socratic Draft client tests and hosted evaluations are colocated with the product; host and infrastructure packages retain only their mounting and adapter tests.

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
- Socratic Draft interaction contracts separate discovery/composition activity,
  assistant moves, action-specific assistant readiness, and explicit user
  intention without a general conversation-state or lifecycle aggregate.
- Socratic Draft discovery now selects a grounded assistant move rather than
  returning a fixed probe, assesses reflection and composition readiness
  independently, and recognises explicit explore, reflect, and compose intention.
- The provider-neutral conversation schema derives domain enum values from
  product-owned `as const` sources, with one explicit discovery-move subset shared
  by schema generation and semantic validation.
- Pre-draft activity remains server-derived discovery. An early composition
  request remains visible intention even when the assistant reports important
  uncertainty, and `offer_draft` does not claim that a draft already exists.
- Invalid move, readiness, or intention classifications degrade independently to
  safe discovery metadata without corrupting the idea map or exposing structured
  output as conversation text.
- Conversation model context combines the bounded idea-map view with the newest
  coherent retained conversation suffix that fits under the complete-input
  boundary; truncated context never begins with an orphaned assistant reply.
- Conversation steering remains natural language plus explicit idea controls.
  The product has no suggested-reply contract, move buttons, persistent mode
  selector, or readiness meter; important uncertainty is explained in the
  assistant's conversational response.
- Workspace orchestration loads conversation context, invokes the conversation
  capability, retains complete turns through the product-owned store operation,
  and reports retained-turn events only after successful persistence.
- The Socratic Draft idea-map baseline identifies and enriches stable ideas with
  concise titles, distilled syntheses, higher-resolution substance, unresolved
  questions, qualitative assistant exploration/importance assessments, parallel
  user interpretation, and user-controlled disposition.
- Idea-map policy currently permits twelve retained ideas, six active or focused
  ideas, and one focused idea; the limits are adjustable product policy rather
  than schema constraints and are marked for evidence-based review.
- The product supports active, focused, satisfied, parked, and dismissed ideas,
  with focus, satisfy, park, dismiss, reopen, and correction operations shared by
  direct UI actions and conversational interpretation.
- Conversation response and idea-map assessment use one structured model result.
  Valid responses degrade safely when proposed idea changes are invalid, and
  bounded model context prioritises focused/active substance without shrinking
  canonical retained substance.
- The product model port supplies a provider-neutral strict output schema, which
  the OpenAI Responses adapter enforces through Structured Outputs before the
  product applies its separate semantic validation.
- An opt-in, cost-gated hosted evaluation command exercises sustained synthetic
  idea exploration and reports content-free latency, token usage, output size,
  identity retention, and idea-map growth outside the deterministic test suite.
- Meaningful idea-map changes create whole-map revision snapshots. Optimistic
  revision checks reject stale conversational or direct UI mutations, while the
  editor pauses same-tab mutating controls during an in-flight operation. Stale
  direct actions return the authoritative map so the browser can refresh without
  discarding the user's attempted correction.
- Idea-map syntheses and full substance are inspectable in the expandable tracker;
  assistant assessments are presented qualitatively without percentages or
  colour-only meaning, and direct actions provide local acknowledgement without
  another hosted call.
- Canonical idea-map content is restricted to user-expressed or explicitly
  user-adopted material. Assistant hypotheses remain transient conversational
  reasoning, are not displayed in the tracker, and cannot silently enter titles,
  syntheses, substance, or unresolved questions.
- Temporary idea maps share the existing conversation expiry and clearing
  lifecycle. Owner idea-map revisions are stored in owner-scoped Prisma records
  through generated migrations and atomic host adapter operations; every
  revision records both its source type and the originating operation ID.
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
- Socratic Draft contracts separate interaction-scoped discovery/composition
  activity, assistant moves, action-specific readiness, explicit user intention,
  and resource-derived lifecycle; the obsolete general conversation-state and
  phase contract has been removed without a catch-all replacement.
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
  bounds reduce immediate exposure but do not replace Task 035 cost protection.
- Autonomous, user-correctable idea merging and splitting remains required before
  the editor is considered fully functional.
- Idea-count limits and idea-action acknowledgement UX should be reassessed after
  sustained complete-product and browser use; any future analytics must remain
  content-free and privacy-reviewed.

## Next recommended task

Task 031 — Private drafts and approved revision proposals.
