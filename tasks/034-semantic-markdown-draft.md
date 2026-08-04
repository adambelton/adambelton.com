# Task 034 — Migrate the canonical Draft to constrained semantic Markdown

## Goal

Let the user organise and express the canonical Draft with a small, accessible
set of semantic document structures while preserving user authority, immutable
revision history, exact reviewable assistant proposals, and product-owned
behaviour independently of the chosen editor engine.

## Depends on

Task 033.

The approved editor investigation established MDXEditor as the presumptive
engine. Its durable findings are recorded in the product README's semantic
editor implementation boundary.

## Why this task is next

The current Draft is stored and edited as undifferentiated plain text. That was a
valid baseline, but it cannot represent headings, lists, quotations, links,
emphasis, code, thematic separation, or a semantic intention to place an image.
Those structures can express the organisation and meaning of the user's writing;
they are not merely destination-specific presentation.

Task 035 will interpret meaningful saved changes automatically. Implementing it
against the current flat-text `DraftChange`, selection offsets, and string-slice
proposal operations would deepen contracts that cannot represent semantic
structure. This task establishes the canonical semantic boundary first so Task
035 can classify textual and structural changes honestly.

The editor spike found MDXEditor suitable as the presumptive editing engine. It
also found that its built-in source mode, link and image dialogs, and keyboard
focus behaviour are not acceptable as the product boundary without server-side
validation and product-owned accessible controls.

## Scope

- Define a versioned, product-owned constrained Markdown dialect as canonical
  Draft content. Markdown remains a product contract; MDXEditor and its Lexical
  state remain client implementation details.
- Support only semantic writing structure justified by the current product:
  - paragraphs;
  - a deliberately selected document-local heading hierarchy;
  - strong and emphatic text;
  - ordered and unordered lists;
  - block quotations;
  - links;
  - thematic breaks;
  - fenced code blocks where supported safely;
  - semantic image placeholders with description, purpose, proposed alt text,
    and optional caption.
- Define deterministic normalization so semantically identical editor output
  does not create noisy canonical revisions. The normal form includes an
  explicit trailing-newline rule and one spelling for supported Markdown
  constructs.
- Parse and validate canonical Markdown on the server before every composition,
  save, proposal, amendment, acceptance, and restoration operation. Reject
  arbitrary HTML, MDX/JSX, unsupported directives, unsafe links, and unsupported
  document structure without replacing valid canonical content.
- Adapt model composition and revision ports to request the supported semantic
  Markdown and validate model output before it can become a Draft or revision
  proposal. Invalid model structure fails safely and does not fabricate a valid
  draft operation.
- Preserve complete immutable revision snapshots, monotonic revision numbers,
  provenance, restoration semantics, idempotency, and optimistic concurrency.
- Replace flat source-offset selection assumptions with a revision-bound,
  product-owned semantic selection contract that can represent selections across
  inline marks and block boundaries without persisting Lexical node keys.
- Revalidate every attached selection against the exact canonical Draft revision
  before using it in conversation or a proposal.
- Preserve passage-level and whole-draft assistant revision proposals. A proposal
  retains the exact reviewed semantic replacement and acceptance applies that
  result without regeneration while preserving unaffected surrounding structure.
- Replace the flat textual `DraftChange` contract with an exact bounded change
  representation capable of distinguishing prose changes from semantic mark,
  link, block-structure, code, and image-placeholder changes. Persistence remains
  complete snapshots; changes remain derived rather than stored as an editor
  transaction log.
- Integrate MDXEditor behind one product-owned client adapter rather than import
  it throughout the workspace.
- Restrict the demo toolbar to the supported dialect and do not expose Markdown
  source mode, arbitrary HTML, MDX, layout, or presentation controls.
- Provide product-owned accessible editor controls, including heading/paragraph,
  strong, emphasis, lists, quotation, link creation/editing/removal, thematic
  break, code where included, image-placeholder insertion/editing/removal, undo,
  and redo.
- Provide an explicit keyboard route into and out of the editing surface and
  restore focus deliberately after toolbar and dialog operations.
- Make formatting state, validation failures, save state, stale conflicts, and
  proposal review understandable without relying on colour or visual position.
- Migrate or version existing temporary fixtures and durable owner Drafts without
  silently interpreting old Markdown punctuation as newly intended structure,
  changing rendered prose, deleting history, or falsifying revision provenance.
- Update deterministic product, HTTP, adapter, client, and browser coverage, and
  manually verify the migrated owner flow through the real host composition with
  pending migrations applied.

## Ownership and architectural boundaries

- Drafting owns the supported Markdown dialect, normalization, validation,
  semantic selection and change contracts, revision and proposal rules, and the
  product ports required to compose or revise semantic Draft content.
- The MDXEditor adapter belongs to the product client because it translates the
  product's semantic editing contract into one chosen client engine. It must not
  define canonical meaning.
- Workspace application orchestration continues to coordinate cross-capability
  operations without recreating Markdown parsing, revision, or proposal rules.
- Product delivery validates request shape and invokes drafting operations; it
  does not implement document semantics.
- The API host supplies concrete AI and persistence adapters. It must not decide
  the Markdown dialect, normalize content, or interpret semantic changes.
- `packages/db` owns schema and storage mechanics required by the approved
  compatibility strategy, but the product owns the meaning and transitions of
  every Draft representation.
- Draft Format remains optional free-text guidance naming the intended literary
  form. It is distinct from document formatting and remains behaviourally inert
  in this task.
- Semantic document structure belongs to the private Draft. Typography, colour,
  spacing, page layout, responsive presentation, public metadata, asset delivery,
  and publication remain destination or host concerns.
- Conversation history and the idea map remain distinct representations. Draft
  headings or paragraphs do not automatically become ideas or conversation
  messages.

## Out of scope

- Activating Draft Format as model guidance, a template, or a structural rule.
- Real image uploads, private asset persistence, R2, image transformation, asset
  retention, image promotion, or media-library behaviour.
- Publishing, public `WritingPost` creation, CMS selection or integration,
  repository publication, frontmatter, previews, or public rendering.
- Font family, font size, colour, alignment, columns, floating images, margins,
  page layout, templates, or themes.
- Tables, footnotes, comments, arbitrary embeds, arbitrary directives, arbitrary
  HTML, MDX/JSX, or general block-builder behaviour without new evidence.
- Markdown source editing in the demo.
- Multiple Drafts, branching revision history, collaborative editing, named
  versions, or another persistence/history mechanism.
- Automatic substantive-edit interpretation, potential conflicts, or other Task
  035 behaviour beyond providing the semantic `DraftChange` it will consume.
- Preference evidence or advance work on Task 036.
- Real owner image nodes. This task must leave a narrow extension point for them
  without adding non-working upload controls or speculative asset contracts.

## Expected files to create or modify

- `packages/products/src/socratic-draft/shared/` for versioned Draft content,
  semantic selections, semantic changes, proposal, and operation contracts
- `packages/products/src/socratic-draft/server/capabilities/drafting/` for the
  supported dialect, normalization, validation, selection resolution, change
  derivation, composition, revision, restoration, and proposal operations
- `packages/products/src/socratic-draft/server/capabilities/drafting/ports/` for
  semantic composition/revision model and persistence requirements
- `packages/products/src/socratic-draft/server/application/workspace/` only where
  semantic Draft results change existing cross-capability coordination
- `packages/products/src/socratic-draft/server/delivery/http/` for revised Draft,
  selection, proposal, and validation request/response contracts
- `packages/products/src/socratic-draft/client/workspace/` for the product-owned
  MDXEditor adapter, accessible controls, selection attachment, save, history,
  restoration, and proposal review
- `apps/api/src/products/socratic-draft/adapters/ai/` for host translation of the
  revised product model ports
- `apps/api/src/products/socratic-draft/adapters/persistence/` for temporary
  compatibility with the product-owned Draft persistence contract
- `packages/db/src/adapters/socratic-draft/`, `packages/db/prisma/`, and a
  generated migration if the approved compatibility strategy requires stored
  representation metadata
- product-owned fakes, fixtures, browser scenarios, and hosted evaluations
- focused host-adapter and database integration tests
- the canonical product README, architecture, implementation overview,
  terminology clarification, `docs/decisions.md`, and `progress.md`

The implementation must not introduce a document-format column or migration
merely because one seems conventional. The chosen compatibility strategy must
be derived from the invariants above and recorded explicitly.

## Definition of done

- The canonical Draft accepts and retains every supported semantic construct and
  rejects unsupported content before persistence.
- The rich editor exposes only the supported demo capability and cannot use
  source mode or paste to bypass the canonical server validator.
- Repeated load, edit, save, reload, and restoration cycles produce deterministic
  normalized Markdown without incidental revisions.
- Existing plain-text Drafts and every retained historical revision remain
  readable and restoreable with their rendered prose, order, provenance, and
  user authority preserved.
- Direct user edits still become canonical only through a successful revision-
  checked save. Validation failure leaves the last valid canonical revision
  unchanged and reports the problem honestly.
- Model composition and revision output cannot introduce unsupported Markdown,
  HTML, MDX, unsafe links, or unknown directives into a Draft or proposal.
- A user can attach a selection spanning formatted inline content and multiple
  blocks; the server revalidates it against the exact base revision.
- Passage and whole-draft proposals preserve semantic structure, remain
  non-canonical until accepted, become stale when their base revision advances,
  and apply the exact reviewed result without regeneration.
- Revision history compares and previews semantic Drafts accessibly and restores
  a selected snapshot only by creating a new monotonically numbered revision.
- Derived `DraftChange` distinguishes meaningful text, mark, link, block,
  placeholder, and code changes without treating serializer normalization or
  editor metadata as an authorial change.
- Demo users can add, edit, move through, export later, and remove semantic image
  placeholders without seeing a disabled upload control.
- Links can be created, edited, removed, selected for discussion, and preserved
  through revision proposals using product-owned accessible UI.
- Keyboard-only use can enter and leave the editor, reach every supported
  control, dismiss dialogs, recover prior focus, and complete save, selection,
  proposal, history, and placeholder flows without a trap.
- Screen-reader inspection exposes document structure, active formatting,
  controls, errors, placeholder fields, proposal changes, and save/conflict
  outcomes coherently.
- Draft Format remains saved and inspectable but has no effect on semantic
  content, composition, revision, or conversation.
- Deterministic tests cover parsing, normalization, validation, compatibility,
  semantic selections, changes, proposals, HTTP, adapters, client behaviour, and
  complete browser flows.
- After automated validation passes, the complete temporary and authenticated
  owner flows are exercised manually through the real local host composition,
  with pending migrations applied and keyboard plus VoiceOver checks recorded.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

Run gated real-Prisma adapter tests when `DATABASE_URL` is available. Run focused
hosted composition and revision evaluations when credentials and intended model
usage are available. Neither replaces deterministic coverage or real-host manual
verification.

## Decisions this task must settle during implementation

- The exact supported Markdown grammar, canonical serializer options, trailing-
  newline rule, maximum nesting, heading hierarchy, safe-link schemes, and code-
  fence policy.
- The minimal image-placeholder directive syntax and validation rules.
- Whether deterministic normalization is implemented over MDAST or another
  product-owned parsed representation without making that library's nodes part
  of public product contracts.
- The durable semantic selection address and how it maps editor selections to a
  canonical source revision without Lexical node keys or ambiguous text matching.
- The smallest semantic `DraftChange` contract Task 035 needs, including how
  multiple edits in one save are bounded and presented.
- How passage proposal ranges and replacements are represented and reapplied
  safely across inline marks and block boundaries.
- How model output is requested, parsed, normalized, and rejected while keeping
  provider details outside the product.
- The compatibility strategy for existing plain-text current Drafts and retained
  revisions, including whether stored representation metadata or a migration
  revision is required.
- How server-driven restoration and proposal acceptance update MDXEditor without
  losing focus unexpectedly, misrepresenting undo, or overwriting unsaved work.
- Which MDXEditor UI pieces can be retained after accessibility verification and
  which require product-owned replacements.
- Whether fenced code blocks are included initially based on complete keyboard,
  screen-reader, selection, normalization, and proposal evidence.

## Risks / questions

- Markdown source offsets and rendered editor selections are different coordinate
  systems. An ambiguous or editor-specific selection contract would weaken exact
  revision and proposal guarantees.
- A serializer can rewrite punctuation or whitespace without changing meaning;
  those rewrites must not create distracting history or Task 035 interpretations.
- Existing plain text may contain Markdown punctuation that the user never
  intended as structure. Compatibility must preserve meaning rather than merely
  parse old bytes as the new format.
- Markdown permits HTML and extensibility beyond the supported dialect. Client
  plugin restriction cannot replace authoritative server validation.
- Model-friendly Markdown still requires output validation; a model must not be
  trusted to obey the dialect or return a safe complete document.
- Nested content, custom directives, code, and links increase paste, selection,
  comparison, and proposal edge cases quickly. The dialect must remain small.
- Rich editing creates a materially larger accessibility surface than the current
  textarea. Built-in editor controls are not presumed accessible merely because
  their underlying engine has accessibility support.
- Rewriting existing snapshots in place could falsify immutable history, while a
  visible migration revision could look like an authorial edit. The chosen
  strategy must record the distinction honestly.
- The task is a prerequisite correction to the Draft representation, not an
  opportunity to activate Draft Format, build publishing, or expand into a CMS.

## Blast radius

High: canonical Draft contracts, revisions, selections, changes, composition and
revision model ports, proposal application, persistence compatibility, HTTP,
client editing and accessibility, deterministic fixtures, browser scenarios,
and documentation. The work requires a separate review and explicit approval
before implementation.

## Approval record

- Approved by Adam on 2026-08-04 after review of the editor spike and the
  distinction between semantic writing structure and publishing presentation.
- The canonical Draft will become versioned constrained semantic Markdown;
  MDXEditor is the presumptive client engine but does not own the product format.
- The supported initial vocabulary remains deliberately small and semantic.
  Presentation controls, source mode, arbitrary HTML/MDX, CMS behaviour,
  publishing, and real image assets are intentionally excluded.
- Demo users receive semantic image placeholders, not disabled upload controls.
  Real owner image upload remains deferred while the editor retains a narrow
  future extension point.
- Draft Format remains optional intended-form guidance and behaviourally inert.
  This task must not turn it into a template, mode, or structural rule.
- Immutable history, exact reviewed proposal acceptance, user authority,
  optimistic concurrency, server-owned state, and product/host dependency
  boundaries are intentional constraints and must not be weakened for editor
  convenience.
- Implementation must settle the dialect, compatibility strategy, semantic
  selection and `DraftChange` contracts, proposal application, model validation,
  and accessible editor controls using the decision criteria in this proposal.
- A Tiptap comparison is not required unless implementation uncovers a specific
  MDXEditor architectural failure that the completed spike did not expose.
- The approval does not authorize committing, pushing, opening a pull request,
  publishing content, provisioning storage, or implementing later tasks.

## Status

Approved on 2026-08-04. Implementation in progress.
