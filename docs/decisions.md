# Decisions

## 001 — Single Personal-Site Repo

This repo is the single repo for Adam's personal website, public writing, product pages, product demos, shared API/server, auth, database, AI infrastructure, usage tracking, and admin.

ThoughtForm is the first product inside this system, not the whole app.

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

ThoughtForm conversation policy, prompts, activity, moves, readiness logic, thread handling, claim handling, and composition behaviour belong in `packages/products`.

## 005 — API Routes Stay Thin

`apps/api` should expose host routes and mount product API entrypoints, but domain behaviour and product-specific HTTP behaviour belong in packages.

Host apps may know which products are installed and where they are mounted. They should not own product-internal route trees, product request parsing, product response shape, or product business logic.

## 006 — Frontend Does Not Choose ThoughtForm Assistant Moves

For ThoughtForm, the frontend should send ordinary user messages. The backend conversation service chooses the assistant move.

The frontend should not send explicit actions like `challenge`, `reflect`, or `create_draft` as the core interaction model.

## 007 — Demo Writing Is Ephemeral

Demo users may authenticate and use hosted AI within limits, but their writing/conversation content must not be persisted server-side.

Owner writing may be persisted.

## 008 — Published Writing Is Site-Level

Published writing belongs to the personal website's writing system.

ThoughtForm persists conversations as the history of idea exploration. A conversation may later produce a mutable private `Draft` that the user and AI shape together. Publishing creates a site-level `WritingPost` from that draft; neither the private conversation nor the working draft is itself public writing.

Conversation messages remain the interaction history. Draft content is a separate future domain object so direct user edits and AI-requested revisions do not have to masquerade as conversation messages.

## 009 — Minimal Site Styling With Accessibility-First Primitives

The personal website should use a sparse, editorial visual style: clean text, images where appropriate, lots of space, restrained colour, and minimal interface chrome.

Styling should use Tailwind CSS and small owned components for the public site.

Do not add broad component libraries such as daisyUI, shadcn/ui, MUI, Chakra, Mantine, Ant Design, styled-components, or similar without explicit approval.

The shared website foundation should stay neutral. Product-specific visual languages, including ThoughtForm's final UI direction, should be decided later in product-specific work.

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

TypeScript imports and re-exports must use repo-root absolute paths rather than relative paths or aliases, even within the same folder. This keeps imports consistent and easy to map to files. Import paths should start from top-level folders such as `apps/` or `packages/`, for example `packages/products/src/thoughtform/server/capabilities/conversation` or `apps/client/src/ui/components/Prose`.

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

For the client host, `apps/client` should expose a small React Router route mount for products and dispatch into product-owned route renderers. A product route such as `/products/thoughtform/editor` is interpreted by the host as:

- host mount: `/products`
- product slug: `thoughtform`
- product-owned route segments: `["editor"]`

The product package should not define Next.js file-system routes or import Next.js APIs. It may depend on React for reusable product client components, but its app surface should stay framework-light enough to be mounted by another host later.

Product route renderers should return neutral route results, such as `found` with a React element or `not_found`. The host translates those results into framework behaviour.

This keeps products extractable while still allowing the personal website to provide shared shell, auth, AI adapters, persistence adapters, and URL placement.

The same boundary applies to product API routes. `apps/api` may mount a product entrypoint such as `/products/thoughtform`, but the product package owns the product-relative API route tree below that mount. The API host supplies product-neutral request context and adapters, such as signed-in/owner access state and conversation-store implementations.

## 017 — Owner Auth And Product Persistence

The project uses Better Auth for passwordless magic-link authentication, with auth state stored in the Prisma database.

Magic-link emails should be delivered through Resend in both development and production so authentication works the same way in each environment.

The initial authorization model is `isOwner` on the user record. It is derived server-side from `OWNER_EMAIL` and is not accepted from user input.

`isOwner` governs owner-only product persistence and future publishing capability. Product-specific roles or granular permission tables should wait until the product set actually needs them.

Signed-in non-owner users may access the ThoughtForm editor as ephemeral users while no real AI is connected. They should not get persistence access by default.

ThoughtForm conversations and future private working drafts belong to the ThoughtForm product app. Published writing belongs to the host website as a public-read writing system. Publishing is the bridge between a private draft and that public writing system and should be implemented separately.

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

ThoughtForm owns the product-level conversation model contract it needs. The host API app wires that contract to `packages/ai`, which owns provider-specific adapters such as the OpenAI client.

The first real model integration uses the official OpenAI SDK through the Responses API. `OPENAI_API_KEY` supplies credentials and `OPENAI_MODEL` selects the model, defaulting to `gpt-5-mini`.

Tests should use fake product model adapters rather than live OpenAI calls.

The initial prompt should stay intentionally small: ask one useful question or offer one concise reflection, avoid rewriting the user's thought, and keep the response brief. More sophisticated ThoughtForm conversation policy should be added through later product-specific tasks.

## 021 — Conversation, Draft, And Writing Lifecycle

ThoughtForm uses three distinct domain concepts:

- A `Conversation` is the inquiry between the user and the assistant. It owns ordered conversation messages and may exist before any writing artifact has been created.
- A `Draft` is private writing produced and collaboratively shaped from a conversation through user edits and AI-assisted edits.
- A `WritingPost` is host-owned public writing created or updated when the owner explicitly publishes a draft.

“Entry” is not used as a catch-all domain term because it obscures ownership and lifecycle boundaries.

Owner conversations use durable database persistence. Non-owner conversations remain temporary and are isolated by authenticated user in process memory until the privacy-hygiene task introduces explicit acknowledgement and lifecycle controls.

Persistent conversation messages use a per-conversation atomic sequence. The same owner-scoped database operation that creates or continues a conversation allocates the next pair of message positions. This prevents concurrent requests from deriving duplicate positions by counting existing messages and ensures the persistence adapter enforces ownership on writes as well as reads.

## 022 — Temporary Conversation Privacy Lifecycle

Each authenticated non-owner may have one current ThoughtForm conversation in application memory. It is isolated by authenticated user, uses an unguessable conversation identifier, and expires at a fixed deadline 24 hours after creation. Activity does not extend the deadline.

Temporary conversations are recoverable after reload or navigation only while the relevant application-process memory remains available. Process restarts, deployments, and multi-instance routing may remove them sooner and must fall back safely to an empty editor. This is intentional ephemeral behaviour, not durable continuity.

Non-owner users can explicitly clear their current conversation. Expiry is enforced during access and by scheduled content cleanup so a user does not need to return for their message content to be released.

Before editor controls are available in a browser session, the product requires an affirmative acknowledgement explaining application-memory retention, owner persistence, OpenAI processing, and the limits of confidentiality. OpenAI Responses API requests set `store: false`; this disables optional application-state storage but is not represented as enterprise Zero Data Retention or as eliminating provider abuse-monitoring retention.

Product-specific privacy explanations are product-owned routes and documentation. The host `/privacy` page covers shared platform processing, tells visitors that product privacy pages may exist, encourages review before using a demo, and discovers available notices through optional `privacyPath` product-registry metadata. It must not duplicate product lifecycle details. Product privacy routes may be public even when the product's interactive routes require authentication.

## 023 — Conversation Routes Define Persistence Semantics

ThoughtForm conversation persistence is selected by the operation and resource
being addressed, not solely by whether the authenticated user is the owner.

`/products/thoughtform/editor` is the temporary demo editor for every
authenticated user, including the owner. It operates on that user's single
temporary application-memory conversation and does not expose the temporary
conversation identifier in the browser URL.

`/products/thoughtform/conversations` is the owner-only persistent conversation
index. Creating a persistent conversation establishes its identity before editing
and navigates to `/products/thoughtform/conversations/:id/editor`. An
ID-addressed persistent editor uses only the owner-scoped persistent store and
does not show temporary-demo lifecycle messaging.

The API enforces the same distinction. Temporary operations resolve only a
user-isolated temporary store, including for the owner, while persistent creation,
reads, and responses require owner access and an identified persistent
conversation. Client route gates remain usability affordances; server-side
authorization and store selection are authoritative.

## 024 — Shared Inquiry And Articulation Workspace

ThoughtForm is a shared inquiry and articulation workspace built from
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

ThoughtForm does not use a general conversation phase as the source of
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

ThoughtForm model-backed actions require both `HOSTED_AI_ENABLED=true` and
valid provider configuration supplied by the API host. A missing flag, any other
flag value, or missing provider configuration disables those actions while
allowing unrelated website and API behaviour to continue. This is an explicit
operational kill switch independent of provider credentials.

The API composition must not silently replace disabled, unconfigured, or failed
hosted AI with a fake model. The fake LLM client remains a deterministic test
adapter only. Product-owned failure semantics distinguish disabled configuration,
oversized conversation input, and temporary provider unavailability.

ThoughtForm owns a provider-neutral 32 KiB complete-input boundary, measured
as UTF-8 bytes across system instructions, retained conversation history, and the
new user message. It also owns a required provisional 1,024-token output cap that
the host passes through the provider-neutral AI client to OpenAI. Later
action-specific limits may refine these values without moving the policy into the
provider adapter.

## 027 — Workspace Contracts Replace General Conversation State

The obsolete `ConversationState` aggregate is removed rather than renamed or
reshaped. Interaction purpose is represented by discovery or articulation
activity, assistant technique by a move, assistant judgment by action-specific
readiness, and explicit user direction by a separate intention. No field among
them acts as a stored workspace phase or general measure of intellectual
progress.

Conversation responses expose only interaction-scoped metadata that the current
behaviour can state truthfully. The current discovery response has no readiness
assessment and no explicit user intention; later behaviours add those values
only when they perform the corresponding interpretation.

Workspace orchestration coordinates capability operations without owning their
rules. At the current baseline it loads conversation history, invokes the
conversation capability, retains the complete turn through a product-language
store operation, and reports a `conversation_turn_retained` event only after the
write succeeds. Capability-specific resources and additional events are added by
the observable slices that exercise them. Resource existence remains the source
of lifecycle meaning.

## 028 — Idea Maps Preserve Synthesis And Substance

An idea has a stable product-generated identity, a concise title, a distilled
synthesis for ordinary inspection, and higher-resolution substance containing
the lightly curated material uncovered through exploration. Substance may grow
to several paragraphs and contain substantially more than a later draft uses.
Sustained inquiry should enrich an existing idea rather than turn every facet
into another shallow identity.

The idea map records material expressed by the user or assistant language the
user has explicitly adopted, confirmed, corrected, or meaningfully developed.
Titles, syntheses, substance, and unresolved questions present that material in
the user's own first-person perspective. They must not describe the user from an
assistant or analyst perspective, quote the user as evidence, or expose how the
workspace produced the material.
Assistant-generated hypotheses may guide a transient conversational move, but
they are not canonical idea material and must not silently enter titles,
syntheses, substance, unresolved questions, or the editor UI. Qualitative
exploration and contextual-importance assessments remain visible without a
persisted prose interpretation. Unresolved questions must be grounded in
user-expressed tensions and must not introduce premature audience, genre, tone,
evidence, or structural decisions during discovery.

The initial product-policy limits are twelve retained ideas, six active or
focused ideas, and one focused idea. These values are adjustable, are not schema
constraints, and must be reassessed after sustained complete-product use.
Content-free product analytics may support a later review but must never include
private idea or conversation content.

Exploration uses emerging, developing, and well explored. Contextual importance
uses background, supporting, and central. Baseline dispositions are active,
focused, satisfied, parked, and dismissed. Satisfaction records that the user
considers an idea developed enough for its current purpose and may differ from
the assistant's exploration assessment.

Conversation response generation and idea-map assessment begin as one structured
model operation using bounded current map context, with response and proposed
map changes validated independently. Meaningful map changes create monotonic
whole-map revisions linked to their originating successful operation or turn.
The product conversation-model port supplies a provider-neutral strict output
schema. Host AI adapters translate that schema into their provider's structured
output mechanism, while product validation still enforces semantic rules such as
canonical idea identity and explicit user authority for disposition actions.
Mutations use optimistic revision checks, and stale work must not silently merge,
overwrite newer state, or trigger an automatic model retry.

Autonomous merge and split behaviour remains out of the baseline but is required
before the editor is considered fully functional. Real-time multi-user
collaboration remains a future direction; transport such as WebSockets would not
replace revisions, conflict handling, permissions, attribution, or collaborative
editing semantics.

## 029 — Discovery And Composition Are The Product Activities

ThoughtForm uses discovery and composition as its two interaction-scoped
activities. This supersedes the articulation terminology in Decisions 024, 025,
and 027 without changing their separation of activity, move, readiness,
intention, and resource-derived lifecycle.

Discovery finds out what the user thinks. It includes reflection, paraphrasing,
clarifying expression, and finding language for meaning before a draft exists.
Those acts do not become a separate pre-draft writing activity.

Composition creates and continually develops the canonical draft from selected
ideas. A direct composition request or accepted composition offer creates the
first draft and begins composition. Once a draft exists, composition may expose
an unresolved idea and return the work to discovery; later discovery may inform
further composition.

The standalone `articulate` user intention is removed. Concrete intentions and
operations such as explore, reflect, compose, structure, and revise describe what
the user asks to do without introducing a persistent workspace mode.

## 030 — Proposal Reviews Preserve Approval Reasoning

Task proposal reviews classify findings as blockers, clarifications,
implementation decisions, or previously settled decisions. Reviews follow the
authority order recorded in `AGENTS.md` and must not reopen an intentional,
approved boundary without citing a conflicting higher-authority rule or genuinely
new evidence and explaining why implementation cannot resolve it.

Approved proposals retain a concise approval record containing the approval date,
intentional boundaries, important deferrals, delegated implementation decisions,
and decisions that should not be reopened casually. The record preserves why a
task was approved across conversations without changing its scope or granting
approval for later work.

## 031 — Suggested Replies Are Deferred, Not A Current Contract

ThoughtForm does not currently expose or retain a suggested-reply
contract. Free conversation and explicit idea controls are sufficient for the
current baseline, and assistant-proposed answers risk making assistant language
look like the user's own discovered material.

Suggested replies may be reconsidered only if observed use shows that people need
more help steering the conversation. Any future version must be limited to
direction, selection, confirmation, or authorisation. It must never suggest
substantive answers, feelings, claims, interpretations, examples, or language
that could enter the idea map as apparently user-authored material.

## 032 — Discovery Policy Uses Validated Interaction Metadata

Pre-draft conversation activity is derived by the product server as discovery.
The conversation model selects one discovery move and returns separate readiness
assessments for reflection and composing a draft, plus any explicit explore,
reflect, or compose intention expressed by the user. `offer_draft` names the move
that offers the future draft artifact; it does not emit composition activity or
create that artifact.

Reflection and composition readiness use qualitative, action-specific values.
`ready_with_uncertainty` requires a concise grounded explanation. An explicit
request for an early or rough draft remains user intention even when the
assistant assesses composition as not ready or ready with uncertainty.

Conversation response, move, readiness, intention, and idea-map proposals share
one provider-neutral structured model result for the current baseline. Product
validation treats their fields independently: an invalid classification degrades
to safe discovery metadata without applying unsafe state or exposing structured
output as conversation text.

Model context includes the bounded idea-map view and the newest coherent suffix
of retained conversation that fits with the current message under the existing
complete-input limit. Truncation never starts with an orphaned assistant reply.
The UI continues to use ordinary user messages and explicit idea controls; it
does not add move buttons, a mode selector, a readiness meter, or suggested
replies. Important readiness uncertainty is explained conversationally.

## 033 — ThoughtForm Terminology Has A Canonical Reference

`docs/products/thoughtform/terminology.md` is the canonical naming reference
for ThoughtForm code, prompts, tasks, interface copy, and documentation. It
clarifies the concepts defined by the product brief and architecture rather than
introducing a separate product model.

In particular, `Draft` names the private writing artifact, *compose* and
*composing* describe operations that create or develop it, and `Composition`
names the activity whose purpose is working on the writing. Assistant moves name
concrete acts or their objects, so the preferred names remain `offer_draft`,
`create_draft`, and `revise_draft`. Contributors must identify whether a new term
names an artifact, activity, operation, move, assessment, intention, command,
event, or lifecycle fact before adding it.

## 034 — Product Browser Tests Use Dedicated Testing Hosts

ThoughtForm Playwright tests compose the product's real client, HTTP route,
conversation service, and persistence port inside dedicated test-only client and
API hosts owned by the product package. The composition supplies a deterministic
test conversation model and an in-memory product-language store. It does not
start or import the website/API hosts and therefore does not exercise host auth,
database, provider, or deployment concerns.

CI runs deterministic unit, integration, type, build, and browser checks. A
separate opt-in hosted-model evaluation checks the real provider contract and
selected product-policy behaviour, but remains outside CI because it requires a
secret, incurs cost, and is not deterministic.

## 035 — Product Tests Are Colocated With Product Behaviour

Tests, fixtures, browser hosts, and evaluations whose subject is ThoughtForm
product behaviour live within `packages/products/src/thoughtform`. Component
and page tests sit beside the product client source they exercise; cross-boundary
test composition and hosted evaluations live in the product's `testing` folder.

Host applications retain only tests of host mounting, routing, configuration,
and supplied adapters. Infrastructure packages retain tests of their own
concrete product adapters. A product-owned evaluation may compose a concrete AI
provider as a test-only development fixture without adding that provider to the
product's production dependency boundary.

## 036 — GitHub Mutations Use The Authenticated CLI

Repository workflows use local `git` for branches, staging, commits, and pushes,
and authenticated `gh` commands for GitHub mutations and Actions operations.
This includes pull-request creation and merging, check monitoring, and workflow
log inspection. The GitHub connector is optional read-only context and is not
attempted first for write operations.

The current ChatGPT Codex Connector appears only as an authorized GitHub App and
provides no repository-installation permission controls. Its pull-request create
and merge operations return `403 Resource not accessible by integration`, while
the authenticated CLI succeeds. This workflow avoids a known failing operation
and should be reconsidered only if the connector's repository-write capability
is explicitly reconfigured and verified.

## 037 — Draft Changes Use Persisted Linear Revision History

ThoughtForm retains one continuous canonical draft per workspace and an
append-only sequence of complete revision snapshots. Initial composition,
changed manual saves, accepted assistant proposals, and restoration of an older
snapshot all create new monotonically numbered revisions. Restoration never
deletes intervening history or moves the revision number backward.

Revision history is server-owned product state: it shares the temporary
in-memory lifetime of a demo workspace and is durably owner-scoped for owner
workspaces. The client keeps only running app state and does not persist private
writing or revision history in cookies, `localStorage`, or IndexedDB. Complete
snapshots favour reliable comparison and restoration for the baseline; diffs are
derived presentation data rather than the persistence primitive.

The draft remains a single document rather than a collection of paragraph
entities. A user may attach one contiguous passage to conversation as explicit
context, and the assistant may discuss it or create a reviewable passage or
whole-draft proposal. An unaccepted proposal is never a draft revision.
Acceptance applies the exact reviewed content without regeneration and records a
new revision atomically.

The revision-history interface previews and compares retained snapshots and
restores one only through an explicit action that creates another revision.
Named versions, branching, merging, arbitrary revision deletion, collaborative
editing, and final product visual design remain outside the approved baseline.

## 038 — Product-Owned Persistence Ports Preserve Extractability

ThoughtForm defines its persistence contracts, persistence-facing snapshots,
commands, results, and every domain transition inside the product package. A
host adapter may depend on those definitions to implement them, but it must not
define a parallel ThoughtForm record model or decide product behaviour.

The product-owned conversation and draft stores are each implemented once over
injected persistence ports. Conversation retention and idea-map replacement,
proposal application, staleness, restoration, revision construction, and
lifecycle transitions therefore remain identical for durable owner work,
temporary owner work, and deterministic tests. Concrete adapters provide only
storage mechanics such as scoping, serialization, conditional writes,
transactions, idempotency, expiration, and deletion.

The Prisma implementation belongs in `packages/db` because that package owns
the host schema, migrations, database client, and transaction mechanics. It
implements product-owned types directly and keeps generated Prisma row types
private. The process-local demo implementation belongs to the API host, while a
deterministic implementation remains in product testing support.

Extractability is the boundary test: ThoughtForm must be movable to an
external package without taking host or database implementation code with it.
Another host can supply different persistence, AI, access, usage, navigation,
and deployment adapters without recreating product behaviour. Product code must
not import the API host, database, auth, or AI infrastructure packages.

## 039 — Ordinary Conversation Remains Writing-Oriented

Within ThoughtForm, an ordinary statement is treated as material the
user may want to understand and develop through writing. It is not an implicit
request for practical advice, diagnosis, coaching, or problem-solving. The
assistant may provide practical advice when the user explicitly asks for it,
but must otherwise explore the meaning, tension, perspective, or language in
what the user has shared.

Assistant-generated possibilities remain transient hypotheses. Suggestions,
possible solutions, inferred concerns, and questions introduced only by the
assistant do not become canonical idea-map synthesis, substance, or unresolved
questions unless the user later adopts, confirms, corrects, or meaningfully
develops them. Prompt policy is backed by a hosted behavioural regression
scenario because structured output alone cannot prove semantic provenance.

Draft composition receives only user-facing writing material: an idea's title,
synthesis, substance, and grounded unresolved questions. Assistant assessment,
disposition, user-interpretation workflow state, provenance, and workspace
instructions remain useful product state but are not composition source
material. A composed draft is continuous user-authored writing, not an
assistant's report about the user or a rendering of idea-map field labels.

## 040 — Hosts Render Product-Owned Breadcrumb Metadata

Breadcrumbs are part of host navigation and presentation. Website routes render
the host-owned breadcrumb component directly. A mounted product instead returns
portable breadcrumb labels and ancestor URLs with its route result; the host
renders that metadata using the same component.

This keeps product route hierarchy and language under product ownership without
making product code depend on host UI. Ancestors are links, the current page is
plain text marked with `aria-current="page"`, private resource identifiers are
not displayed, and each rendered page has one breadcrumb landmark above its
main heading.

## 041 — Repository Paths Express Ownership And Architectural Role

Repository source is organised by ownership boundary first, architectural role
second, business or product capability third, and single file responsibility
last. Apps are deployable hosts; packages are reusable owners. Product servers
separate capability rules, cross-capability application operations, and inbound
delivery. External requirements are product-owned ports, while their concrete
implementations are host or infrastructure adapters.

This order makes paths usable as diagnostic maps. It keeps stable product
meaning independent from changing mechanisms, prevents coordination layers from
absorbing capability rules, directs dependencies toward owned contracts, and
introduces abstractions only when real implemented responsibilities justify
them.

The vocabulary and implemented trees in the repository and product READMEs are
architectural rules, not illustrative suggestions. The root README explains
the repository as a whole; each product README owns its detailed internal tree,
flow, integration boundary, and diagnostic map so the product remains
understandable when developed independently of a host. Production code cannot
import test support. Colocated tests protect neighbouring behaviour; reusable
fakes, fixtures, browser journeys, and hosted evaluations have explicit
distinct locations. Empty speculative scaffolds and undifferentiated helper,
utility, or service directories are not permitted.

Product registry definitions belong to `packages/products`; only platform-wide
registry types belong to `packages/shared`. Repository-wide dependency tests
enforce the allowed ownership graph so later work cannot silently erode these
boundaries.

## 042 — Draft Format Is Optional Drafting State

ThoughtForm owns an optional, user-extensible free-text Draft Format inside
`DraftingState`. Drafting state may exist before the Draft artifact; setting a
format does not create empty draft content or begin Composition. Absence means
free-form writing rather than a persisted `free-form` mode.

Format mutations use their own revision and the drafting operation ledger for
stale-write protection and idempotency. Temporary adapters retain the value for
the API-process workspace lifetime, while the Prisma adapter stores it on the
owner-scoped conversation without requiring a Draft row.

The interface truthfully presents format as saved but not yet used by the
assistant. Conversation, composition, revision, and publishing inputs remain
unchanged; defining format semantics or downstream behaviour requires a later
explicit product decision.

## 043 — The Canonical Draft Remains Normalized Plain Text

The private Draft remains normalized plain text. ThoughtForm helps the user
discover, organise, test, and develop the substance of their thinking; it does
not own document headings, emphasis, lists, quotations, links, code, images, or
publishing presentation.

A constrained semantic Markdown editor was investigated and prototyped. Although
technically feasible, it duplicated part of the mature document editor or
publishing tool the writer would still need, while substantially expanding
selection, proposal, revision comparison, normalization, migration, paste,
accessibility, and export responsibilities. Plain text remains an honest and
accessible representation when presented as plain text rather than simulated
document structure.

Document formatting remains a destination concern. This does not require the
owner to adopt a CMS and does not prevent a later export adapter, but export must
not redefine the canonical Draft without a new product decision supported by
observed need. The investigation is recorded in
`docs/products/thoughtform/semantic-editor-investigation.md`.

## 044 — Saved Draft Changes Receive Revision-Validated Provisional Interpretation

Obvious textual maintenance is suppressed by a deliberately narrow deterministic
classifier. Every other exact, current `DraftChange` is classified and answered
in one bounded model request through a drafting-owned port. The API host supplies
the provider adapter; product classification, interpretation, conflict, and
reconciliation rules remain inside ThoughtForm.

Canonical draft persistence completes and returns before interpretation starts.
The automatic follow-up revalidates the revision-bounded change, so latency or
failure cannot block, roll back, or misreport a successful save. A later revision
invalidates the old operation and its client recovery attachment.

An automatic response is retained as one assistant message without a fabricated
user utterance. It remains provisional. Failure attaches the exact current
change to the ordinary composer; no separate pending-interpretation record is
persisted.

The Idea Map may retain minimal potential conflicts within one idea, between
ideas, or between established substance and a saved edit. These are known
uncertainties rather than open questions. Ordinary conversation removes them
only after user-established refinement, contextual distinction, position
choice, idea separation, integrated intentional tension, or dismissal. Richer
latest user language is retained in ordinary idea substance; Draft Format and
preference learning remain outside this behaviour.

## 045 — ThoughtForm Is A Conversational Thinking Workspace

ThoughtForm helps a person explore, organise, and express what they think
or feel about a subject. Conversation and the Idea Map support Discovery and may
remain valuable without any Draft. When useful, Composition creates or develops
an optional private Draft containing the user's first-person articulation of
their current understanding.

Articulation describes the product outcome and characteristic recognition value:
the user can inspect the whole expression and judge, “Yes, that is what I think
or feel.” It is not a third formal activity, command, lifecycle phase, completion
state, or objective claim that the user's understanding is final. `Draft`,
compose, and `Composition` remain accurate artifact, operation, and internal
activity terms. Product-facing language may say “put this into words” or “bring
this together.”

Creating a Draft is optional. A conversation-only or conversation-plus-Idea-Map
workspace is valid product use and must not be presented as failure,
incompletion, or a reason the user must continue. Any Draft is canonical private
plain text written as the user's first-person expression, not an assistant report,
diagnosis, or authoritative explanation of the user. It may preserve uncertainty,
mixed feelings, contradiction, missing information, and provisional conclusions.

Draft Format is removed from the canonical product model and its existing
implementation will be deleted through a separate approved migration task. It
must not be hidden indefinitely, renamed, or converted into preference state.
Preference learning, inferred profiles, product-owned export, and product
publishing are not planned capabilities. Potential future guidance must earn its
own approval and, at minimum, be explicit, inspectable, correctable, narrowly
scoped, and subordinate to the current instruction.

Public writing remains a later host-website concern after ThoughtForm v1 is
ready for release. The intended owner workflow begins with manual copy/paste into
locally prepared Markdown, followed by a host-owned static-content pipeline. No
ThoughtForm publishing bridge is planned.

The product remains an owner-used portfolio demo rather than a commercial or
mental-health product. It may support sensitive reflection and offer personal
clarity or catharsis, but it is not a therapist, diagnostic tool, clinical
intervention, crisis service, or source of mental-health efficacy claims. Its
primary validation is sustained usefulness to the owner in production; automated
and hosted evaluations establish engineering and policy evidence only.

This decision supersedes the earlier writing-tool framing in the canonical
product documents, the product-publishing bridge portions of Decisions 008, 021,
and 023, the formal
articulation prohibition in Decision 029 only to the extent that articulation is
now the product outcome rather than an activity, the Draft Format direction in
Decision 042, and the possible product export direction in Decision 043. It does
not change the host ownership of any later public-writing system, the separation
of Discovery and Composition activities, user authority, revision safety,
privacy, or product extractability.

## 046 — Draft Format Is Removed Completely

Draft Format, its independent revision, mutation operation, HTTP route, client
controls, temporary state, durable adapter fields, and database columns are
removed rather than hidden or converted into another guidance concept.

`DraftingState` now contains only the optional canonical Draft, immutable
revisions, and the active revision proposal. Draft operations use Draft and
proposal revisions for optimistic concurrency; there is no pre-Draft format
revision acting as a general drafting-state lock. Concurrent first composition
remains protected by the unique one-Draft-per-conversation database relationship,
operation idempotency, and transactional conflict mapping.

The schema change was originally generated as a narrow two-column removal and
applied without changing conversation, Idea Map, Draft, revision, or proposal
data. That incremental migration was later retired by the explicitly approved
pre-production migration-history reset in Decision 048.

This decision completes and operationalises the Draft Format boundary in
Decision 045 and supersedes Decision 042. Historical Task 033 and progress
records remain evidence of the earlier implementation, not current product
behaviour.

## 047 — Conversational Thinking Policy And Safety Boundary

The mounted ThoughtForm opens by asking what the person would like to think
through. It supports questions, experiences, decisions, and ideas without
assuming a writing goal. Conversation and the Idea Map are valid on their own;
Draft readiness is advice rather than a gate, and the assistant may offer an
optional articulation without implying unfinished work.

Ordinary inquiry uses one concise grounded reflection, distinction, or
observation followed by one useful question when inquiry should continue. The
conversation policy must preserve mixed feelings, uncertainty, contradiction,
provisional conclusions, and open questions. Composition creates the minimum
coherent first-person plain-text expression supported by established material:
one sentence, a paragraph, a list, or a longer account. It must not manufacture
resolution, confidence, causes, advice, or an assistant analysis.

The portfolio demo is not therapy, diagnosis, crisis response, or professional
support. Sensitive reflection remains allowed, but product copy makes that
boundary explicit and directs immediate-danger cases toward local emergency or
crisis support and a trusted person. This is a proportionate safety boundary,
not mental-health positioning.

Deterministic browser coverage and bounded hosted evaluations cover personal
reflection, mixed or unresolved feelings, practical decisions, ideas or
arguments, early articulation, correction, and valid no-Draft use. Hosted
structured-output validation is a hard evaluation failure. These checks provide
engineering evidence only; production usefulness to the owner remains the
product validation described by Decision 045.

## 048 — The Product Is Renamed To ThoughtForm

The product formerly called Socratic Draft is now `ThoughtForm`. The new name
describes its corrected purpose: conversation gives thoughts form through
exploration, organisation, and optional expression without assuming that the
user intends to publish writing.

`ThoughtForm` is the public and PascalCase identity. `thoughtForm` is the
camelCase identity. `thoughtform` is the product id, slug, route segment, package
path, API path, structured-output prefix, evaluation command, and database table
prefix. A leading article is not part of the name. Valid domain concepts such as
Draft, Discovery, Composition, conversation, and Idea Map remain unchanged.

This is a complete identity replacement, not an alias. There are no compatibility
redirects, dual package exports, legacy API mounts, or persistence mappings. Old
URLs stop resolving. Historical task and architecture material is updated to use
the current identity so examples and diagnostic paths remain executable; the
former name is retained only where this decision and the approved rename task
must explain the change.

Because the repository and Neon branch are pre-production and their development
data was explicitly declared disposable, all ten prior migrations were deleted,
the development schema was reset, and Prisma generated and applied one new
schema-first initial migration: `20260804154812_initial`. It contains the complete
current platform schema, including Better Auth tables and the eight
`thoughtform_*` product tables. No data migration or preservation contract
exists for this reset.

This decision supersedes the old product identity wherever it appears in earlier
decisions without changing their substantive architecture or behaviour.

## 049 — Hosted AI Providers Are Explicitly Selected

`packages/ai` owns provider-specific clients behind its provider-neutral
`LlmClient` contract. ThoughtForm and its product-owned model ports do not import
provider SDKs, credentials, configuration, or response types.

The API host selects exactly one provider with `AI_PROVIDER`. Anthropic uses
`ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`; OpenAI uses `OPENAI_API_KEY` and
`OPENAI_MODEL`. Hosted calls fail closed when the kill switch is off, the
provider is unknown, or the selected provider's credential is absent. The host
must not silently fall back to another configured provider because that would
make behaviour and privacy processing harder to diagnose.

Anthropic Sonnet 5 (`claude-sonnet-5`) is the current development and restricted
demo baseline. This is an intentional working selection, not the result of a
completed comparative-model evaluation or a permanent production-model choice.
OpenAI remains supported, and comparative evaluation is deferred.

## 050 — ThoughtForm Supports Explicit AI Profiles

ThoughtForm is not provider-agnostic merely because `packages/ai` exposes a
provider-neutral transport client. The product explicitly supports Anthropic
Sonnet 5 and OpenAI GPT-5.6 Terra profiles. Each supported profile owns its product
compatibility, provider-specific structured-output projection, prompting and
eventual evaluation baseline. The API host may select one supported profile but
must fail closed for unknown providers or model slugs.

The semantic product result remains common and is validated after generation.
Provider transport limitations are projected explicitly by the ThoughtForm
profile before a request reaches a generic provider client; a generic client
must not silently rewrite product schemas. Invalid proposed idea material may
receive one bounded repair attempt. Proposed ideas require exact user-message
evidence, and assistant wording is not established material without user
adoption.

Public provider disclosure is runtime-derived from central provider metadata.
Privacy acknowledgement versions track material policy changes, not model
switches. The host site's shared content container has a 1440px maximum width;
ThoughtForm inherits that host decision.

## 051 — Braintrust Observes Owner And Synthetic Evaluation Flows Only

ThoughtForm uses the Braintrust SDK as its initial evaluation-observability
backend. Runtime-neutral client/server observation contracts live in
`packages/observability`; Braintrust credentials, SDK integration, export
policy, and access-aware adapter selection remain owned by the API host.

Complete evaluation-relevant content may be captured for owner persistent
conversation turns and explicitly executed synthetic evaluation scenarios. This
may include user messages, assistant responses, model output needed to assess
Idea Map behaviour, prompt/profile context, and content-free latency, token,
cache, validation, and persistence measurements. Repository-owned prompts,
fixtures, scenarios, and evaluation criteria remain canonical.

Temporary demo operations use the no-op observability adapter and send neither
content nor content-free request metadata to Braintrust. Automatic provider
instrumentation is prohibited because the owner and demo currently share hosted
AI infrastructure and automatic capture cannot safely enforce the route-level
privacy boundary. A future permanent non-owner workspace requires a separately
approved consent, retention, access, and deletion policy before evaluation
content tracing is enabled.

Braintrust export is disabled unless its credential and project configuration
are both explicit. Its failure must not change a user operation's result.
Braintrust retention is independent of Neon persistence; deleting an owner
conversation does not currently delete an evaluation trace. This decision
creates a deliberate owner-evaluation exception to Decision 028's content-free
product-analytics rule without weakening that rule for demo or future users.

## 052 — Conversation And Idea Map Writes Reconcile Independently

The streamed assistant turn and its asynchronously generated Idea Map analysis
remain independent results. The client becomes interactive when the assistant
turn is retained and must not wait for the map operation to settle.

Conversation-turn retention therefore checks both the expected Idea Map
revision and expected message count. When retention loses only to a newer map
revision and the loaded message history is unchanged, the application may reuse
the already generated response and retry that persistence operation once
against the newer map. A changed message history is a genuine conversation
conflict; it must not be overwritten, reordered, or trigger another paid model
generation.

A completed Idea Map analysis is applied to the latest loadable map rather than
the request's stale starting map. Revision-checked retention may retry once
after a map conflict, reapplying the same analysis to the newly loaded map. A
persistent conflict is exposed as a recoverable map failure and never removes
the retained assistant turn. This is bounded optimistic persistence
reconciliation, not model retry, request serialization, or a durable background
job.

## 053 — Public Content Is Repository-Backed And Product Information Is Public

Website pages and writing posts are host-owned Markdown committed beneath the
client's `content/pages` and `content/posts` folders. The host validates YAML
properties, orders posts newest-first by explicit `createdAt` metadata, renders
the homepage collection, and exposes complete posts at `/writing/:slug`.
Filesystem timestamps are not content metadata. Obsidian is the authoring tool,
but unsupported Obsidian-only syntax must fail clearly rather than silently
produce different public output.

This supersedes the database-backed writing and post-ThoughtForm sequencing in
Decisions 014, 015, and 045. Public content remains independent of private
ThoughtForm Drafts, and no publishing bridge or product export is introduced.

The product catalogue, ThoughtForm overview, and product privacy information are
public website content. Every ThoughtForm workspace route and operation remains
owner-only until a later approved release task explicitly changes that boundary.
The API host is authoritative; client route gates only present the same access
decision in the browser.

## 054 — Production Uses One Persistent Same-Origin Railway Service

The production website is deployed as one persistent Railway service. The Hono
process serves the built Vite client and mounts product API routes beneath
`/api`, authentication beneath `/auth`, and deployment health at `/health`.
Client-side routes receive the SPA document only after those server boundaries
and file requests have been resolved. Missing file requests return 404.

This same-origin shape is intentional. It keeps Better Auth cookies and
ThoughtForm SSE responses direct and avoids a second frontend proxy or a
provider-specific function runtime. The production artifact remains ordinary
Node and can move to another container host without changing product packages.

Railway uses repository-owned build, pre-deploy migration, start, health-check,
and restart configuration. Neon remains the durable database provider.
Railway Serverless/App Sleeping stays disabled because idle cold boots conflict
with the product's response-latency objective. The Railway edge's documented
`X-Real-IP` header is explicitly configured for Better Auth client rate-limit
identity; that trust must be reconsidered if the origin becomes directly
reachable or the deployment provider changes.

Deployments are verified first on a temporary Railway domain. Production DNS,
canonical metadata, final origins, and custom-domain activation require a
separate approved task.

## 055 — ThoughtForm Has An Owner-Only Temporary Workspace

Decision 053 supersedes Decision 023's earlier generally authenticated demo
boundary. `/products/thoughtform/editor` is now the owner's temporary workspace:
it retains one application-memory workspace for the owner and remains distinct
from ID-addressed saved owner conversations. Non-owner sessions cannot access
either workspace shape or any ThoughtForm operation.

The platform-wide `demo` access level remains available for future products and
test-host composition, but it does not describe the current ThoughtForm access
boundary. Current product code and documentation therefore use *temporary
workspace* for lifecycle semantics and reserve *demo* for historical records or
genuinely non-owner platform access.

## 056 — Temporary Lifecycle Meaning And Shared HTTP Policy Stay Product-Owned

Clearing or expiring a temporary conversation is one awaited product lifecycle
operation: the product coordinates clearing associated workspace content, while
the API host supplies in-memory stores, timers, and concrete cleanup adapters.
Recreated workspaces receive fresh identities, so a stale client cannot address
replacement state.

Temporary and saved conversation routes share product-owned request validation,
application invocation, response mapping, and streaming observation policy.
Their access, persistence, identity, and expiry differences remain explicit at
the route boundary. Host-owned disclosure and observation endpoints live in a
focused `delivery` role beside the host mount, leaving `mount.ts` responsible
for dependency assembly.

## 057 — Temporary Workspace Capability Is Authenticated And Release-Gated

Decision 053's and Decision 055's product-level owner-only boundary is
superseded. ThoughtForm's intended temporary-workspace capability supports one
isolated application-memory workspace for each authenticated user to whom the
host grants access. The owner uses the same temporary capability and separately
retains owner-only ID-addressed durable conversations and owner-observation
surfaces.

The API host owns a release gate rather than the product package owning a
deployment policy. Development enables authenticated non-owner temporary
workspaces so their complete lifecycle and user isolation can be exercised.
Production denies every non-owner ThoughtForm operation until a later approved
demo-release task changes that gate. The API remains authoritative; the client
mirrors the decision only for route presentation and discoverability.

Opening production demo access is not part of this decision. It remains
deferred from Task 036 together with usage accounting, measurement, and
enforcement. Temporary-workspace content continues to receive no Langfuse
observation, regardless of whether the authenticated user is the owner or a
non-owner.

## 058 — Langfuse Manages Prompts And Owner Evaluation Traces

Decision 051's Braintrust backend and repository-only prompt source are
superseded. ThoughtForm uses Langfuse Prompt Management plus the Langfuse
OpenTelemetry SDK for evaluation observability. Product-owned prompt names,
fallback content, required variables, fixtures, scenarios, and evaluation
criteria remain in `packages/products`; the API host owns Langfuse credentials,
SDK initialization, prompt retrieval, export policy, and access-aware adapter
selection.

Development retrieves the `development` prompt label with caching disabled so
new versions can be exercised without promoting them. Production retrieves the
`production` label with SDK caching. Every prompt has a repository fallback, and
a production promotion is incomplete until that fallback is updated to the same
content in the reviewed change. A Langfuse outage must not make an AI operation
unavailable when its repository fallback can be used. Generation observations
link the resolved non-fallback prompt name and version.

Langfuse's `review` label triggers a GitHub Repository Dispatch automation that
fetches the immutable version and opens a fallback pull request. It accepts only
catalogued ThoughtForm prompts and established variables and structure. It
cannot commit directly to `main`. Once reviewed fallback metadata reaches
protected `main`, a separate workflow re-fetches and fingerprints the recorded
versions before assigning `production`. Production is therefore downstream of
repository review rather than the event that initiates synchronization.

Complete evaluation-relevant content may be captured for owner persistent
workspace operations and explicitly executed synthetic evaluation scenarios.
Temporary-workspace operations use no-op observability and send neither content
nor content-free request metadata to Langfuse, including in development.
Automatic provider instrumentation remains prohibited because owner and
temporary operations share hosted AI infrastructure. Manual instrumentation at
the access-aware product mount preserves that boundary.

Langfuse export is disabled unless its public key, secret key, and base URL are
all explicit. Export or prompt-service failure must not change the result of a
user operation. Langfuse retention remains independent of Neon persistence;
deleting an owner conversation does not currently delete its evaluation traces.

## 059 — Articulation Is ThoughtForm's Intended Culmination

ThoughtForm's product-facing journey is Explore, Inspect, and Articulate. The
user talks through what is on their mind, inspects and corrects the evolving Idea
Map, and brings the resulting understanding together in a coherent first-person
expression. These labels explain the experience; they do not replace Discovery,
Composition, Draft, Idea Map, conversation, or workspace terminology and do not
create stored phases or modes.

Articulation is the intended culmination and likely the moment where ThoughtForm
proves its distinctive value. Recognition of the whole expression consolidates
the reflective process and is where the expected cathartic benefit principally
lives. This is a product hypothesis and possible personal benefit, not a promise
or clinically validated outcome.

The system does not force a Draft, prevent a person from stopping earlier, or
record a universal completed state. A useful conversation or Idea Map can still
stand on its own in an individual session. That flexibility does not make
stopping before articulation an equivalent intended endpoint. This decision
supersedes Decision 045 and Decision 047 only where their wording gave those
outcomes equal product weight or described articulation as merely optional. It
preserves the distinction between articulation as outcome, Composition as
activity, compose as operation, and Draft as artifact.

The central product principle is that reflective technology should make the user
more capable, not replace their judgement. The assistant supports rather than
becomes the authority; the Idea Map exposes interpretation for correction;
speculative interpretations remain tentative; and uncertainty, mixed feelings,
and unresolved tensions must not be polished away. ThoughtForm must not optimise
for dependency, excessive engagement, or manufactured retention.

ThoughtForm currently operates as a portfolio project and product experiment.
“Open-source, AI-assisted cathartic journaling platform” records an accessible
possible category and commercialisation position, not a therapeutic claim,
launched distribution model, or current company strategy. A possible future
model combines an open-source self-hostable core, a freely available prompt that
approximates but does not reproduce the product, and a hosted service competing
on interaction quality, UX, idea modelling, privacy, safety, reliability,
continuity, and refinement rather than lock-in. Non-expiring usage credit is the
preferred pricing hypothesis over subscription because reflective use may be
intermittent and should not create incentives for manufactured engagement.

Licensing, open-source release, self-hosting support, prompt publication, hosted
service operation, billing, and pricing are not implemented or approved by this
decision. Each requires separate proposal and approval. User-facing copy is also
deferred. Existing terminology remains unchanged; any proposed terminology
rename, addition, or removal requires separate explicit approval.

## 060 — Hosted Attempts Are Content-Free Product Operations

Every ThoughtForm operation that may invoke a hosted model is admitted and
completed through one product-owned lifecycle. The actions are conversation
response, Idea Map analysis, Draft composition, revision proposal, and
model-backed saved-change interpretation. Concurrent conversation response and
Idea Map analysis are separate attempts because either may succeed or fail
independently. Invalid input and disabled or rejected host configuration create
no durable attempt.

The API host supplies an authenticated-account-scoped adapter and captures
provider-neutral model and token usage inside the admitted async context. One
product operation retains one attempt identity across bounded provider repair
calls and persistence retries that reuse generated output. Known usage is
aggregated; if any call omits a metric, that aggregate remains unknown rather
than understating consumption.

Neon persists only the account reference, action, operation id, model, token
counts, timestamps, and operational outcome. Prompts, messages, ideas, drafts,
proposals, generated prose, IP addresses, user-agent strings, and behavioural
profiles are prohibited. Outcomes are `succeeded`, `provider_failed`,
`persistence_failed`, and `interrupted`. Completion is conditional and
idempotent. Admitted attempts older than one hour reconcile to `interrupted`;
completed attempts are retained for 90 days and removed during later admission
cleanup. Deleting the authentication user cascades their attempt records, while
clearing temporary workspace content does not remove this separate operational
metadata early.

This ledger is distinct from Langfuse. Temporary workspace operations continue
to export neither content nor content-free metadata to Langfuse. The ledger
records attempts but does not yet reject usage, calculate billing, expose an
admin surface, or establish calibrated allowances; Tasks 039, 040, and 044 own
those later decisions.

## 061 — Idea Map Structure Is Autonomous, Bounded, And Reversible

ThoughtForm's existing asynchronous Idea Map analysis may propose one merge of
overlapping established ideas or one split of an overloaded established idea.
This remains part of the existing Idea Map analysis hosted attempt; it does not
introduce another model call or accounting action. Product capability code, not
the model or host, validates and applies the proposal atomically against the
expected Idea Map revision.

A merge retains the earliest source identity and all established source
substance, unresolved questions, user interpretations, affected references, and
a disposition no more active than its sources. A split retains the original ID
for its primary result, assigns new IDs to the others, inherits the source
disposition, and requires the exact established substance and unresolved
questions to be distributed without omission. Dismissed ideas cannot
participate automatically. Conversation history and Draft content remain
unchanged.

An applied structural interpretation is immediately visible with a concise
explanation and one-step undo. The map stores only the affected prior ideas and
conflicts, insertion position, result IDs, and a content-derived signature.
Undo restores that state and suppresses an equivalent proposal against unchanged
source material. Any intervening map mutation clears the undo record. Direct
user merge, split, and undo commands use the same validation and optimistic
persistence boundary and are canonical corrections. This bounded provenance is
not a general history or time-travel facility and follows the workspace's
existing privacy and retention lifetime.

## 062 — Hosted Usage Uses Atomic UTC-Day Reservations

ThoughtForm admits non-owner hosted operations only when both the authenticated
user's UTC-day budget and the platform-wide UTC-day budget can hold the full
operation reservation. Personal budgets are 120 operations and 600,000
completed tokens; global safeguards are 600 operations and 3,000,000 completed
tokens. Conversation response, Idea Map analysis, Draft composition, revision
proposal, and saved-change interpretation reserve 5,000, 7,000, 2,500, 1,500,
and 2,500 tokens respectively. Admission is atomic and never deliberately
overshoots either window. An admitted operation remains attributed to its
original UTC day.

Completion replaces the reservation only when both input and output usage are
known, using their sum. Cache and reasoning fields remain diagnostic and are
not charged again. Missing usage retains the full reservation. The owner is
exempt from the personal budget but remains subject to the global safeguard.
Production requires explicit positive-integer host configuration for all four
budgets and fails closed when it is absent or invalid.

Clients may receive only a stable limited outcome, the authenticated user's
safe remaining hosted-operation allowance, and the UTC reset timestamp. They
must not receive personal token usage, global capacity, reservations, internal
cost, other-user activity, or provider-failure detail. Model bounds are 32 KiB
input and 1,024 output tokens for conversation, 32 KiB input and 1,536 output
tokens for Idea Map analysis, and 16 KiB serialized input and 512 output tokens
for Draft model operations.
