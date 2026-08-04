# Task 032 — Expose saved draft changes for user-directed discussion

## Goal

Let a user deliberately bring an exact saved edit or restoration into Discovery
without adding automatic semantic classification or another history mechanism.

## Why this task is next

Task 031 retains exact revisions but subsequent conversation cannot identify the
change the user just made. This is the smallest vertical bridge from Composition
back to Discovery and establishes the product contract required by later
interpretation work.

## Scope

- Derive a product-owned `DraftChange` from the previous and committed revision.
- Cover manual saves and restorations using existing immutable revision history.
- Return the change with a successful operation without changing save atomicity.
- Offer an explicit “Discuss this edit” action after a changed save or restore.
- Send bounded exact change context to conversation as discussion-only context.
- Clear or replace stale change context when the draft advances again.

## Settled constraints

- The save or restoration succeeds independently of change derivation or later
  conversation failure.
- `DraftChange` uses product language and existing revision identities; it is not
  a second persisted history, preference, or idea-map mutation.
- Discussion happens only after an explicit user action in this slice.
- The context identifies removed and added text conservatively and may represent
  a whole-document replacement when a useful bounded range cannot be derived.
- Conversation may ask what the edit means but must not canonise an interpretation
  until the user establishes it.
- Product code remains independent of host, database, auth, and AI infrastructure.

## Out of scope

- Model classification, automatic commentary, automatic idea-map changes,
  preference evidence, schema changes, or retrospective revision analysis.

## Expected files to create or modify

- product draft-change shared/server modules
- draft operation and HTTP response contracts
- conversation context handling
- editor save/restore discussion interaction
- focused product and browser tests
- task/progress documentation

## Definition of done

- A changed save and a restoration each expose the exact committed change.
- The user can attach that change to conversation with one explicit action.
- Conversation receives revision-bounded discussion context and never changes the
  canonical draft merely by discussing it.
- Unchanged saves, stale saves, and failed saves expose no misleading change.
- Existing Task 031 flows remain green.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

## Risks / implementation decisions

- Settle the minimal bounded change representation and replacement fallback.
- Settle whether the explicit action pre-fills neutral conversation language or
  attaches context while leaving the composer empty.
- Keep the slice small: no persistence migration and no new hosted model port.

## Approval record

Approved on 2026-08-02 after the post-Task-031 roadmap and blast-radius review.

- This task intentionally proves explicit change handoff before introducing
  automatic interpretation.
- Existing revision snapshots remain the only durable draft history.
- Automatic classification, idea-map offers, and preference evidence are
  deferred to Task 035 and must not be pulled into this implementation.
- No database schema change is expected; new evidence is required before
  expanding that boundary.
- The task should normally remain within product-owned contracts, orchestration,
  client interaction, and tests.

## Status

Completed on 2026-08-03.

The implementation derives bounded exact `DraftChange` values from adjacent
immutable revisions after changed manual saves and restorations, returns them
without changing write atomicity, validates them against the current canonical
revision before conversation use, and exposes them through an explicit one-shot
“Discuss this edit” attachment. No persistence, automatic interpretation,
idea-map mutation, or preference evidence was added.

## Corrective pass proposal

### Goal

Correct the workspace layout and model-policy failures confirmed through manual
testing of the mounted owner flow, without expanding Task 032 into automatic
edit interpretation or a new workspace capability.

### Why this corrective pass is next

The saved-change handoff works, but testing it exposed regressions in already
approved Task 028–031 behaviour. The mounted workspace does not provide the
approved full-height editor layout; canonical idea material and composed drafts
are written as assistant-facing reports; internal assessment and unresolved-
question scaffolding leaks into the draft; and discussion of a saved edit can
canonise unconfirmed meaning or editing workflow state. These failures make the
current pull request misleading to evaluate even though revision persistence is
internally consistent.

### Scope

- Constrain the desktop workspace to the remaining viewport height with two
  equal-height columns and no page-length growth caused by workspace content.
- Keep the conversation composer anchored at the bottom of the left column.
- Give conversation history the remaining height, align short history to the
  bottom, start long history at the latest message, and scroll history internally.
- Give the right workspace the same bounded height and let the draft editor fill
  and scroll within its available space without losing its controls.
- Require idea titles, syntheses, substance, and unresolved questions to read as
  the user's own first-person material, never as notes about "the user" or as a
  transcript with quoted evidence.
- Preserve traceability and user authority while preventing unconfirmed
  assistant hypotheses, saved-change interpretations, editing instructions,
  proposal-scope questions, and preference metadata from entering canonical
  idea material.
- Give draft composition an explicit product-owned input view containing only
  eligible writing material rather than exposing the complete internal `Idea`
  representation to the generation adapter.
- Require composed draft bodies to read as the user's writing and prohibit idea
  labels, assistant assessments, dispositions, unresolved-question lists,
  provenance language, or other workspace scaffolding from appearing as draft
  content unless the user explicitly asked to write about that material.
- Prevent conversation from claiming that an edit will occur when no working
  draft command follows. Use the existing proposal interaction for ambiguous
  revision requests, or give an accurate conversational handoff to that
  interaction; do not add an unconnected editing promise.
- Add deterministic and hosted behavioural regressions based on the inspected
  conversation, including manual-edit discussion, explicit UK spelling, and
  early composition from a developing idea.

### Out of scope

- Automatic substantive-edit classification or commentary, preference storage,
  inferred preference evidence, retrospective repair of existing records,
  database-schema changes, publishing, final visual design, or a general
  natural-language command framework.
- Optional intended draft form. This should be proposed as a separate vertical
  slice because it changes workspace contracts, context assembly, persistence,
  controls, and behavioural evaluation beyond this corrective pass.

### Intended-form follow-up recommendation

Move **intended form** out of the publishing concept and make it optional private
workspace guidance. A user may establish, change, or clear an intended form at
any point, including before Discovery begins. Examples include journal entry,
personal essay, blog post, case study, project write-up, opinion piece, or a
user-described form. It must not create a mode, gate progress, imply publication,
or be required for effective Discovery.

When present, intended form may subtly influence useful framing and the material
the assistant helps uncover, but it must not replace inquiry into what the user
actually thinks or lead the assistant to impose a predetermined structure. The
absence of intended form must remain a fully supported default. Forms should be
user-extensible records rather than a hardcoded enum, consistent with the
existing product brief.

A later proposal should update the product brief's current rule that form is
only considered after publishing intent, distinguish intended form from audience
and visibility, and decide whether initial storage is workspace-scoped only or
durable for owner workspaces.

### Expected files to create or modify

- product workspace layout and editor components
- conversation and idea-map policy/context modules
- draft composition contracts and host model adapter
- focused product, host-adapter, browser, and hosted-evaluation scenarios
- Task 032, progress, and applicable decision documentation

No persistence migration is expected.

### Definition of done

- At desktop sizes, both workspace columns remain within the available viewport;
  the composer stays at the bottom, conversation history scrolls independently
  with the latest message visible, and the draft fills and scrolls within the
  right column.
- At smaller sizes, the existing one-surface navigation and state preservation
  remain intact.
- New and enriched ideas use first-person user perspective while retaining only
  user-established meaning.
- Discussing a saved edit cannot add an unconfirmed interpretation, editing
  workflow, or preference fact to canonical idea material.
- Draft composition produces continuous user-authored writing and cannot expose
  internal idea-map or assistant-assessment scaffolding.
- Ambiguous conversational editing requests do not claim a mutation occurred and
  lead to an existing working review path without changing the draft implicitly.
- The inspected failure scenario and ordinary no-form Discovery/composition flows
  are covered by deterministic tests; focused hosted evaluations exercise the
  model-dependent perspective and boundary requirements.
- Existing Task 031–032 persistence, revision, proposal, saved-change, responsive,
  and extractability coverage remains green.

### Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

Run the focused hosted conversation/composition evaluations when credentials are
available; they remain non-CI checks and do not replace deterministic coverage.

### Risks / questions

- First-person canonical material must remain a faithful synthesis rather than
  impersonating certainty or turning tentative user language into stronger claims.
- Bottom-anchored history needs explicit initial and new-message scroll behaviour
  without disrupting a user who has deliberately scrolled upward.
- A narrow conversational handoff to the existing proposal UI is preferred for
  this pass; a general natural-language revision-command operation requires its
  own approved contract if later evidence justifies it.
- Existing malformed development records will remain unchanged. Retrospective
  repair or deletion requires a separate explicit data decision.

### Proposal status

Proposed on 2026-08-03 after mounted-flow testing and read-only inspection of the
affected conversation's messages, idea-map revisions, draft revisions,
operations, and proposal records. Approved on 2026-08-03.

### Corrective-pass approval record

Approved on 2026-08-03 after review of the confirmed mounted-layout, idea-map,
composition, and conversational-editing failures.

- The pass restores already approved Task 028–031 behaviour rather than adding
  automatic edit interpretation or a new workspace capability.
- First-person canonical idea material must remain faithful to user-established
  meaning and must not make tentative language more certain.
- Composition receives an explicit writing-material view and must never expose
  internal assessment, disposition, provenance, or unresolved-question
  scaffolding as draft content.
- The existing proposal interaction remains the working revision path. A general
  natural-language revision-command framework is intentionally deferred.
- Existing malformed development records are not repaired or deleted.
- Optional intended draft form is intentionally excluded from this corrective
  implementation and will be proposed as the next independently approved task.
- No database migration, automatic commentary, preference storage, publishing,
  or final visual redesign is authorised by this approval.

## Corrective-pass completion report

### Summary

Implemented the approved corrections to editor scrolling, canonical writing
perspective, saved-edit discussion boundaries, draft composition inputs, and
conversational revision handoff.

### Files changed

- Product editor layout and conversation-history behaviour.
- Conversation, workspace, and composition policy and contracts.
- Temporary and durable HTTP host wiring for existing-draft context.
- Deterministic product, adapter, browser, and focused hosted evaluations.
- Product terminology, brief, decisions, progress, and roadmap task records.

### Commands run

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

### What works end to end

- Desktop conversation and draft columns fit the available viewport and scroll
  internally, while the latest conversation material and composer stay anchored
  at the bottom.
- New canonical writing material is first-person and excludes assistant-facing
  provenance and workflow details.
- Saved-edit discussion cannot change the idea map in the same turn, and draft
  composition cannot receive internal assistant assessment or disposition.
- Ambiguous conversational edit requests use the existing reviewable proposal
  boundary rather than claiming an unseen edit occurred.

### Not implemented

- Existing malformed development records were not rewritten or deleted.
- Optional intended draft form remains the separately proposed Task 033.
- General natural-language revision commands remain deferred.

### Risks / follow-ups

- Hosted model behaviour remains probabilistic and is guarded by focused
  evaluation rather than made a CI dependency.
- Task 033 needs separate approval before intended-form state is implemented.

### Suggested next task

Review and, if suitable, approve Task 033: optional intended draft form.
