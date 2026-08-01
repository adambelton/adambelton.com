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
- Maintain a concise title, distilled synthesis, and higher-resolution substance
  for each idea as exploration develops.
- Track qualitative exploration and contextual importance separately.
- Preserve explicit user interpretation separately from qualitative assistant
  exploration and contextual-importance assessments.
- Show expandable syntheses, inspectable substance, and unresolved questions.
- Let the user focus, satisfy, park, dismiss, and reopen an idea.
- Give equivalent conversational instructions and UI actions the same meaning.
- Ensure subsequent assistant behaviour respects user dispositions while retaining
  relevant interpretive tension.

## Settled constraints

- The idea-map capability owns idea identity, titles, shared syntheses, idea
  substance, qualitative assistant assessments, explicit user intentions, dispositions, and
  unresolved questions.
  Conversation and workspace orchestration may invoke its operations but must not
  mutate that state directly.
- Each idea has a stable product-generated identity, a concise title, a
  negotiated/shared synthesis, higher-resolution substance, unresolved questions,
  an explicit user interpretation or intention, and qualitative exploration and
  contextual-importance assessments. The synthesis distils the current shape
  for the idea-map UI. The substance is the lightly curated body of distinctions,
  experiences, examples, tensions, perspectives, counterarguments, uncertainties,
  and useful language uncovered through exploration; it may grow to several
  paragraphs and contain substantially more than a later draft uses.
- Canonical titles, syntheses, substance, and unresolved questions contain only
  material expressed by the user or assistant language the user explicitly
  adopts, confirms, corrects, or meaningfully develops. Assistant hypotheses may
  guide the next conversational move but must not be persisted or displayed as
  idea material before the user engages with them.
- Sustained exploration should normally enrich an existing idea rather than
  fragment every facet into a new identity. Product-generated identities remain
  stable across renaming, correction, refinement, and reassessment. The model may
  reference supplied identities or propose a new unidentified idea, but may not
  generate canonical identities or autonomously merge or split ideas in this
  baseline.
- Assistant-perceived exploration and contextual importance are independent,
  qualitative interpretations. Neither may be represented as an objective
  percentage or a general completion value.
- User-controlled meaning includes correction and, where exercised by this slice,
  importance, desired depth, intended role, and disposition. A user action must
  not rewrite an assistant assessment merely to manufacture agreement.
- Focus, satisfy, park, dismiss, reopen, and correct are product-language
  operations. Active, focused, satisfied, parked, and dismissed are the baseline
  dispositions; reopen returns a satisfied, parked, or dismissed idea to active.
  Equivalent conversational and interface commands invoke the same operation;
  conversation may first resolve the referenced idea while the UI supplies its
  identity directly.
- Parked and dismissed ideas remain available as historical context. They must
  not silently become active again without new evidence and appropriate user
  involvement.
- Subsequent conversation context includes current user dispositions and
  meaningful disagreement, while remaining bounded and purpose-specific.
- Canonical substance is not shortened merely to fit one model request. Bounded
  context gives the focused idea priority, may include its relevant substance,
  and uses syntheses or minimal disposition context for other ideas according to
  the operation.
- Model-produced changes are validated into product-owned contracts before they
  change idea-map state. Invalid assessment must not corrupt retained state.
- Conversation response generation and proposed idea-map changes begin as one
  structured model operation using the current bounded idea map. Its response and
  idea-change sections are validated independently so an invalid idea assessment
  may degrade to a retained conversation response without mutating the map. This
  topology must be checked against curated multi-turn evaluation examples during
  implementation and separated only if combined generation materially harms
  quality, validation, latency, cost, or failure isolation.
- The idea map has a monotonic whole-map revision. A meaningful synthesis,
  substance, assessment, question, user-intention, or disposition change creates
  a versioned snapshot linked to its successful originating operation or
  conversation turn. A turn that makes no map change continues to reference the
  current revision rather than duplicating it. Ordinary reads and model context
  use the latest revision; historical revisions do not require timeline or
  restoration UI in this baseline.
- Mutations supply the revision they were based on. A stale mutation returns a
  recoverable conflict rather than silently overwriting or merging newer state.
  Generated stale work is not regenerated automatically. The client preserves
  rejected input where applicable and pauses other server-mutating controls in
  the same tab while an operation is in flight; reading and non-mutating
  expand/collapse interactions remain available.
- Demo and owner work use the same idea-map concepts. Temporary state follows
  the existing application-memory expiry semantics; durable owner operations are
  owner-scoped through host persistence adapters.
- Idea-map changes produce explicit product events only after the corresponding
  operation succeeds; this task must not add a generic event bus or event table.
- The initial product-policy limits are twelve retained ideas, six ideas in active
  or focused dispositions, and one focused idea. Parked, satisfied, and dismissed
  ideas remain retained but do not consume an active slot. Reaching a limit must
  not silently evict, merge, park, dismiss, or reactivate an idea. The values live
  in one adjustable product-policy location rather than schema constraints and
  are explicitly provisional pending evidence from complete-product use.
- Direct UI idea actions update without a hosted model call or synthetic assistant
  message and provide a concise local acknowledgement. Equivalent conversational
  actions retain an appropriate concise assistant response. Exact wording,
  placement, and response usefulness remain subject to browser review during the
  implementation.

## Out of scope

- Graph visualisation, precise percentages, complex relationships, drafts, or
  persistent cross-work learning.
- Autonomous idea merging or splitting, idea-map history browsing or restoration,
  product analytics, real-time multi-user collaboration, or WebSockets.

## Expected files to create or modify

- idea-map domain/client/server modules under the Socratic Draft product
- workspace orchestration and product HTTP contracts
- product-owned persistence ports plus temporary and durable host adapters;
  Prisma schema and generated migration where durable owner state requires them
- behavioural and rendering tests, progress, and task index

## Definition of done

- A user can inspect, correct, focus, dismiss, and reopen assistant-detected ideas.
- A user can inspect an idea's synthesis and its higher-resolution substance, and
  can mark the idea satisfied when it is developed enough for their current
  purpose.
- Sustained exploration enriches an existing idea's substance without routinely
  replacing it with a thin summary or splitting its facets into separate ideas.
- User interpretation may differ from the qualitative assistant assessment
  without either being silently overwritten.
- UI and conversation controls affect subsequent responses consistently.
- Parked or dismissed ideas remain historical without silently returning to
  active consideration.
- Invalid model assessment leaves the existing idea map intact.
- Meaningful idea-map changes create coherent versioned snapshots; stale
  operations cannot overwrite newer state.
- Same-tab controls prevent ordinary overlapping mutations while keeping retained
  work readable.
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
- The UI must not expose transient assistant hypotheses or present speculative
  themes, causes, formats, audiences, or strategies as established idea material.
- Rich idea substance and version snapshots increase private state size; context,
  retention, and rendering must remain bounded without truncating canonical
  meaning.
- A combined response/assessment model operation must be evaluated across a
  focused 10–20-turn exploration, identity preservation, correction,
  disagreement, conversational actions, and invalid structured changes.

## Settled implementation decisions

- Exploration uses `emerging`, `developing`, and `well_explored`. Contextual
  importance uses `background`, `supporting`, and `central`. The client presents
  both as qualitative assistant assessments in text, without percentages, progress bars,
  traffic-light scoring, or colour as the only signal.
- The baseline user-controlled interpretation is a correction/preferred
  expression plus disposition. Focus represents desired attention now; satisfied
  means the user considers the idea developed enough for its current purpose;
  park retains it for possible later attention; dismiss excludes it from current
  work. Assistant exploration may still differ from user satisfaction.
- Current and historical map revisions are retained as defined above, but the
  normal UI and model context consume only the latest revision. Conversation
  history remains distinct from idea-map revision history.
- Whole-map optimistic revision checking is the baseline conflict policy. Do not
  add automatic operation merging before real usage demonstrates the need.

## Required follow-ups

- Reassess idea-count limits after sustained use of the complete product and, if
  broader use is introduced, against aggregate evidence. A later privacy-reviewed
  analytics task may collect content-free counts such as typical active ideas,
  limit encounters, disposition actions, corrections, disagreements, conflicts,
  and invalid assessments; it must never collect private idea or conversation
  content.
- Plan autonomous, user-correctable idea merge and split behaviour after stronger
  conversational interpretation exists and before the editor is considered fully
  functional. It must preserve identity history and downstream references rather
  than silently collapsing or fragmenting ideas.
- Revisit idea-action acknowledgements through browser use after the baseline is
  implemented.
- Treat real-time multi-user work as a future product direction. WebSockets may
  reduce stale views but do not replace authoritative revisions, conflict rules,
  permissions, attribution, or collaborative editing semantics.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Status

Completed.
