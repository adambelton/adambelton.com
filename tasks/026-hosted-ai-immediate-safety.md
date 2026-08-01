# Task 026 — Add immediate hosted-AI safety boundaries

## Goal

Make continued product development safe by adding an explicit hosted-AI kill
switch and hard per-request input and output bounds before expanding model-backed
behaviour.

## Why this task is next

The current endpoint can call the owner's hosted model without an emergency
disable control or provider output cap. Full quotas should be calibrated against
the completed demo, but these immediate boundaries do not depend on that work.

## Scope

Implements the product architecture sections **AI architecture**, **Failure and
degraded-state behaviour**, and the hosted boundary in **Principal flows**.

- Require explicit `HOSTED_AI_ENABLED` configuration for hosted calls.
- Validate a maximum accepted conversation-input size before calling the model.
- Pass a validated maximum output-token value through the product model port.
- Return stable disabled and input-too-large errors without losing temporary work.
- Keep deterministic fake-model development available without hosted accounting.
- Document configuration and cover product, provider, API, and rendered behaviour.

## Out of scope

- Daily request/token budgets, usage persistence, cost reporting, or admin UI.
- Final action-specific output limits.
- Conversation-policy or draft behaviour.

## Expected files to create or modify

- Socratic Draft model and HTTP contracts under `packages/products`
- provider-neutral AI contracts and adapters under `packages/ai`
- API composition/configuration under `apps/api`
- demo failure presentation under the product client
- `.env.example`, privacy documentation, progress, and tests

## Definition of done

- Hosted AI is disabled unless explicitly enabled.
- Every hosted request has validated input and output bounds.
- Bound failures are understandable and preserve the current workspace.
- Relevant tests, typecheck, build, and diff checks pass.
- `progress.md` is updated.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- The provisional output ceiling must permit later composition while remaining a
  meaningful blast-radius bound.
- Later action-specific limits should refine this contract without replacing it.

## Status

Proposed. Awaiting approval.
