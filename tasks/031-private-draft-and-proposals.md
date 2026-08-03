# Task 031 — Add private drafts, revision history, and approved proposals

## Goal

Create the user-owned private draft as a domain object separate from conversation,
with persisted revision history and assistant changes governed by explicit review
and approval.

## Why this task is next

The product can only demonstrate questioning before drafting once explored ideas
can become mutable writing without surrendering authorship to the assistant.

## Scope

Implements **Drafting and revision**, **Draft composition**, **Assistant
revision**, and the draft invariants in **Authority and invariants** from the
product architecture.

- Compose a private draft from selected workspace material after a direct user
  request or acceptance of an assistant offer.
- Support deliberately early or rough composition when requested.
- Allow unrestricted direct editing of one continuous canonical document.
- Save every canonical draft change as an immutable revision snapshot.
- Let the user inspect, compare, and restore retained revisions.
- Let the user attach one contiguous draft selection to a conversation message
  without requiring them to provide replacement language.
- Support discussion of selected writing or a bounded assistant proposal in
  response.
- Support contiguous-passage and whole-draft proposals with accessible review,
  acceptance, rejection, and amendment.
- Add temporary demo and durable owner persistence through product-owned ports.
- Establish the responsive conversation, idea-map, and draft workspace layout
  without treating the current host visual language as final product design.

## Settled constraints

### Draft ownership and composition

- A workspace has at most one canonical private draft. It is a product-owned
  resource distinct from conversation history and the idea map, and need not
  contain every important or explored idea.
- A direct request to compose or acceptance of an assistant offer is sufficient
  authorisation. Do not require a redundant second approval.
- Composition receives explicitly selected idea identifiers and only the
  relevant established syntheses, substance, unresolved uncertainty,
  user-established conversation language, and available preference guidance.
- A user may request an intentionally early or rough draft. Readiness remains
  advisory.
- The first successful composition creates the canonical draft and its first
  revision. It has no diff because no earlier draft exists.

### Canonical revisions and persistence

- Every successful initial composition, changed manual save, accepted proposal,
  or restoration creates an immutable, monotonically numbered draft revision.
- Use complete revision snapshots for the baseline rather than a dependent patch
  chain. Diffs are derived for presentation and are not persistence primitives.
- A revision records its complete body, source (`initial_composition`,
  `manual_edit`, `accepted_proposal`, or `restoration`), creation time, and the
  applicable proposal or restored-from revision provenance.
- The current draft retains its canonical body and current revision. Draft saves
  use an expected revision; stale saves preserve newer canonical work and return
  a recoverable conflict.
- Revision history is append-only. Restoring an earlier snapshot copies its body
  into a new canonical revision, preserves every intervening revision, advances
  the revision number, and does not call the generation model.
- Retain all revisions for the workspace lifetime in this baseline. Named
  versions, branching, merging, arbitrary revision deletion, and collaborative
  authors are not supported.
- Demo revisions and proposals live in the same in-memory temporary workspace as
  its conversation and idea map and expire or clear with it. Owner revisions and
  proposals are durable, owner-scoped, and available across sessions and
  browsers.
- Conversation/workspace deletion cascades to its draft, revision snapshots, and
  proposals.
- Product writing state is never persisted in cookies, `localStorage`, or
  IndexedDB. The client holds loaded and unsaved state only in the running app.
- Initial workspace loading returns conversation history, idea-map state, the
  canonical draft, all retained revision snapshots, and active proposal state.
  Lazy revision loading is deferred until demonstrated document size requires
  it.

### Manual editing and saving

- The draft behaves as one continuous editable document. Paragraphs or other
  rendered chunks are not durable domain entities.
- Moving focus from a changed draft into conversation, and attempting to send a
  message while draft changes are unsaved, saves the draft first. Do not add
  periodic autosaving while the user remains in the draft in this baseline.
- An unchanged focus transition creates no revision. If the required save fails,
  retain the unsaved content and do not let a subsequent message appear to use
  server context that excludes it.
- A successful manual save is canonical immediately and requires no assistant
  approval. Task 034 interprets the possible meaning of saved edits; its model or
  commentary failure must never roll back the save.
- Editor-level undo and redo may operate on current in-memory editor state.
  Persisted recovery uses revision preview and restoration rather than a
  destructive undo stack.

### Selected draft context

- The user can attach one contiguous sentence, paragraph, or passage to a
  conversation message as explicit context. Selection identifies what the user
  is discussing; it is neither replacement text nor automatic authorisation to
  change the draft.
- Selection context records the base draft revision, offsets, and exact selected
  text so a stale selection cannot be silently applied elsewhere.
- The assistant may discuss the selected passage, ask a question, or generate a
  bounded proposal. Conversation alone never changes canonical draft content.
- On a small screen, an attached selection remains in current app state while
  the user moves from Draft to Conversation, until it is sent or removed.

### Assistant proposals

- The first supported proposal scopes are one contiguous selected passage and
  the whole draft. Partial multi-hunk application is not supported.
- A proposal identifies its draft, base draft revision, exact original scope,
  user instruction, intended effect, exact proposed replacement or complete
  proposed body, proposal revision, and lifecycle state.
- Generating or amending a proposal never mutates canonical draft content.
- Amending a proposal creates a new revision of that proposal, not a draft
  revision. Rejection leaves the draft unchanged.
- Accepting a proposal verifies the base draft revision, applies the exact
  reviewed content without another model call, creates a draft revision, and
  resolves the proposal atomically.
- A proposal based on an older draft becomes stale and must never overwrite newer
  work. Regeneration, explicit rebase, or dismissal requires a new user choice.
- Draft creation, proposal lifecycle commands, and other retryable operations
  use explicit idempotency semantics so network retries cannot duplicate model
  work or canonical revisions.
- Product code owns separate provider-neutral operations or ports for draft
  composition and bounded proposal generation. Host adapters use `packages/ai`;
  product code must not import provider, Prisma, auth, or usage infrastructure.

### Proposal comparison and revision history UI

- Before acceptance, the user can inspect both the current content being
  replaced and the exact proposed content that will replace it.
- A sentence or paragraph proposal uses a localised inline comparison in context;
  a larger passage uses readable current and proposed views; a whole-draft
  proposal defaults to a readable proposed document with access to current and
  comparison views. Comparison must not rely on colour alone.
- Conversation may introduce a proposal, but the primary review surface belongs
  alongside the draft.
- A **History** control in the draft header opens a revision-history drawer. The
  drawer lists revisions newest first with revision, source, time, provenance,
  and current status; supports read-only preview, previous/next navigation, and
  comparison with the current draft; and restores only through an explicit
  **Restore this version** action.
- Previewing history never replaces the editable or canonical draft. Restoration
  explains that it creates a new revision and retains later history. On smaller
  screens the drawer may become a full-screen sheet with predictable focus and
  focus return.

### Workspace layout

- Desktop uses two independently scrolling, full-height columns: conversation is
  always visible on the left with a bottom-anchored, upward-growing message
  composer; the right workspace column toggles between Idea map and Draft.
- Before a draft exists, the right column defaults to Idea map. Each workspace
  view preserves its app state and scroll position when toggled.
- Smaller screens show one of Conversation, Idea map, or Draft at a time with
  explicit accessible navigation.
- Limited action-driven transitions may reveal the destination of a completed
  operation: successful composition or proposal acceptance reveals Draft;
  selecting an idea for exploration reveals Conversation; attaching selected
  draft text reveals Conversation while retaining the attachment.
- Automatic transitions follow an explicit completed user action, preserve
  useful focus, and announce the changed view. They must not make assistant
  preference behave like a hidden global mode.
- Use the current host design language for this slice. Final typography, spacing,
  animation, visual identity, and polished editor design remain a later product
  design effort.

### Interpretation and publishing boundaries

- Task 031 records enough manual-edit and restoration provenance for Tasks 032 and 034 to
  interpret their possible semantic effect. It does not infer that removing
  writing means the user rejects the underlying idea.
- A later interpretation may ask whether a restoration reflects changed belief,
  relevance, structure, or preferred wording. Idea-map meaning changes only
  after user-established confirmation, and interpretation failure never rolls
  back canonical writing.
- Publishing remains a separate, explicit, owner-only host operation.

## Out of scope

- Publishing, paragraph-as-entity storage, multi-hunk or partial proposal
  acceptance, periodic autosave while draft focus remains active, lazy revision
  loading, named versions, branching, merging, arbitrary revision deletion,
  collaborative editing, automatic long-term preference inference, manual-edit
  interpretation, and final product visual design.

## Expected files to create or modify

- draft shared/server/client modules under the product
- workspace orchestration and product HTTP commands for composition, saves,
  selections, proposals, history, and restoration
- product-owned draft persistence and model ports
- host AI adapters and owner database adapters
- Prisma schema and generated migration for owner drafts, revisions, and
  proposals
- deterministic composition/proposal models and expanded workspace store in the
  colocated product testing host
- domain, persistence, orchestration, HTTP, client, accessibility, host
  composition, database-adapter, and Playwright tests
- privacy docs, progress, decisions, and task index

## Definition of done

- Conversation, idea map, draft, revision, and proposal are separate observable
  concepts with the approved responsive workspace behaviour.
- Direct requests and accepted offers can create early or ready drafts from
  explicitly selected material.
- Manual saves are canonical revisions; assistant proposals cannot change the
  draft without review and approval.
- Contiguous selections can inform discussion or a targeted proposal without
  copy/paste or implicit mutation.
- Stale saves, selections, and proposals preserve newer canonical work.
- Accepting a proposal applies the reviewed content exactly once without another
  model call and records its revision atomically.
- Every retained revision can be previewed, compared with current content, and
  restored as a new revision without deleting later history.
- Demo state remains temporary; owner drafts and complete revision history are
  durable and available from another authenticated browser.
- Workspace deletion and demo clearing/expiry remove all associated private
  writing state.
- Deterministic browser tests cover the user-visible composition, editing,
  selection, proposal, comparison, acceptance/rejection/amendment, stale-state,
  history, restoration, and responsive navigation flows.
- Tests, browser tests, typecheck, build, database validation, and diff checks
  pass; progress and applicable decisions/privacy documentation are updated.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

## Risks / questions

- Complete snapshots deliberately favour simple and reliable restoration over
  storage optimisation. Revisit lazy loading or compaction only with measured
  document and history sizes.
- A continuous editor must preserve selection and ordinary writing behaviour
  without committing the product domain to a particular editor library.
- The responsive workspace must remain calm and accessible even though the
  current visual language is provisional.

## Decisions this task must settle during implementation

- Concrete opaque identifier types, request/response shapes, stable failure
  codes, and idempotency-key transport consistent with the settled semantics.
- The schema and transaction boundary for conditional saves, atomic proposal
  application, immutable revision insertion, and owner-scoped loading/deletion.
- The editor implementation used for the continuous-document baseline and the
  exact accessible focus mechanics of proposal review, history preview, and
  responsive surface transitions.
- Whether draft composition and proposal generation share a host model adapter
  while remaining distinct product operations, based on validation, usage, and
  failure behaviour.

If schema changes are required, edit the Prisma schema, validate it, generate and
review the migration, and never hand-edit generated migration SQL.

## Approval record

Approved on 2026-08-02 after review against the product brief, canonical
architecture, terminology, completed Task 030 behaviour, testing strategy, and
Tasks 032, 034, and 035.

- One continuous canonical draft is retained through complete immutable revision
  snapshots; paragraphs are selectable presentation regions, not domain objects.
- Persisted linear history covers initial composition, manual saves, accepted
  proposals, and restorations for both demo and owner workspace lifetimes.
- Revision history is server-owned product state, never browser persistence.
- Passage and whole-draft proposals are reviewed adaptively and applied exactly
  without regeneration.
- Task 034, not this task, owns semantic interpretation of saved edits and
  restorations.
- The responsive two-column/one-surface workspace behaviour is approved while
  final product look and feel is intentionally deferred.
- Conversation, draft, and proposal transitions are implemented once by
  product-owned stores over product-owned persistence ports. Prisma, temporary
  in-memory, and test implementations supply persistence mechanics without
  redefining product contracts or behaviour.
- Extractability is an acceptance criterion: moving Socratic Draft into an
  external package may require packaging changes but must not require any host
  implementation or missing product behaviour to move with it. Product code
  must not depend on the API host, database, auth, or AI infrastructure.
- Host adapters may import product-owned ports and types to implement them. They
  must not introduce parallel Socratic Draft record contracts; Prisma row types
  remain private implementation details of the durable adapter.
- These decisions should not be reopened during implementation without a cited
  higher-authority conflict or genuinely new evidence.

Corrective scope approved on 2026-08-02 after manual host testing and a full
review against `AGENTS.md`, `docs/code-quality.md`, `docs/testing.md`,
`docs/architecture.md`, and the canonical product architecture.

- Reopen Task 031 to correct model-call idempotency, transactional concurrency,
  exact manual-save semantics, proposal lifecycle enforcement, provider-error
  normalization, and complete initial workspace loading.
- Treat the observed hunger conversation as a required regression: ordinary
  user statements are writing material unless the user explicitly requests
  practical advice, and unadopted assistant hypotheses must not enter canonical
  idea-map content.
- Restore the approved responsive workspace in the real host and add portable,
  owner-aware navigation to saved conversations.
- Replace hand-rolled revision-history dialog behaviour with the established
  accessible interaction approach.
- Add real-host, mounted-host, behavioural, and concrete database regression
  coverage for the failures found during review.
- Publishing, preference learning, multi-user collaboration, and a broader
  visual redesign remain deferred.

Breadcrumb navigation addendum approved on 2026-08-02:

- Replace every page's decorative eyebrow caption with one semantic breadcrumb
  landmark in the same visual position.
- Ancestors are navigable, the current page is non-linked and marked with
  `aria-current="page"`, and private conversation identifiers never appear.
- The host owns breadcrumb rendering. Socratic Draft owns portable breadcrumb
  metadata for its routes and remains independent of host UI components.
- Primary navigation, route paths, responsive collapsing, and breadcrumb menus
  remain unchanged or deferred.
- Gated real-Prisma integration coverage now verifies both conversation and
  draft persistence concurrency, idempotency, rollback, owner scoping, and
  cascade mechanics using randomized self-cleaning records.

## Status

Completed on 2026-08-02 after the approved corrective scope and validation.
