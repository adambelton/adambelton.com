# Implementation Overview: The Socratic Draft

## Current architecture note

This document is an early implementation overview and may include older scaffold examples.

Canonical current rules live in `AGENTS.md` and `docs/decisions.md`. In particular:

- The canonical product-specific design lives in
  `docs/products/socratic-draft/the-socratic-draft-architecture.md`.
- The `ConversationPhase` examples and phase-based state shapes later in this
  early overview are superseded. Do not use them for implementation. Task 027
  replaces the current phase contract with interaction-scoped activity,
  assistant moves, action-specific readiness, explicit user intention, and
  resource-derived lifecycle.

- Socratic Draft is the source of truth for its own product contracts and domain types.
- Socratic Draft product code uses `shared`, `server`, and `client` boundaries under `packages/products/src/socratic-draft/`.
- `packages/shared` is reserved for platform-wide concerns.
- The minimal server-side conversation service is named `ConversationService`.

## Project architecture

The project should be a **single repository for Adam’s personal website and product demos**.

The Socratic Draft is the first product inside that site, not the entire app.

At a high level:

```txt
Personal website
  ├─ published writing
  ├─ product portfolio
  ├─ live product demos
  ├─ owner/admin tools
  └─ shared server/auth/AI/database infrastructure
```

The website should be writing-first:

```txt
/                                      Published writing landing page
/writing                               Writing archive
/writing/[slug]                        Individual public post
/products                              Product overview
/products/socratic-draft               Product overview/demo page
/products/socratic-draft/editor        The Socratic Draft editor
/login                                 Passwordless email login
/admin                                 Owner-only admin
```

The frontend should not talk directly to AI providers.

The backend is not a generic AI proxy. It is the product orchestration layer for the website and its products.

It owns:

- authentication
- owner/demo access rules
- product access
- usage limits
- conversation policy
- assistant move selection
- prompt orchestration
- phase transitions
- readiness detection
- persistence rules
- AI provider calls
- response streaming
- publishing
- admin visibility

The frontend owns:

- rendering the public website
- rendering published writing
- rendering product pages
- rendering the editor/demo experience
- capturing user input
- displaying streamed responses
- showing suggested replies
- holding temporary demo state
- rendering owner/admin screens

## Core architectural principle

Scaffold the repo with its intended long-term package boundaries from the beginning.

Even if some packages are initially thin, create them on day one:

- `apps/web`
- `apps/api`
- `packages/shared`
- `packages/db`
- `packages/auth`
- `packages/ai`
- `packages/products`

The goal is to prevent implementation drift, especially when using AI coding agents.

Principle:

```txt
Create the architecture early.
Implement the behaviour gradually.
```

Do not defer `db`, `ai`, or `auth` packages until later. Deferring them increases the risk that database access, auth helpers, AI clients, and shared types get created ad hoc in app folders.

## Recommended stack

- Next.js
- React
- TypeScript
- Node.js
- Hono API server
- Postgres
- Drizzle or Prisma
- Passwordless email auth
- Anthropic or OpenAI API
- Optional search/research provider later
- pnpm workspaces
- Turborepo optional but useful
- Frontend hosted on Vercel, Cloudflare Pages, or similar
- API hosted on Fly.io, Railway, Render, or similar

## Final-shaped monorepo structure

```txt
personal-site/
  apps/
    web/
      app/
        page.tsx
        writing/
          page.tsx
          [slug]/
            page.tsx
        products/
          page.tsx
          socratic-draft/
            page.tsx
            editor/
              page.tsx
        login/
          page.tsx
        admin/
          page.tsx
      components/
        site/
        writing/
        products/
        socratic-draft/
      lib/
        api-client.ts
        routes.ts
      package.json

    api/
      src/
        index.ts
        server.ts
        routes/
          health.ts
          auth.ts
          writing.ts
          products.ts
          admin.ts
          socratic-draft.ts
        middleware/
          require-auth.ts
          require-owner.ts
          rate-limit.ts
        controllers/
          writing-controller.ts
          products-controller.ts
          socratic-draft-controller.ts
        services/
          usage-service.ts
          product-access-service.ts
      package.json

  packages/
    shared/
      src/
        api/
          responses.ts
          errors.ts
        users/
          types.ts
        writing/
          types.ts
        products/
          types.ts
          registry.ts
        socratic-draft/
          types.ts
        index.ts

    db/
      src/
        schema/
          users.ts
          writing-posts.ts
          products.ts
          usage-events.ts
          socratic-draft.ts
        repositories/
          users-repository.ts
          writing-posts-repository.ts
          usage-events-repository.ts
          socratic-draft-repository.ts
        client.ts
        index.ts
      migrations/

    auth/
      src/
        access-level.ts
        session.ts
        magic-link.ts
        types.ts
        index.ts

    ai/
      src/
        providers/
          anthropic-provider.ts
          openai-provider.ts
        fake-llm-client.ts
        llm-client.ts
        streaming.ts
        usage.ts
        types.ts
        index.ts

    products/
      src/
        registry.ts
        socratic-draft/
          conversation-service.ts
          system-prompt.ts
          state.ts
          readiness.ts
          thread-utils.ts
          claim-utils.ts
          composition.ts
          publishing.ts
          types.ts
          index.ts
        index.ts

  docs/
    product-brief.md
    implementation-overview.md
    architecture.md

  tasks/
    001-scaffold-repo.md
    002-shared-types.md
    003-product-registry.md
    004-socratic-draft-service-stub.md

  package.json
  pnpm-workspace.yaml
  turbo.json
  README.md
  AGENTS.md
  .env.example
```

## Package responsibilities

### `apps/web`

The Next.js frontend and public website.

Owns:

- homepage
- published writing pages
- product overview pages
- The Socratic Draft editor UI
- login UI
- admin UI
- API client wrappers
- browser-only demo state

Does not own:

- AI provider calls
- access-level decisions
- persistence rules
- conversation policy
- shared domain types

### `apps/api`

The Node + Hono API server.

Owns:

- HTTP routes
- request validation
- middleware
- auth enforcement
- owner/demo branching
- usage enforcement
- response streaming
- calling product services
- calling repositories

Routes should be thin. Product-specific behaviour should live in `packages/products`.

### `packages/shared`

Shared cross-package types and constants.

Rule:

```txt
If a type crosses a package boundary, it belongs in packages/shared.
If a type is purely internal implementation detail, it can live in the package that owns it.
```

This package should include:

- API response types
- user/access-level types
- product definition types
- writing post types
- Socratic Draft conversation state types
- product IDs

Do not create duplicate versions of these types inside apps.

### `packages/db`

Database schema, database client, and repositories.

Owns:

- table definitions
- migrations
- repository interfaces/implementations
- persistence-specific record types

API route handlers should not contain raw ORM logic.

### `packages/auth`

Authentication and access-level logic.

Owns:

- session types
- session helpers
- passwordless magic-link helpers
- owner/demo access-level detection

Owner detection:

```ts
user.email.toLowerCase() === process.env.OWNER_EMAIL?.toLowerCase()
```

### `packages/ai`

AI provider boundary.

Owns:

- provider interfaces
- provider implementations
- fake LLM client for tests/prototype
- streaming helpers
- usage/token metadata

Product services should depend on an `LlmClient` interface rather than calling SDKs directly everywhere.

### `packages/products`

Product-specific domain logic.

Owns:

- product registry
- product-specific services
- The Socratic Draft conversation service
- system prompts
- state helpers
- thread/claim utilities
- readiness logic
- composition/publishing helpers

This package should import shared types from `packages/shared`.

## Shared types to create up front

Create shared types before feature implementation to avoid ad hoc type sprawl.

### API responses

```ts
export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
```

### Users and access levels

```ts
export type AccessLevel = "owner" | "demo";

export type User = {
  id: string;
  email: string;
  emailDomain: string;
  createdAt: string;
  lastLoginAt: string | null;
};
```

### Products

```ts
export type ProductId = "socratic-draft";

export type ProductStatus = "prototype" | "active" | "archived";

export type ProductDefinition = {
  id: ProductId;
  name: string;
  slug: string;
  summary: string;
  description: string;
  status: ProductStatus;
  publicPath: string;
  demoPath?: string;
  requiresAuth: boolean;
};
```

### Writing posts

```ts
export type WritingPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  publishedAt: string | null;
  sourceProductId: ProductId | null;
  createdAt: string;
  updatedAt: string;
};
```

### Socratic Draft conversation types

```ts
export type AssistantMove =
  | "probe"
  | "clarify"
  | "challenge"
  | "surface_perspective"
  | "distinguish"
  | "ask_for_example"
  | "partial_reflection"
  | "full_reflection"
  | "branch_check"
  | "suggest_research"
  | "offer_composition"
  | "compose_private"
  | "revise_private_entry"
  | "offer_publishing";

export type ConversationPhase =
  | "new_entry"
  | "private_exploration"
  | "deepening"
  | "synthesis"
  | "ready_to_compose"
  | "private_entry_composed"
  | "publishing_intent"
  | "publishing_preparation"
  | "public_draft_ready"
  | "published";

export type ThreadStatus =
  | "surfaced"
  | "needs_fleshing_out"
  | "active"
  | "central"
  | "supporting"
  | "parked"
  | "separate_entry_candidate"
  | "resolved"
  | "discarded";

export type ThreadRelevance =
  | "central"
  | "supporting"
  | "uncertain"
  | "tangential"
  | "not_relevant";

export type ConversationThread = {
  id: string;
  label: string;
  summary: string;
  status: ThreadStatus;
  relevance: ThreadRelevance;
  evidence: string[];
  openQuestions: string[];
};

export type ClaimType =
  | "feeling"
  | "experience"
  | "self_judgement"
  | "moral_claim"
  | "interpretation"
  | "factual_claim"
  | "prediction";

export type ClaimStatus =
  | "accepted_as_feeling"
  | "accepted_as_experience"
  | "needs_clarification"
  | "needs_nuance"
  | "needs_challenge"
  | "research_candidate"
  | "supported"
  | "contradicted"
  | "unclear"
  | "opinion";

export type DetectedClaim = {
  id: string;
  text: string;
  type: ClaimType;
  status: ClaimStatus;
  relatedThreadIds: string[];
};

export type ConversationState = {
  phase: ConversationPhase;
  exploredEnough: boolean;
  nearReadyToReflect: boolean;
  readyToReflect: boolean;
  shouldOfferComposition: boolean;
  centralThought?: string;
  threads: ConversationThread[];
  claims: DetectedClaim[];
};

export type SuggestedReply = {
  label: string;
  message: string;
};

export type SocraticDraftConversationResponse = {
  conversationId: string;
  message: {
    role: "assistant";
    content: string;
  };
  move: AssistantMove;
  state: ConversationState;
  suggestedReplies: SuggestedReply[];
};
```

## Product registry

Create a product registry early.

This is not a complex plugin system. It is a simple source of truth for products shown on the personal website.

```ts
export const products: ProductDefinition[] = [
  {
    id: "socratic-draft",
    name: "The Socratic Draft",
    slug: "socratic-draft",
    summary:
      "A Socratic writing tool for working out what you think before writing it.",
    description:
      "Start with a rough thought. The assistant asks questions, challenges assumptions, tracks threads, and helps turn the conversation into a draft.",
    status: "prototype",
    publicPath: "/products/socratic-draft",
    demoPath: "/products/socratic-draft/editor",
    requiresAuth: true,
  },
];
```

Use this registry to render `/products`.

Future products can be added without inventing new patterns.

## Public writing model

Published writing should be a site-level concept, not a Socratic Draft-only concept.

The Socratic Draft creates owner-scoped conversations that may produce private drafts.

Published drafts become website writing.

The website should not care whether a published piece started in The Socratic Draft, was written manually, or came from another future product.

Suggested boundary:

```txt
Conversation process → SocraticDraftConversation
Private writing artifact → SocraticDraftDraft
Public website writing → WritingPost
```

When publishing from The Socratic Draft, create or update a `WritingPost`.

## Database model

### User

```ts
User {
  id: string;
  email: string;
  emailDomain: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}
```

Owner status is derived from `OWNER_EMAIL`, not stored as a mutable user flag.

### WritingPost

```ts
WritingPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  publishedAt: Date | null;
  sourceProductId: ProductId | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### SocraticDraftConversation

Owner-only persistent conversation history and working state.

```ts
SocraticDraftConversation {
  id: string;
  userId: string;
  nextMessagePosition: number;
  state: ConversationState;
  createdAt: Date;
  updatedAt: Date;
}
```

### SocraticDraftDraft

Private writing produced and collaboratively shaped from a conversation.

```ts
SocraticDraftDraft {
  id: string;
  conversationId: string;
  title: string | null;
  body: string;
  intendedFormId: string | null;
  writingPostId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

`publishedAt` controls public visibility.

`isPublic` should be derived, not stored.

### ConversationTurn

Owner-only persistent conversation history.

```ts
ConversationTurn {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  assistantMove: AssistantMove | null;
  phaseAfterTurn: ConversationPhase | null;
  stateSnapshot: ConversationState | null;
  createdAt: Date;
}
```

Demo conversation turns may exist only in isolated, temporary session memory and must not enter durable storage.

### IntendedForm

```ts
IntendedForm {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  structure: unknown;
  completenessCriteria: unknown;
  guidance: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### VoiceProfile

Owner-only.

```ts
VoiceProfile {
  id: string;
  userId: string;
  summary: string;
  preferredPhrases: string[];
  avoidedPhrases: string[];
  styleObservations: unknown;
  updatedAt: Date;
}
```

### UsageEvent

Product-aware usage tracking.

```ts
UsageEvent {
  id: string;
  userId: string;
  productId: ProductId;
  accessLevel: "owner" | "demo";
  action: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: Date;
}
```

## AI provider boundary

Product services should not call vendor SDKs directly.

Define an `LlmClient` interface in `packages/ai`:

```ts
export type LlmMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LlmRequest = {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
};

export type LlmResponse = {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  model: string;
};

export interface LlmClient {
  createMessage(request: LlmRequest): Promise<LlmResponse>;
}
```

Implement:

- `FakeLlmClient` first, for deterministic tests and early UI wiring
- `AnthropicLlmClient`
- `OpenAiLlmClient`

This allows Codex to build the conversation flow before real AI integration.

## Auth package boundary

`packages/auth` should own session and access logic.

Initial types/functions:

```ts
export type AuthenticatedSession = {
  user: User;
  accessLevel: AccessLevel;
};

export function getAccessLevel(email: string, ownerEmail: string): AccessLevel {
  return email.toLowerCase() === ownerEmail.toLowerCase() ? "owner" : "demo";
}
```

Later this package can own:

- magic link generation
- token verification
- session cookies
- logout helpers

## API routes

Prefer explicit product routes for MVP.

```txt
GET  /health

POST /auth/request-link
GET  /auth/callback
POST /auth/logout
GET  /me

GET  /writing
GET  /writing/:slug
POST /writing
PATCH /writing/:id
POST /writing/:id/publish

GET  /products
GET  /products/:slug

GET  /products/socratic-draft/session
POST /products/socratic-draft/conversation/respond
GET  /products/socratic-draft/conversations
GET  /products/socratic-draft/conversations/:id
GET  /products/socratic-draft/drafts/:id
PATCH /products/socratic-draft/drafts/:id
POST /products/socratic-draft/drafts/:id/publish

GET  /admin/users
GET  /admin/usage
```

Do not prematurely build a generic route like:

```txt
POST /products/:productId/conversation/respond
```

Use shared infrastructure behind explicit routes.

## Core backend concept: ConversationService

The central product service should be analogous to the previous career reflection coach service.

That earlier service used:

- one conversation service
- a strong system prompt
- conversation phases
- background context
- conversation history
- assistant-led guidance
- generated output only after enough ground had been covered

The equivalent for this product:

```ts
class ConversationService {
  constructor(params: {
    user: User;
    accessLevel: "owner" | "demo";
    conversation?: SocraticDraftConversation;
    message: string;
    conversationHistory: ConversationMessage[];
    currentState: ConversationState;
    voiceProfile?: VoiceProfile;
    demoState?: ConversationState;
    llmClient: LlmClient;
  }) {}

  async call(): Promise<SocraticDraftConversationResponse> {
    // Build system prompt
    // Build messages
    // Call AI provider
    // Parse structured response
    // Return assistant message + updated state
  }
}
```

The service is responsible for continuing the inquiry, not merely answering a prompt.

## Key architectural shift: user messages, not frontend actions

The frontend should not send explicit AI actions such as:

```ts
{ action: "explore" }
```

or:

```ts
{ action: "challenge" }
```

or:

```ts
{ action: "compose_private" }
```

Instead, the frontend sends ordinary user messages.

Example:

```ts
POST /products/socratic-draft/conversation/respond

{
  "conversationId": "conversation_123",
  "message": "The hardest thing to admit is that sometimes I feel trapped..."
}
```

The backend conversation service decides the assistant’s next move.

It may decide to:

- probe deeper
- clarify a phrase
- challenge a conclusion
- surface a perspective
- reflect back
- offer composition
- compose the private draft

The user experiences this as a natural conversation.

Suggested replies are allowed, but they should be ordinary user messages:

```ts
{
  label: "Draft it",
  message: "Draft it."
}
```

not hidden frontend actions.

## Conversation policy

The system prompt should define the assistant’s behavioural contract.

It should include:

- product identity
- private-first principle
- one-question-at-a-time rule
- available assistant moves
- phase definitions
- readiness rules
- thread tracking rules
- claim detection rules
- composition rules
- publishing boundaries
- voice guidance

The assistant should be told:

- this is not an interview
- this is not a generic writing assistant
- do not jump to drafting
- do not ask about public form too early
- validate feelings but test claims
- ask one question at a time
- reflect only when the central picture is clear
- offer composition only when the topic is explored enough

## Assistant moves

A move is the assistant’s next conversational act.

```ts
type AssistantMove =
  | "probe"
  | "clarify"
  | "challenge"
  | "surface_perspective"
  | "distinguish"
  | "ask_for_example"
  | "partial_reflection"
  | "full_reflection"
  | "branch_check"
  | "suggest_research"
  | "offer_composition"
  | "compose_private"
  | "revise_private_entry"
  | "offer_publishing";
```

Moves are chosen by the assistant/backend conversation service, not by the frontend.

## Conversation phases

A phase is the broader lifecycle state of the entry.

```ts
type ConversationPhase =
  | "new_entry"
  | "private_exploration"
  | "deepening"
  | "synthesis"
  | "ready_to_compose"
  | "private_entry_composed"
  | "publishing_intent"
  | "publishing_preparation"
  | "public_draft_ready"
  | "published";
```

Move and phase are different:

```txt
Move = what the assistant does next.
Phase = where the entry is overall.
```

The assistant can challenge during early exploration if the user says something that needs challenging.

## Readiness state

The assistant should return state including:

```ts
type ConversationState = {
  phase: ConversationPhase;
  exploredEnough: boolean;
  nearReadyToReflect: boolean;
  readyToReflect: boolean;
  shouldOfferComposition: boolean;
  centralThought?: string;
  threads: ConversationThread[];
  claims: DetectedClaim[];
};
```

### Explored enough

`exploredEnough` means the topic has enough substance to become a coherent private draft.

It does not mean the user is finished.

### Near-ready to reflect

`nearReadyToReflect` means the shape is emerging, but one important uncertainty remains.

### Ready to reflect

`readyToReflect` means the assistant can accurately say:

> I think the shape of this is...

without flattening or exaggerating the user’s thought.

### Should offer composition

`shouldOfferComposition` usually becomes true after:

- the topic is explored enough
- a full reflection has been given
- the user has confirmed or refined it
- there is enough of the user’s own language to preserve

The assistant should offer composition, not compose automatically.

## Thread tracking

A thread is a meaningful line of thought inside the conversation.

```ts
type ConversationThread = {
  id: string;
  label: string;
  summary: string;
  status: ThreadStatus;
  relevance: ThreadRelevance;
  evidence: string[];
  openQuestions: string[];
};
```

Thread statuses:

```ts
type ThreadStatus =
  | "surfaced"
  | "needs_fleshing_out"
  | "active"
  | "central"
  | "supporting"
  | "parked"
  | "separate_entry_candidate"
  | "resolved"
  | "discarded";
```

Thread relevance:

```ts
type ThreadRelevance =
  | "central"
  | "supporting"
  | "uncertain"
  | "tangential"
  | "not_relevant";
```

This lets the assistant distinguish between:

- a surfaced idea that needs fleshing out
- an active central thread
- a supporting thread
- a tangential idea
- an idea to park
- a separate entry candidate
- a discarded idea

Example:

```txt
User: Caring has changed how I think about work and money.
```

Initial thread:

```ts
{
  label: "Care, work, and money",
  status: "surfaced",
  relevance: "uncertain",
  evidence: ["Caring has changed how I think about work and money."],
  openQuestions: [
    "Does this connect to the same feeling of constraint?",
    "Is this a separate entry about work, security, or identity?"
  ]
}
```

The assistant might ask:

> Does work and money mainly connect to this same feeling of constraint, or does it bring up a different feeling?

If it belongs, the thread becomes active/central/supporting.

If it does not belong, it becomes parked or a separate entry candidate.

## Claim detection

A claim is an assertion that may need care.

```ts
type DetectedClaim = {
  id: string;
  text: string;
  type: ClaimType;
  status: ClaimStatus;
  relatedThreadIds: string[];
};
```

Claim types:

```ts
type ClaimType =
  | "feeling"
  | "experience"
  | "self_judgement"
  | "moral_claim"
  | "interpretation"
  | "factual_claim"
  | "prediction";
```

Claim statuses:

```ts
type ClaimStatus =
  | "accepted_as_feeling"
  | "accepted_as_experience"
  | "needs_clarification"
  | "needs_nuance"
  | "needs_challenge"
  | "research_candidate"
  | "supported"
  | "contradicted"
  | "unclear"
  | "opinion";
```

Rule:

```txt
Validate feelings.
Test claims.
```

Examples:

- “I feel trapped” → accepted as feeling
- “That means I am selfish” → needs challenge
- “Other people have it worse, so I should not feel sad” → needs nuance
- “FIFA breaks its own rules” → research candidate

## Owner flow

Owner sends first message:

```ts
POST /products/socratic-draft/conversation/respond

{
  "conversationId": null,
  "message": "I want to write about being a carer for my wife..."
}
```

Backend:

1. Authenticates user.
2. Determines access level.
3. Creates `SocraticDraftConversation` if `conversationId` is null.
4. Saves user `ConversationTurn`.
5. Loads current conversation state.
6. Loads recent conversation turns.
7. Loads voice profile if available.
8. Calls `ConversationService`.
9. Saves assistant turn and state snapshot.
10. Updates conversation state.
11. If composition is accepted, creates or updates the associated `SocraticDraftDraft`.
12. Records product-aware usage event.
13. Returns assistant response.

## Demo flow

Demo sends message and temporary browser-held state:

```ts
POST /products/socratic-draft/conversation/respond

{
  "message": "I want to write about being a carer for my wife...",
  "conversation": [],
  "state": {
    "phase": "new_entry",
    "exploredEnough": false,
    "nearReadyToReflect": false,
    "readyToReflect": false,
    "shouldOfferComposition": false,
    "threads": [],
    "claims": []
  }
}
```

Backend:

1. Authenticates demo user.
2. Checks usage limits.
3. Does not create server-side entry.
4. Does not save conversation turns.
5. Calls `ConversationService` using provided temporary context.
6. Records usage metadata only.
7. Returns assistant response and updated state.

The browser stores the conversation temporarily.

Demo users can copy/download/clear their result.

## Product session endpoint

Add:

```txt
GET /products/socratic-draft/session
```

Owner response:

```ts
{
  productId: "socratic-draft",
  accessLevel: "owner",
  persistence: "server"
}
```

Demo response:

```ts
{
  productId: "socratic-draft",
  accessLevel: "demo",
  persistence: "ephemeral",
  dailyRequestsRemaining: 42
}
```

The same editor route can adapt based on access level.

## Publishing flow

Publishing is owner-only.

Private drafts are not public until explicitly published.

Use:

```txt
publishedAt = null      private
publishedAt = timestamp public
```

When publishing from The Socratic Draft:

1. User indicates intent to publish.
2. Assistant asks intended form.
3. Assistant checks completeness against intended form.
4. Assistant asks targeted follow-up questions if needed.
5. Assistant prepares public version.
6. User previews.
7. User publishes.
8. Backend creates/updates `WritingPost`.
9. Entry references the `WritingPost`.

## Intended forms

Intended forms should be configurable records, not hardcoded modes.

Examples:

- Blog post
- Portfolio case study
- Project write-up
- Opinion piece
- Personal essay
- Public note

A portfolio case study form should include criteria for:

- context
- problem
- users affected
- constraints
- role
- product thinking
- technical decisions
- tradeoffs
- collaboration
- outcomes
- honest limits
- reflection

The assistant must not invent or exaggerate impact.

## Voice profile

Persistent voice profile is owner-only.

Track:

- common phrases
- sentence rhythm
- directness
- preferred uncertainty
- qualifiers
- disliked AI patterns
- acceptable polish level
- whether the user tends to write through examples, arguments, memories, or feelings
- unresolved vs conclusive endings

Demo mode can adapt within the current session but should not persist a voice profile.

## AGENTS.md rules for Codex

Create `AGENTS.md` on day one.

Suggested content:

```md
# Agent Instructions

## Architecture rules

This repo is a monorepo for Adam's personal website and product demos.

Do not create new architectural patterns without approval.

Use the existing package boundaries:

- `apps/web` is the Next.js frontend.
- `apps/api` is the Hono API server.
- `packages/shared` contains shared cross-package types and constants.
- `packages/db` contains schema, database client, and repositories.
- `packages/auth` contains session, magic-link, and access-level logic.
- `packages/ai` contains AI provider interfaces and implementations.
- `packages/products` contains product-specific domain logic.

## Type rules

If a type crosses package boundaries, define it in `packages/shared`.

Do not create duplicate versions of shared types inside apps.

Do not define API response types inside React components or route files.

## Product rules

Product-specific behaviour belongs in `packages/products`.

The Socratic Draft conversation policy belongs in:

`packages/products/src/socratic-draft`

API routes should be thin and should call controllers/services.

## Implementation rules

Do not add placeholder UI, routes, services, or buttons that are not connected to working behaviour.

A task is complete only when:

- typecheck passes
- relevant tests pass
- the changed flow works end to end
- any intentionally deferred work is listed clearly
```

## Codex implementation approach

Use Codex to implement one small, testable vertical slice at a time.

Do not ask Codex to “build the app.”

Good task shape:

```txt
Implement one endpoint, service, route, or screen.
Provide a definition of done.
Require tests/typecheck.
Require a summary of files changed and gaps.
```

Bad task shape:

```txt
Build The Socratic Draft.
```

## First implementation tasks

### Task 001 — Scaffold repository architecture

Create the final-shaped monorepo structure.

Definition of done:

- `apps/web` exists
- `apps/api` exists
- `packages/shared` exists
- `packages/db` exists
- `packages/auth` exists
- `packages/ai` exists
- `packages/products` exists
- all packages have `index.ts`
- workspace imports work
- frontend has a basic landing page
- API has a health route
- `AGENTS.md` exists
- `README.md` explains repo structure
- `pnpm typecheck` passes

### Task 002 — Shared types

Create all shared cross-package types up front.

Definition of done:

- API response types exist
- user/access-level types exist
- product types exist
- writing post types exist
- Socratic Draft conversation types exist
- no duplicate shared types exist inside apps
- typecheck passes

### Task 003 — Product registry and pages

Create product registry and render products page.

Definition of done:

- registry includes The Socratic Draft
- `/products` renders from registry
- `/products/socratic-draft` renders product overview
- editor route exists as a shell only if clearly marked and connected later
- no fake backend behaviour

### Task 004 — Socratic Draft service stub

Create `ConversationService` using `FakeLlmClient`.

Definition of done:

- first message returns a probe
- message containing “bad husband” returns a challenge
- “draft it” after ready state returns composition
- service returns structured state
- tests cover basic moves
- no real LLM call yet

### Task 005 — Conversation endpoint

Implement the real backend route using the stub service.

Definition of done:

- owner new-entry flow creates an entry
- user turn is saved
- assistant turn is saved
- conversation state is updated
- demo flow does not persist writing
- usage event is recorded
- tests cover owner and demo branching

### Task 006 — Minimal editor UI

Build the first end-to-end editor flow.

Definition of done:

- user can enter initial thought
- frontend calls conversation endpoint
- assistant response renders
- returned entry ID is stored for owner
- follow-up messages work
- demo state remains browser-only
- no unconnected buttons

## MVP build order

1. Scaffold final-shaped repo.
2. Define shared types.
3. Add product registry and public product pages.
4. Add fake AI conversation service.
5. Add conversation endpoint.
6. Add minimal editor UI.
7. Add database persistence.
8. Add passwordless auth.
9. Add owner/demo access rules.
10. Add real LLM provider.
11. Add usage limits.
12. Add private draft composition.
13. Add publishing to writing posts.
14. Add admin visibility.
15. Add intended forms.
16. Add research later.

## Self-hosting

The repo should include `.env.example` with:

```txt
OWNER_EMAIL=you@example.com
DATABASE_URL=postgres://...
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
DAILY_DEMO_REQUEST_LIMIT=50
HOSTED_AI_ENABLED=true
```

Self-hosters are responsible for:

- AI provider keys
- database setup
- auth configuration
- deployment
- usage limits

Hosted bring-your-own-key is not part of the current plan.

## Risks and guardrails

### Risk: AI agent creates ad hoc architecture

Guardrail:

- scaffold final package structure from day one
- create shared types before implementation
- enforce `AGENTS.md`

### Risk: UI appears complete but is not wired

Guardrail:

- no placeholder buttons or pages unless explicitly marked
- each task needs end-to-end definition of done

### Risk: demo writing is accidentally persisted

Guardrail:

- owner/demo branching in API layer
- repository methods only called for owner persistence
- tests for demo non-persistence

### Risk: assistant reflects or drafts too early

Guardrail:

- readiness state
- system prompt rules
- tests/examples around conversation policy

### Risk: product package becomes generic platform too early

Guardrail:

- explicit Socratic Draft route and service
- shared infrastructure only where real reuse exists
- no generic product engine for MVP
