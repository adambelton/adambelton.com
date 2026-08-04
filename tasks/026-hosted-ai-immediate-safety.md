# Task 026 — Add immediate hosted-AI safety boundaries

## Goal

Make continued product development safe by adding an explicit hosted-AI kill
switch, requiring valid provider configuration, and adding hard per-request
input and output bounds before expanding model-backed behaviour.

## Why this task is next

The current endpoint can call the owner's hosted model without an emergency
disable control, complete-input limit, or provider output cap, and it silently
substitutes a fake model when OpenAI is not configured. Full quotas should be
calibrated against the completed demo, but these immediate boundaries do not
depend on that work.

## Scope

Implements the product architecture sections **AI architecture**, **Failure and
degraded-state behaviour**, and the hosted boundary in **Principal flows**.

- Require explicit `HOSTED_AI_ENABLED=true` configuration and a non-empty
  `OPENAI_API_KEY` before ThoughtForm can make hosted model calls.
- Treat any other enable-flag value, a missing enable flag, or missing provider
  configuration as a disabled product state. The wider website and API may
  continue running, but ThoughtForm must not accept model-backed actions.
- Remove the automatic fake-model fallback from API composition. Keep the fake
  client only as a deterministic test adapter.
- Validate a 32 KiB maximum complete conversation-input size before calling the
  model or changing persistence. Measure the UTF-8 bytes of the complete model
  payload: system instructions, retained conversation history, and the new user
  message.
- Pass a required, validated 1,024 maximum output-token value through the
  product-owned model port, provider-neutral AI contract, API adapter, and
  OpenAI adapter.
- Return stable `hosted_ai_disabled`, `conversation_input_too_large`, and
  `hosted_ai_unavailable` failures without losing recoverable editor work.
- Apply the same hosted boundary to temporary and persistent conversations.
- Interpret hosted configuration in `apps/api`; product and AI packages must not
  read environment variables directly.
- Document configuration and cover product, provider, API-composition, HTTP, and
  rendered client behaviour.

## Out of scope

- Daily request/token budgets, usage persistence, cost reporting, or admin UI.
- Final action-specific output limits.
- Conversation-policy or draft behaviour.

## Expected files to create or modify

- ThoughtForm model and HTTP contracts under `packages/products`
- provider-neutral AI contracts and adapters under `packages/ai`
- API composition/configuration under `apps/api`
- demo failure presentation under the product client
- persistent-editor failure presentation where shared behaviour does not already
  cover it
- `.env.example`, relevant configuration/privacy documentation, `progress.md`,
  `tasks/README.md`, and tests

## Definition of done

- Hosted AI remains disabled unless `HOSTED_AI_ENABLED` is exactly `true` and
  required OpenAI configuration is present.
- Disabled or unconfigured hosted AI does not prevent unrelated website and API
  behaviour from running, but ThoughtForm model-backed actions fail closed
  with `hosted_ai_disabled` and make no provider calls or persistence changes.
- The API never silently substitutes fake conversation responses when hosted AI
  is disabled, unconfigured, or unavailable.
- The fake client remains available only as a deterministic test adapter.
- Every hosted request has a validated 32 KiB complete-input bound and a required
  1,024 output-token cap.
- Complete input includes system instructions, retained history, and the new user
  message, measured in UTF-8 bytes.
- Boundary-sized input succeeds and input one byte over the boundary fails before
  model invocation or persistence changes.
- Oversized cumulative history fails even when the newest user message is small.
- Temporary and persistent conversation requests enforce the same boundary.
- Disabled, input-too-large, and hosted-unavailable failures use stable API codes
  and do not invoke or append another model-generated turn.
- The editor keeps the conversation identity, retained messages, temporary expiry
  metadata, and rejected text available for correction after these failures.
- The OpenAI request receives the validated output cap as `max_output_tokens`.
- Relevant tests, typecheck, build, and diff checks pass.
- `progress.md` is updated and Task 026 is moved to completed in
  `tasks/README.md`.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- The provisional 1,024-token output ceiling must permit later composition while
  remaining a meaningful blast-radius bound.
- Later action-specific limits should refine this contract without replacing it.
- The deployment platform may still require a restart or redeployment after the
  kill-switch configuration changes; the flag nevertheless provides an explicit
  fail-closed control independent of provider credentials.

## Status

Completed.
