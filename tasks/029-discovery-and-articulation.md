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

## Settled constraints

- Activity describes why an interaction or operation is happening; an assistant
  move describes the technique used in one assistant response. Their relationship
  is many-to-many, and an activity may occur without an assistant move.
- Activity and move are interaction metadata, not stored workspace lifecycle.
  Do not introduce a general phase, completion field, or activity-focus taxonomy.
- The frontend may communicate explicit user intention but must not choose the
  assistant move. Move selection remains in the product server.
- Assistant readiness is qualitative, advisory, and action-specific. The current
  targets are reflection and composition; readiness remains separate from user
  intention and cannot block an explicit request for early or rough composition.
- Conversation consumes a bounded, prepared view of relevant idea-map state. It
  must not own or directly mutate canonical idea-map state.
- The baseline conversational policy asks one useful question or offers one
  concise reflection, explanation, or articulation response at a time.
- Model results that select activity, move, or readiness must be provider-neutral
  and validated into product-owned contracts. Invalid structured output must fail
  safely or degrade to conversation without corrupting product state.
- This task may express composition readiness, an offer, or user composition
  intention, but it does not create a canonical draft resource.

## Out of scope

- Canonical draft objects, revision proposals, or persistent preference learning.

## Expected files to create or modify

- conversation policy/readiness modules and prompts under the product server
- activity controls and state presentation under the product client
- product contracts and, where the structured result requires them, host-supplied
  provider adapters under `apps/api` and `packages/ai`
- tests, evaluation fixtures, progress, and task index

## Definition of done

- Activity, move, readiness, and user intention are derived meaningfully rather
  than returned as fixed placeholders.
- Activity and move are both meaningful without duplicating one another.
- Users can ask to be guided or take the lead through either surface.
- The product can offer articulation while preserving unresolved uncertainty.
- Explicit user direction can override the suggested direction without rewriting
  the assistant's readiness assessment.
- Invalid model classification cannot corrupt the idea map or retained
  conversation history.
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

## Decisions this task must settle

- The provider-neutral structured result used for activity, move, readiness, and
  response generation, including validation and degraded behavior.
- The concrete UI controls for guided versus user-led work without creating a
  mandatory mode selector.
- Representative deterministic evaluation cases for ambiguous activity,
  readiness uncertainty, and articulation that exposes a discovery gap.
- How bounded conversation and idea context is selected or summarized for this
  operation under the existing input limit.

## Status

Proposed. Awaiting approval.
