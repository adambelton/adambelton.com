# Task 028 — Implement the idea-map baseline

## Goal

Make the assistant's interpretation of the developing thought visible and
negotiable through a small expandable idea tracker.

## Why this task is next

The idea map is the first concrete bridge between private conversation and the
shared model of what the user is trying to say.

## Scope

Implements **Idea map**, the **Idea action** principal flow, and the idea-map rows
in **State ownership** from the product architecture.

- Identify and update a bounded set of ideas from conversation.
- Track qualitative exploration and contextual importance separately.
- Preserve separate user and assistant assessments.
- Show expandable summaries and unresolved questions.
- Let the user focus, park, dismiss, and reopen an idea.
- Give equivalent conversational instructions and UI actions the same meaning.
- Ensure subsequent assistant behaviour respects user dispositions while retaining
  relevant interpretive tension.

## Settled constraints

- The idea-map capability owns idea identity, shared summaries, assistant
  assessments, explicit user intentions, dispositions, and unresolved questions.
  Conversation and workspace orchestration may invoke its operations but must not
  mutate that state directly.
- Each idea must have a stable product identity and may hold a negotiated/shared
  summary, unresolved questions, an assistant interpretation, an explicit user
  interpretation or intention, and a visible disagreement between them.
- Assistant-perceived exploration and contextual importance are independent,
  qualitative interpretations. Neither may be represented as an objective
  percentage or a general completion value.
- User-controlled meaning includes correction and, where exercised by this slice,
  importance, desired depth, intended role, and disposition. A user action must
  not rewrite an assistant assessment merely to manufacture agreement.
- Focus, park, dismiss, reopen, and correct are product-language operations.
  Equivalent conversational and interface commands invoke the same operation;
  conversation may first resolve the referenced idea while the UI supplies its
  identity directly.
- Parked and dismissed ideas remain available as historical context. They must
  not silently become active again without new evidence and appropriate user
  involvement.
- Subsequent conversation context includes current user dispositions and
  meaningful disagreement, while remaining bounded and purpose-specific.
- Model-produced changes are validated into product-owned contracts before they
  change idea-map state. Invalid assessment must not corrupt retained state.
- Demo and owner work use the same idea-map concepts. Temporary state follows
  the existing application-memory expiry semantics; durable owner operations are
  owner-scoped through host persistence adapters.
- Idea-map changes produce explicit product events only after the corresponding
  operation succeeds; this task must not add a generic event bus or event table.

## Out of scope

- Graph visualisation, precise percentages, complex relationships, drafts, or
  persistent cross-work learning.

## Expected files to create or modify

- idea-map domain/client/server modules under the Socratic Draft product
- workspace orchestration and product HTTP contracts
- product-owned persistence ports plus temporary and durable host adapters;
  Prisma schema and generated migration where durable owner state requires them
- behavioural and rendering tests, progress, and task index

## Definition of done

- A user can inspect, correct, focus, dismiss, and reopen assistant-detected ideas.
- Assistant and user views can differ without either being silently overwritten.
- UI and conversation controls affect subsequent responses consistently.
- Parked or dismissed ideas remain historical without silently returning to
  active consideration.
- Invalid model assessment leaves the existing idea map intact.
- Temporary and durable adapters preserve the same product semantics and their
  existing privacy boundaries.
- Tests, typecheck, build, and diff checks pass; progress is updated.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- The UI must communicate interpretation without false authority or visual noise.
- Model assessment may need separation from response generation; decide here only
  with concrete evaluation examples.

## Decisions this task must settle

- The bounded maximum number of active/retained ideas and the behavior when the
  bound is reached.
- How model-surfaced ideas retain stable identity across renaming, merging, and
  splitting.
- Whether structured idea assessment and conversational generation share one
  model operation or use separate product-owned operations, based on validation,
  cost, latency, and failure isolation.
- Whether current parallel assessments plus conversation history are sufficient
  or explicit assessment history is required for coherent persistence.
- The qualitative vocabularies and accessible presentation for exploration and
  contextual importance.
- The minimal disposition and user-assessment vocabulary exercised by focus,
  park, dismiss, reopen, and correct operations.
- The version or merge policy for overlapping conversational and UI idea changes.
- For each explicit idea action, whether silence, concise acknowledgement, or an
  immediate conversational response is useful.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Status

Proposed. Awaiting approval.
