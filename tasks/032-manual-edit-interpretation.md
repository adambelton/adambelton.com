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
  deferred to Task 033 and must not be pulled into this implementation.
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
