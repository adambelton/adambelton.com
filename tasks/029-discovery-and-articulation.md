# Task 029 — Support fluid discovery and articulation

## Goal

Let the assistant recognise whether the user needs help discovering meaning or
articulating known meaning, and move naturally between those activities under
user direction.

## Why this task is next

Once ideas are visible, the assistant can use their state and the user's stated
intent to choose a genuinely useful next act rather than always probing.

## Scope

Implements **Discovery and articulation**, **Conversation and inquiry**, and the
conversation-turn portions of **Principal flows** from the product architecture.

- Implement meaningful move selection and readiness assessment.
- Classify the primary purpose of each relevant interaction as discovery or
  articulation while allowing the same move to serve either purpose.
- Support conversational and UI steering toward exploration or articulation.
- Allow articulation attempts to expose a discovery gap and return to inquiry.
- Explain important readiness uncertainty without blocking user-directed drafting.
- Keep activity operation-scoped and distinct from assistant moves, readiness,
  user intention, and resource-derived lifecycle.

## Out of scope

- Canonical draft objects, revision proposals, or persistent preference learning.

## Expected files to create or modify

- conversation policy/readiness modules and prompts under the product server
- activity controls and state presentation under the product client
- product contracts, tests, progress, and task index

## Definition of done

- The assistant no longer reports fixed placeholder moves and state.
- Activity and move are both meaningful without duplicating one another.
- Users can ask to be guided or take the lead through either surface.
- The product can offer articulation while preserving unresolved uncertainty.
- Tests, typecheck, build, and diff checks pass; progress is updated.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- Model judgments need deterministic contract tests and representative eval cases.
- Subtle activity cues should not become a mandatory mode selector.
- Do not introduce an activity-focus taxonomy to restate moves or commands.

## Status

Proposed. Awaiting approval.
