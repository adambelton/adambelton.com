# Task 033 — Interpret substantive draft changes conservatively

## Goal

Classify an explicitly available `DraftChange` conservatively and offer useful
conversation or idea-map follow-up without weakening user authority.

## Depends on

Task 032.

## Why this task is next

Once exact changes can be discussed explicitly, interpretation can be added and
evaluated without conflating save correctness, diff representation, and model judgment.

## Scope

- Add a product-owned substantive-edit interpretation model port.
- Distinguish textual maintenance, composition, conceptual, and structural change.
- Offer optional commentary only when useful or explicitly requested.
- Offer meaningful change information to the idea map through its public operation.
- Let the user suppress, reject, or correct an interpretation.
- Expose minimized preference evidence for Task 034 without retaining a preference.

## Out of scope

- General preference inference, another history mechanism, or retrospective
  classification of all revisions.

## Expected files to create or modify

- product interpretation model and orchestration modules
- host AI adapter
- idea-map offer/confirmation flow
- client review states, evaluations, and behavioral tests

## Definition of done

- Trivial edits produce no distracting interpretation.
- A substantive edit can affect later inquiry or idea state only after the user
  establishes or confirms its intended meaning.
- Invalid classification and commentary failure never roll back the saved draft.
- Model, orchestration, HTTP, client, and behavioral regressions are covered.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

## Blast radius

Medium to high: product model ports, conversation orchestration, idea-map
operations, host AI adapters, and client review states. It requires a separate
proposal review and approval after Task 032 is complete.

## Risks / questions

- Define the evidence required before an interpretation can affect canonical ideas.
- Settle classification latency, failure reporting, and whether explicit discussion
  and automatic interpretation share one model request.

## Status

Proposed. Awaiting review after Task 032.
