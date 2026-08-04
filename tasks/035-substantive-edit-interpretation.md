# Task 035 — Interpret substantive draft changes conservatively

## Goal

Let a saved draft change participate automatically in the collaboration: ignore
trivial maintenance, respond usefully to meaningful changes, and reconcile only
user-established meaning into the idea map without weakening user authority.

## Depends on

Task 034.

Tasks 032 and 033 are also complete. Draft Format remains behaviourally inert and
is not an input to this task.

## Why this task is next

Task 034 evolves the exact revision-bounded `DraftChange` to represent canonical
semantic Markdown without exposing editor metadata, but the user must still
attach a saved change through the temporary “Discuss this edit” bridge. The
product can now respond to a saved edit as a meaningful workspace event without
conflating draft-save correctness, exact semantic change representation, model
judgement, or preference learning.

## Scope

- Treat every changed draft save or restoration as a workspace event eligible
  for an automatic assistant response.
- Classify the exact `DraftChange` conservatively as textual maintenance,
  composition, conceptual change, or structural change.
- Suppress distracting assistant responses for trivial textual maintenance.
- Let meaningful changes trigger an automatic assistant response without
  fabricating a user utterance or rolling back the saved draft.
- Present assistant interpretations as provisional and, where possible, in the
  user's voice.
- Reconcile confirmed, clarified, or elaborated meaning with existing idea
  substance through public idea-map operations.
- Prefer the user's latest substantive wording whenever a response both confirms
  and restates an assistant interpretation. A bare confirmation may accept the
  assistant's wording, but richer user language must not be replaced by an
  earlier assistant paraphrase.
- Let dismissal end the current interpretation without changing existing idea
  substance or undoing the saved draft.
- Distinguish two idea-map forms of uncertainty:
  - open questions are unknown uncertainty about material not yet established;
  - potential conflicts are known uncertainty where explored material appears
    to pull in incompatible directions or still requires reconciliation.
- Add inspectable potential conflicts to the idea map, including conflicts within
  one idea, between ideas, or between established substance and a saved edit.
- Have later inquiry actively work toward resolving potential conflicts while
  preserving user authority and allowing an intentional, explained tension as a
  valid resolution.
- Support conflict resolution by refinement, contextual distinction, choosing
  one position, separating ideas, integrating the tension, or dismissing a
  mistaken conflict.
- Remove a resolved potential conflict while retaining any user-established
  resolution in ordinary idea substance.
- Remove the “Discuss this edit” placeholder once automatic saved-edit handling
  works end to end. Pre-edit discussion continues through the existing selected-
  passage conversation attachment.
- If the automatic response fails, preserve the successful draft revision and
  attach the exact saved `DraftChange` to the composer so the user can add a
  message and retry through the ordinary conversation path.
- Clear or replace a failed-response attachment when a later draft revision makes
  it stale.

## Ownership and architectural boundaries

- Drafting owns derivation and conservative classification of its
  revision-bounded `DraftChange`, including the product-owned model port it needs.
- Workspace application orchestration coordinates the saved-edit event,
  automatic response, failure recovery, and cross-capability ordering.
- The idea-map capability owns potential-conflict representation, validation,
  reconciliation, and its public mutation operations.
- Conversation owns the assistant response and subsequent user dialogue; an
  automatic saved-edit response must not be retained as a fabricated user
  message.
- The API host supplies the concrete AI adapter without recreating product
  classification, reconciliation, or conflict rules.
- The assistant's provisional interpretation is advisory. It is not a separate
  canonical idea, durable preference, or new revision-history mechanism.
- No separately persisted interpretation record is introduced. Durable outcomes
  are the existing saved draft, retained conversation, and user-established
  idea-map state.

## Out of scope

- Preference evidence, preference inference, preference storage, or advance work
  on Task 036.
- Retrospective classification of existing revisions or another draft-history
  mechanism.
- A separately persisted pending-interpretation entity.
- Using Draft Format to influence classification, conversation, idea-map
  reconciliation, composition, revision, or publishing behaviour.
- Automatic resolution of conflicts without user-established meaning.
- General natural-language editing commands or discussion of unsaved edits beyond
  the existing selected-passage attachment.

## Expected files to create or modify

- `packages/products/src/socratic-draft/server/capabilities/drafting/` for
  conservative saved-change classification and its model port
- `packages/products/src/socratic-draft/server/capabilities/idea-map/` and product
  shared contracts for potential conflicts and reconciliation operations
- `packages/products/src/socratic-draft/server/application/workspace/` for
  saved-edit response orchestration and recovery ordering
- `packages/products/src/socratic-draft/server/delivery/http/` for the resulting
  product HTTP contracts
- `apps/api/src/products/socratic-draft/adapters/ai/` and product mounting for the
  concrete interpretation adapter
- `packages/products/src/socratic-draft/client/workspace/` for automatic response,
  conflict presentation and resolution, removal of the placeholder action, and
  composer recovery
- product-owned fakes, fixtures, browser scenarios, and hosted evaluations
- focused host-adapter tests and canonical product documentation

No database migration is expected. Potential conflicts remain part of the
existing persisted idea-map state. New evidence is required before expanding
that boundary.

## Definition of done

- Trivial edits save normally and produce no distracting assistant response.
- A meaningful saved edit automatically produces an assistant response without a
  fabricated user utterance or an additional “Discuss this edit” action.
- The assistant's provisional interpretation cannot change canonical idea
  substance until the user establishes its meaning.
- A confirming restatement or clarification reconciles the user's own latest
  language with existing substance instead of privileging the assistant's
  paraphrase.
- Dismissing an interpretation leaves existing idea substance unchanged.
- Potential conflicts are inspectable in the idea map, remain distinct from open
  questions, and can be resolved through ordinary Discovery interaction.
- Resolution may preserve an intentional, explained tension; the established
  resolution becomes substance and the potential conflict no longer remains
  pending.
- Classification, response generation, or commentary failure never rolls back or
  misreports the successful draft save.
- After an automatic-response failure, the exact current `DraftChange` is attached
  to the composer for an ordinary conversational retry; a later save invalidates
  the stale attachment.
- Draft Format remains saved and inspectable but has no effect on this behaviour.
- Model, capability, orchestration, HTTP, adapter, client, and behavioral
  regressions are covered.
- After automated validation passes, the completed flow is exercised manually in
  the real local browser before the task is reported as finished. This is a
  pragmatic end-to-end completion check, not a new automated mounted-host suite.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

Run focused hosted interpretation evaluations when credentials and intended model
usage are available. They remain outside normal CI and do not replace
deterministic coverage.

## Decisions this task must settle during implementation

- The conservative deterministic boundary that avoids a model request for
  obvious textual maintenance.
- Whether meaningful-change classification and the automatic assistant response
  share one bounded model request or use separate requests.
- The minimal `PotentialConflict` contract, including cross-idea references and
  how stale references are handled.
- How a saved-edit-triggered assistant response is represented in retained
  conversation without inventing a user utterance.
- The exact conflict-resolution operations needed for the approved observable
  behaviours without introducing a generic idea-map mutation API.
- The recovery copy and presentation of the attached saved change after an
  automatic-response failure.

## Risks / questions

- Assistant interpretations must remain faithful and tentative. Writing in the
  user's voice must not make uncertain assistant inference look user-authored.
- Reconciliation must accumulate explored substance without duplicating the same
  meaning or erasing a genuine change in position.
- Potential conflicts need enough structure to be useful without becoming a
  second graph or another generic issue tracker.
- Active conflict resolution must not become a gate that prevents the user from
  requesting an early draft containing acknowledged tension.
- Automatic response latency must not make the draft save appear blocked or
  failed.
- A retry must remain bound to the exact saved revision and must not interpret a
  stale diff after the draft advances.

## Blast radius

Medium to high: drafting model ports, workspace orchestration, conversation
retention, idea-map contracts and operations, host AI adapters, HTTP contracts,
client response and recovery states, evaluations, and behavioral tests. It
requires separate proposal review and approval before implementation.

## Status

Proposed. Awaiting review and explicit approval.
