# Decisions

## 001 — Single Personal-Site Repo

This repo is the single repo for Adam's personal website, public writing, product pages, product demos, shared API/server, auth, database, AI infrastructure, usage tracking, and admin.

The Socratic Draft is the first product inside this system, not the whole app.

## 002 — Final-Shaped Package Scaffold From Day One

The repo should include the intended long-term package boundaries from the beginning:

- `apps/web`
- `apps/api`
- `packages/shared`
- `packages/db`
- `packages/auth`
- `packages/ai`
- `packages/products`

Even if some packages are initially thin, implementation should happen in the correct place from the start.

## 003 — Shared Types First

Types that cross package boundaries belong in `packages/shared`.

Do not create ad hoc duplicate types inside apps or feature folders.

## 004 — Product-Specific Logic Belongs in packages/products

The Socratic Draft conversation policy, prompts, moves, phases, readiness logic, thread handling, claim handling, and composition behaviour belong in `packages/products`.

## 005 — API Routes Stay Thin

`apps/api` should expose routes and controllers, but domain behaviour belongs in packages.

## 006 — Frontend Does Not Choose Socratic Draft Assistant Moves

For The Socratic Draft, the frontend should send ordinary user messages. The backend conversation service chooses the assistant move.

The frontend should not send explicit actions like `challenge`, `reflect`, or `compose_private` as the core interaction model.

## 007 — Demo Writing Is Ephemeral

Demo users may authenticate and use hosted AI within limits, but their writing/conversation content must not be persisted server-side.

Owner writing may be persisted.

## 008 — Published Writing Is Site-Level

Published writing belongs to the personal website's writing system.

The Socratic Draft can create private entries and later publish into the site-wide writing system, but public writing should not be tightly coupled to one product.

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

TypeScript imports and re-exports must use repo-root absolute paths rather than relative paths or aliases, even within the same folder. This keeps imports consistent and easy to map to files. Import paths should start from top-level folders such as `apps/` or `packages/`, for example `packages/products/src/socratic-draft/server` or `apps/web/components/site/Prose`.

Top-level apps keep deployable names such as `apps/web` and `apps/api`. Product package internals use reusable runtime boundary names: `shared`, `server`, and `client`.

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
