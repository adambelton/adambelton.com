# Decisions

## 001 — Single Personal-Site Repo

This repo is the single repo for Adam's personal website, public writing, product pages, product demos, shared API/server, auth, database, AI infrastructure, usage tracking, and admin.

The Socratic Draft is the first product inside this system, not the whole app.

## 002 — Final-Shaped Package Scaffold From Day One

The repo should include the intended long-term package boundaries from the beginning:

- `apps/client`
- `apps/api`
- `packages/shared`
- `packages/db`
- `packages/auth`
- `packages/ai`
- `packages/products`

Even if some packages are initially thin, implementation should happen in the correct place from the start.

`apps/web` was the original Next.js host and has been removed. `apps/client` is now the website host.

## 003 — Shared Types First

Types that cross package boundaries belong in `packages/shared`.

Do not create ad hoc duplicate types inside apps or feature folders.

## 004 — Product-Specific Logic Belongs in packages/products

The Socratic Draft conversation policy, prompts, moves, phases, readiness logic, thread handling, claim handling, and composition behaviour belong in `packages/products`.

## 005 — API Routes Stay Thin

`apps/api` should expose host routes and mount product API entrypoints, but domain behaviour and product-specific HTTP behaviour belong in packages.

Host apps may know which products are installed and where they are mounted. They should not own product-internal route trees, product request parsing, product response shape, or product business logic.

## 006 — Frontend Does Not Choose Socratic Draft Assistant Moves

For The Socratic Draft, the frontend should send ordinary user messages. The backend conversation service chooses the assistant move.

The frontend should not send explicit actions like `challenge`, `reflect`, or `create_draft` as the core interaction model.

## 007 — Demo Writing Is Ephemeral

Demo users may authenticate and use hosted AI within limits, but their writing/conversation content must not be persisted server-side.

Owner writing may be persisted.

## 008 — Published Writing Is Site-Level

Published writing belongs to the personal website's writing system.

The Socratic Draft persists conversations as the history of idea exploration. A conversation may later produce a mutable private `Draft` that the user and AI shape together. Publishing creates a site-level `WritingPost` from that draft; neither the private conversation nor the working draft is itself public writing.

Conversation messages remain the interaction history. Draft content is a separate future domain object so direct user edits and AI-requested revisions do not have to masquerade as conversation messages.

## 009 — Minimal Site Styling With Accessibility-First Primitives

The personal website should use a sparse, editorial visual style: clean text, images where appropriate, lots of space, restrained colour, and minimal interface chrome.

Styling should use Tailwind CSS and small owned components for the public site.

Do not add broad component libraries such as daisyUI, shadcn/ui, MUI, Chakra, Mantine, Ant Design, styled-components, or similar without explicit approval.

The shared website foundation should stay neutral. Product-specific visual languages, including The Socratic Draft's final UI direction, should be decided later in product-specific work.

Accessibility should be built in from the start.

For static public pages, prefer semantic HTML, correct heading structure, meaningful link text, deliberate alt text decisions, visible focus states, and keyboard-friendly markup.

For image-led pages, decide alt text by intent. Use descriptive alt text when an image communicates content. Use empty alt text only for purely decorative images. Do not leave alt text as an afterthought when adding images.

For complex interactive components, prefer React Aria Components rather than hand-rolling accessibility behaviour.

React Aria should be used only where there is real interaction, such as dialogs, menus, tabs, form controls, select/combobox patterns, popovers, or other components where focus management, keyboard behaviour, ARIA attributes, or screen reader behaviour are easy to get wrong.

Do not use React Aria for ordinary static content. Do not install React Aria speculatively.

## 010 — Root Page Is the Writing Collection

The root route `/` is the entry point for published writing.

It should behave as the writing collection, not as a marketing homepage. Links to products, about, and other static pages should be secondary navigation out of the writing collection.

## 011 — Repo Docs Are Canonical Project Rules

Project-level engineering rules should live in repo-owned, tool-agnostic docs.

`AGENTS.md`, `docs/code-quality.md`, `docs/testing.md`, `docs/decisions.md`, `progress.md`, and `tasks/` are the canonical project context for contributors and coding agents.

Tool-specific configuration may point back to these docs, but should not become the source of truth for project standards.

## 012 — Product Packages Own Product Source Of Truth

Each product under `packages/products/src/[product-slug]` is the source of truth for that product's domain model, contracts, server logic, reusable client code, and product-specific behaviour.

Product packages should be shaped for possible future extraction into standalone projects:

```txt
packages/products/src/[product-slug]/
  index.ts
  shared/
    index.ts
    types.ts
  server/
    index.ts
  client/
    index.ts
```

`shared/` contains product-owned contracts and domain types used by that product's server and client surfaces. `server/` contains server-safe product orchestration and domain logic. `client/` contains reusable browser/client code for that product.

`packages/shared` is reserved for platform-wide concerns such as generic API contracts, product registry types, writing types, user/access types, and usage types. Product-specific contracts should not live there unless they become genuinely platform-wide concepts.

Because each product folder already provides the product namespace, product-local type names should use direct domain names such as `ConversationRequest`, `ConversationResponse`, and `ConversationState` rather than repeating the product name.

TypeScript imports and re-exports must use repo-root absolute paths rather than relative paths or aliases, even within the same folder. This keeps imports consistent and easy to map to files. Import paths should start from top-level folders such as `apps/` or `packages/`, for example `packages/products/src/socratic-draft/server` or `apps/client/src/components/Prose`.

Top-level apps keep deployable names such as `apps/client` and `apps/api`. Product package internals use reusable runtime boundary names: `shared`, `server`, and `client`.

Lessons kept from the earlier Pinpoint Assignment prototype:

- Separate conversation orchestration from HTTP controllers.
- Keep start/welcome flows distinct from replying to user messages.
- Keep coverage/readiness assessment separate from conversation response generation.
- Keep profile, application, publishing, and composition generation separate from chat.
- Treat privacy boundaries as domain concerns, not just UI copy.

Trade-offs not to repeat:

- Do not couple prompt construction, LLM calls, persistence-loaded messages, and flow control into one large service.
- Do not make coverage/readiness synchronous by default when it harms perceived latency.
- Do not duplicate product API contracts in frontend-only types.
- Do not bury major product prompts inside hard-to-iterate service code long term.
- Do not let HTTP controllers assemble too much domain response shape.

## 013 — Product Packages Define Contracts, Hosts Provide Adapters

Product packages should be infrastructure-agnostic cores.

Each product owns:

- business rules
- product concepts and domain types
- required operations
- service behaviour
- product-owned ports/contracts for dependencies it genuinely needs

Host apps and host infrastructure packages own:

- AI provider setup
- auth/session systems
- database clients
- persistence implementation
- user/session scoping
- usage limits and cost controls
- deployment/runtime details

The product says, "this is the contract I require to function." The host takes responsibility for fulfilling that contract.

For persistence, products own the meaning of data and the operations they need. Hosts own the storage mechanism. A product can define operations such as `getConversationMessages`, `appendConversationTurn`, or `saveEntryState`; the host decides whether those operations are fulfilled with Postgres, SQLite, memory, files, browser storage, or another mechanism.

Products should not directly import concrete host infrastructure packages such as `packages/ai`, `packages/auth`, `packages/db`, or usage enforcement code. When a product needs one of those capabilities, it should define a product-owned port and receive an implementation from the host.

Avoid generic repositories and infrastructure-shaped ports. Product ports should use product language and expose product operations. If the product needs stronger guarantees, express those guarantees in business terms, such as `appendTurnAndSaveState`, rather than leaking database primitives such as `transaction`.

This follows the dependency injection / ports-and-adapters pattern while keeping the implementation lightweight. Introduce ports only when the product genuinely needs a dependency.

## 014 — Prisma Schema And Generated Migrations

The project uses Prisma for database schema, migrations, and host-owned database access.

The Prisma schema is the source of truth for intended database shape.

Generated migration files are committed artifacts. They must be reviewed, but never hand-edited.

Schema changes must follow this workflow:

- Propose the schema change before implementation.
- Edit the Prisma schema.
- Run Prisma schema validation.
- Generate the migration with Prisma tooling.
- Review the generated SQL without editing it.
- Run tests and typecheck.
- Commit schema changes and generated migrations together.

If generated SQL is wrong, change the Prisma schema or Prisma configuration and regenerate. Do not patch the migration SQL manually.

Committed migrations are immutable. Do not rewrite, regenerate, rename, reorder, or delete committed migrations unless the user explicitly approves a migration-history repair task.

Local database resets are allowed for local development only. They are not a substitute for fixing schema/migration drift.

The application should keep product packages independent of Prisma. `packages/db` and host apps may use Prisma to fulfill product-owned ports, but product packages must not import Prisma Client or database implementation details.

## 015 — Neon Development Database

The project uses Neon Postgres as the hosted development database.

Use Neon as a database host only. Do not enable Neon Auth unless a future approved task intentionally adopts it.

Use the Neon `production` branch as the future production branch and the Neon `dev` branch for shared development.

The local `.neon` file is Neon CLI-generated tool state and should remain gitignored. Do not commit a branch pointer such as `branchId`; branch selection is local workflow state.

Do not commit `.env.local` or any database connection string.

Commit `.env.example` with placeholders only.

Do not commit generated third-party Neon agent skill snapshots. Project policy and workflow decisions belong in repo-owned docs, and external Neon guidance should be fetched from current docs, the Neon CLI, or the Neon MCP server when needed.

## 016 — Host-Mounted Product Apps

Product packages own product client screens and product-relative route handling. Host apps own framework routing, layouts, redirects, `notFound` handling, auth/session gates, and deployment concerns.

For the client host, `apps/client` should expose a small React Router route mount for products and dispatch into product-owned route renderers. A product route such as `/products/socratic-draft/editor` is interpreted by the host as:

- host mount: `/products`
- product slug: `socratic-draft`
- product-owned route segments: `["editor"]`

The product package should not define Next.js file-system routes or import Next.js APIs. It may depend on React for reusable product client components, but its app surface should stay framework-light enough to be mounted by another host later.

Product route renderers should return neutral route results, such as `found` with a React element or `not_found`. The host translates those results into framework behaviour.

This keeps products extractable while still allowing the personal website to provide shared shell, auth, AI adapters, persistence adapters, and URL placement.

The same boundary applies to product API routes. `apps/api` may mount a product entrypoint such as `/products/socratic-draft`, but the product package owns the product-relative API route tree below that mount. The API host supplies product-neutral request context and adapters, such as signed-in/owner access state and conversation-store implementations.

## 017 — Owner Auth And Product Persistence

The project uses Better Auth for passwordless magic-link authentication, with auth state stored in the Prisma database.

Magic-link emails should be delivered through Resend in both development and production so authentication works the same way in each environment.

The initial authorization model is `isOwner` on the user record. It is derived server-side from `OWNER_EMAIL` and is not accepted from user input.

`isOwner` governs owner-only product persistence and future publishing capability. Product-specific roles or granular permission tables should wait until the product set actually needs them.

Signed-in non-owner users may access the Socratic Draft editor as ephemeral users while no real AI is connected. They should not get persistence access by default.

Socratic Draft conversations and future private working drafts belong to the Socratic Draft product app. Published writing belongs to the host website as a public-read writing system. Publishing is the bridge between a private draft and that public writing system and should be implemented separately.

Products remain auth-infrastructure agnostic. Product packages may define route access requirements in product terms, but host apps enforce those requirements using the host auth/session system.

For API routes, the host translates Better Auth session state into product-neutral access context before selecting persistence adapters. Product-facing adapter selectors should not import concrete auth systems.

## 018 — Client-First Host Architecture

The personal website host should migrate from a Next.js app toward a Vite and React Router client app through staged refactoring.

This is an architectural-fit decision, not a claim that Vite is inherently better than Next.js. The public website is lightweight, and the portfolio value of this repo depends on making frontend architecture, product mounting, auth state, API boundaries, and security posture explicit and inspectable.

The host website should demonstrate deliberate client application architecture while keeping product packages portable. Product packages remain the source of truth for product behaviour, contracts, client screens, and server entrypoints. Host apps remain responsible for mounting products and providing infrastructure such as auth, persistence adapters, AI providers, usage controls, deployment config, and publishing integration.

Client-side route gates are UX affordances only. They may hide product routes, redirect signed-out users, and present loading states, but they are not the security boundary.

API/server authorization is authoritative. Sensitive operations such as persistence, publishing, AI usage, health-tech actions, correction requests, acknowledgements, simulated provider updates, and owner-only views must be permission-checked server-side.

Future health-tech product work makes this explicit security posture more important, but it does not require building future-product behaviour now. Known roadmap context should inform architecture decisions without expanding the scope of current tasks.

Migration should happen in small stages:

- document the decision and security posture
- scaffold the client app alongside the current web app
- port shared website shell UI
- port auth UX and protected-route handling
- port product mounting
- remove the Next.js app only after the Vite client is functionally equivalent
- audit the migration against architecture, testing, accessibility, and security rules

The Next.js `apps/web` host was removed after the Vite client reached parity for the public shell, auth UX, and product mounting. `apps/client` is now the website host.

## 019 — Host-Owned Functional Navigation For Product Apps

Navigation mechanics are a host concern.

Product client surfaces should not import React Router, Next.js, or host-styled link components directly. The host should pass product apps a small functional navigation adapter that knows how to navigate in the current host environment.

In the Vite client host, that adapter preserves internal client-side navigation with React Router's `Link` while keeping external links as ordinary anchors.

Host UI may wrap the functional adapter with host styling, such as `TextLink`. Product UI may wrap the same functional adapter with product-owned styling. The host should not pass its design-system wrapper into a product app unless that is an intentional product integration decision.

## 020 — Host-Provided AI Through Product Conversation Ports

Product packages should not import OpenAI SDKs, provider configuration, API keys, or concrete AI infrastructure.

Socratic Draft owns the product-level conversation model contract it needs. The host API app wires that contract to `packages/ai`, which owns provider-specific adapters such as the OpenAI client.

The first real model integration uses the official OpenAI SDK through the Responses API. `OPENAI_API_KEY` supplies credentials and `OPENAI_MODEL` selects the model, defaulting to `gpt-5-mini`.

Tests should use fake product model adapters rather than live OpenAI calls.

The initial prompt should stay intentionally small: ask one useful question or offer one concise reflection, avoid rewriting the user's thought, and keep the response brief. More sophisticated Socratic Draft conversation policy should be added through later product-specific tasks.

## 021 — Conversation, Draft, And Writing Lifecycle

The Socratic Draft uses three distinct domain concepts:

- A `Conversation` is the inquiry between the user and the assistant. It owns ordered conversation messages and may exist before any writing artifact has been created.
- A `Draft` is private writing produced and collaboratively shaped from a conversation through user edits and AI-assisted edits.
- A `WritingPost` is host-owned public writing created or updated when the owner explicitly publishes a draft.

“Entry” is not used as a catch-all domain term because it obscures ownership and lifecycle boundaries.

Owner conversations use durable database persistence. Non-owner conversations remain temporary and are isolated by authenticated user in process memory until the privacy-hygiene task introduces explicit acknowledgement and lifecycle controls.

Persistent conversation messages use a per-conversation atomic sequence. The same owner-scoped database operation that creates or continues a conversation allocates the next pair of message positions. This prevents concurrent requests from deriving duplicate positions by counting existing messages and ensures the persistence adapter enforces ownership on writes as well as reads.

## 022 — Temporary Conversation Privacy Lifecycle

Each authenticated non-owner may have one current Socratic Draft conversation in application memory. It is isolated by authenticated user, uses an unguessable conversation identifier, and expires at a fixed deadline 24 hours after creation. Activity does not extend the deadline.

Temporary conversations are recoverable after reload or navigation only while the relevant application-process memory remains available. Process restarts, deployments, and multi-instance routing may remove them sooner and must fall back safely to an empty editor. This is intentional ephemeral behaviour, not durable continuity.

Non-owner users can explicitly clear their current conversation. Expiry is enforced during access and by scheduled content cleanup so a user does not need to return for their message content to be released.

Before editor controls are available in a browser session, the product requires an affirmative acknowledgement explaining application-memory retention, owner persistence, OpenAI processing, and the limits of confidentiality. OpenAI Responses API requests set `store: false`; this disables optional application-state storage but is not represented as enterprise Zero Data Retention or as eliminating provider abuse-monitoring retention.

Product-specific privacy explanations are product-owned routes and documentation. The host `/privacy` page covers shared platform processing, tells visitors that product privacy pages may exist, encourages review before using a demo, and discovers available notices through optional `privacyPath` product-registry metadata. It must not duplicate product lifecycle details. Product privacy routes may be public even when the product's interactive routes require authentication.

## 023 — Conversation Routes Define Persistence Semantics

Socratic Draft conversation persistence is selected by the operation and resource
being addressed, not solely by whether the authenticated user is the owner.

`/products/socratic-draft/editor` is the temporary demo editor for every
authenticated user, including the owner. It operates on that user's single
temporary application-memory conversation and does not expose the temporary
conversation identifier in the browser URL.

`/products/socratic-draft/conversations` is the owner-only persistent conversation
index. Creating a persistent conversation establishes its identity before editing
and navigates to `/products/socratic-draft/conversations/:id/editor`. An
ID-addressed persistent editor uses only the owner-scoped persistent store and
does not show temporary-demo lifecycle messaging.

The API enforces the same distinction. Temporary operations resolve only a
user-isolated temporary store, including for the owner, while persistent creation,
reads, and responses require owner access and an identified persistent
conversation. Client route gates remain usability affordances; server-side
authorization and store selection are authoritative.

## 024 — Shared Inquiry And Articulation Workspace

The Socratic Draft is a shared inquiry and articulation workspace built from
three connected representations: conversation history, an inspectable idea map,
and a user-owned private draft.

Discovery and articulation are fluid activities rather than exclusive modes or
rigid phases. Work may move between them whenever an attempt to express an idea
reveals something unresolved.

The user is authoritative about intended meaning and canonical draft content.
Direct user edits take effect immediately. Assistant draft changes remain
proposals until the user explicitly accepts them.

Assistant assessments and user assessments may coexist when they differ. The
assistant should expose its interpretation as negotiable rather than objective,
and disagreement may remain useful context instead of being silently overwritten.

Conversation and inquiry, idea mapping, drafting and revision, preference
learning, and workspace orchestration are distinct product capabilities. They
should communicate through narrow product-language operations. Implementation
should deliver end-to-end behaviours through those boundaries rather than create
either a monolithic workspace service or disconnected infrastructure layers.

## 025 — Activity, Move, Readiness, And Lifecycle Are Separate

The Socratic Draft does not use a general conversation phase as the source of
truth for intellectual progress.

Discovery and articulation classify the primary purpose of a particular
interaction or operation. They are not persistent workspace modes. An assistant
move describes the technique used in a particular assistant response. Activities
and moves have a many-to-many relationship, and an activity may occur without an
assistant move.

Do not introduce a separate activity-focus hierarchy. Specific acts such as
clarifying, reflecting, composing, and revising belong in assistant moves, user
commands, or resource operations.

Assistant readiness is action-specific and advisory. Explicit user intention is
separate and may proceed despite the assistant's assessment. Product lifecycle is
derived from real resources and publishing state rather than stored in a general
phase enum.

## 026 — Hosted AI Fails Closed Without Fake Product Responses

Socratic Draft model-backed actions require both `HOSTED_AI_ENABLED=true` and
valid provider configuration supplied by the API host. A missing flag, any other
flag value, or missing provider configuration disables those actions while
allowing unrelated website and API behaviour to continue. This is an explicit
operational kill switch independent of provider credentials.

The API composition must not silently replace disabled, unconfigured, or failed
hosted AI with a fake model. The fake LLM client remains a deterministic test
adapter only. Product-owned failure semantics distinguish disabled configuration,
oversized conversation input, and temporary provider unavailability.

Socratic Draft owns a provider-neutral 32 KiB complete-input boundary, measured
as UTF-8 bytes across system instructions, retained conversation history, and the
new user message. It also owns a required provisional 1,024-token output cap that
the host passes through the provider-neutral AI client to OpenAI. Later
action-specific limits may refine these values without moving the policy into the
provider adapter.
