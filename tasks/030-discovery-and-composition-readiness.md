# Task 030 — Support meaningful discovery and composition readiness

## Goal

Make discovery genuinely useful by selecting grounded conversational moves,
following user direction, and recognising when composition could usefully be
offered without creating a draft.

## Why this task is next

Once ideas are visible, the assistant can use their state and the user's stated
intent to choose a genuinely useful next act rather than always probing.

## Scope

Implements the discovery portions of **Discovery and composition**,
**Conversation and inquiry**, and the
conversation-turn portions of **Principal flows** from the product architecture.

- Implement meaningful, grounded discovery-move selection.
- Support conversational and subtle UI steering within discovery, such as
  focusing an idea, asking for guidance, or requesting reflection.
- Assess readiness for reflection and for offering composition.
- Explain important readiness uncertainty without treating it as a gate.
- Recognise an explicit composition request as user intention without
  misclassifying the pre-draft interaction as composition. Performing that
  request belongs to the next capability slice.
- Keep activity operation-scoped and distinct from assistant moves, readiness,
  user intention, and resource-derived lifecycle.

## Settled constraints

- All interactions implemented by this task remain discovery because no draft
  exists and this task does not create one. Reflection, paraphrasing, and finding
  precise language for meaning are discovery moves.
- Composition begins only with the operation that creates the canonical draft.
  That operation belongs to Task 031.
- Activity describes why an interaction or operation is happening; an assistant
  move describes the technique used in one assistant response.
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
  concise grounded reflection or explanation at a time.
- Model results that select activity, move, or readiness must be provider-neutral
  and validated into product-owned contracts. Invalid structured output must fail
  safely or degrade to conversation without corrupting product state.
- This task may express composition readiness, an offer, or user composition
  intention, but it does not emit composition activity or create a canonical
  draft resource.

## Out of scope

- Composition activity, canonical draft objects, revision proposals, manual-draft
  edit interpretation, or persistent preference learning.

## Expected files to create or modify

- conversation policy/readiness modules and prompts under the product server
- discovery steering and readiness presentation under the product client
- product contracts and, where the structured result requires them, host-supplied
  provider adapters under `apps/api` and `packages/ai`
- tests, evaluation fixtures, progress, and task index

## Definition of done

- Discovery moves, readiness, and user intention are derived meaningfully rather
  than returned as fixed placeholders.
- Conversation remains grounded in user-expressed or user-adopted idea material.
- Users can ask to be guided, redirect the inquiry, focus an idea, or request a
  reflection through conversation and appropriately subtle UI controls.
- The product can offer composition while preserving unresolved uncertainty and
  without pretending a draft already exists.
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
- Representative deterministic evaluation cases for move selection, grounded
  reflection, user redirection, readiness uncertainty, and an explicit early
  composition request.
- How bounded conversation and idea context is selected or summarized for this
  operation under the existing input limit.

## Status

Complete.

Implemented on 2 August 2026.

## Approval record

Approved by Adam on 2 August 2026 after review against the complete current
product documentation.

- Separating composition intention from composition execution is intentional.
  This task may recognise a direct request, express readiness, or offer
  composition, but Task 031 performs the operation that creates the canonical
  draft.
- Every interaction implemented here remains discovery. A model-selected or
  server-derived activity must not cause this task to emit composition activity.
- Subtle client steering communicates ordinary user intention and existing idea
  commands; the client does not choose assistant moves or introduce a persistent
  mode selector.
- Suggested replies are not part of this task or the current product contract.
  They may be reconsidered later only for conversation steering and only under
  the canonical architecture's strict prohibition on suggested substantive
  language.
- The structured result, validation and degraded behaviour, exact steering
  controls, deterministic evaluation cases, and bounded-context selection remain
  implementation decisions explicitly delegated to this task.
- The Task 030/031 boundary must not be reopened merely because composition
  execution is deferred. Reconsider it only if implementation exposes a concrete
  contradiction with a higher-authority rule or genuinely new evidence.
