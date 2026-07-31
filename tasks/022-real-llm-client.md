# Task 022 — Real LLM client

## Goal

Replace the deterministic Socratic Draft stub response path with a minimal real LLM-backed response flow while preserving the product/host dependency boundary.

## Scope

- Install the official OpenAI SDK in `packages/ai`.
- Add a small OpenAI-backed `LlmClient` adapter using the Responses API.
- Keep `gpt-5-mini` as the default model, configurable through `OPENAI_MODEL`.
- Add a Socratic Draft-owned conversation model port.
- Inject the host AI adapter into the Socratic Draft conversation service from `apps/api`.
- Pass prior conversation messages and the current user message into the model request.
- Keep tests on fake adapters with no live OpenAI calls.
- Update context docs and environment examples.

## Out of scope

- Streaming responses.
- Usage limits and cost controls.
- Advanced Socratic Draft prompt architecture.
- Model comparison tooling.
- Publishing, saved-entry management, admin UI, or database schema changes.

## Definition of done

- Socratic Draft can receive an injected model dependency.
- Product packages do not import OpenAI SDKs or provider configuration.
- `apps/api` supplies the concrete AI adapter.
- Tests prove the conversation service sends current and previous messages through the product model port.
- Local/test behavior remains deterministic without real network calls.
- Typecheck, build, tests, and diff whitespace validation pass.

## Validation commands

```txt
pnpm typecheck
pnpm build
pnpm test
git diff --check
```

## Status

Implemented. Awaiting review.
