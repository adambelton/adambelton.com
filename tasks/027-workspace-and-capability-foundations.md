# Task 027 — Establish workspace and capability foundations

## Goal

Introduce the minimum product-owned workspace contracts that keep conversation,
idea mapping, drafting, and preference learning conceptually separate while
allowing later vertical behaviours to coordinate through explicit operations.

## Why this task is next

The current response contract contains placeholder state, but the product has no
shared model for user and assistant interpretations or for events from UI and
draft interactions.

## Scope

Implements the product architecture sections **Core workspace model**,
**Capability architecture**, **Commands, events, and state changes**, **State
ownership**, and **Package and dependency boundaries** at baseline depth.

- Remove `ConversationPhase` as a product contract without a compatibility shim.
- Remove the overlapping `exploredEnough`, `nearReadyToReflect`,
  `readyToReflect`, and `shouldOfferDraft` booleans.
- Introduce the baseline interaction-scoped discovery/articulation activity
  vocabulary without an activity-focus hierarchy.
- Keep assistant moves as a separate many-to-many technique vocabulary.
- Introduce action-specific assistant readiness and keep explicit user intention
  separate.
- Establish that lifecycle is derived from real resources rather than a stored
  general phase; do not add placeholder draft or publishing resource state.
- Establish narrow capability contracts and product-language operations.
- Represent user and assistant interpretations separately.
- Define only the events needed by the next observable slices.
- Remove the current `ConversationState` aggregate and migrate its consumers to
  the smallest capability-owned resource contracts and interaction-scoped
  metadata required by existing conversation behaviour. Do not replace it with
  another catch-all intellectual-progress or workspace-lifecycle object, and do
  not add placeholder UI.
- Document ownership and persistence semantics with contract-focused tests.

## Out of scope

- A generic event bus, event sourcing, full idea tracking, drafts, or preference
  inference.

## Expected files to create or modify

- ThoughtForm `shared`, `server`, and tests
- product architecture and decision log if concrete contracts settle a decision
- progress and task index

## Definition of done

- Each capability has an explicit responsibility and dependency direction.
- No obsolete phase or overlapping readiness contract remains in apps or packages.
- The obsolete `ConversationState` aggregate is not replaced by a renamed
  catch-all state contract.
- Activity, move, readiness, user intention, and resource lifecycle have distinct
  product meanings.
- Existing conversation behaviour runs through the workspace boundary.
- No host infrastructure leaks into product contracts.
- Tests, typecheck, build, and diff checks pass; progress is updated.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
rg -n "ConversationPhase|new_conversation|private_exploration|deepening|synthesis|ready_to_draft|draft_created|exploredEnough|nearReadyToReflect|readyToReflect|shouldOfferDraft" apps packages
```

## Risks / questions

- Introduce abstractions only where the following slices exercise them.
- Do not encode subjective assessments as objective completion values.
- The repository search in validation should return no obsolete contract usage.

## Status

Completed.
