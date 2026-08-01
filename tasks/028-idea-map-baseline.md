# Task 028 — Implement the idea-map baseline

## Goal

Make the assistant's interpretation of the developing thought visible and
negotiable through a small expandable idea tracker.

## Why this task is next

The idea map is the first concrete bridge between private conversation and the
shared model of what the user is trying to say.

## Scope

Implements **Idea map**, the **Idea action** principal flow, and the idea-map rows
in **State ownership** from the product architecture.

- Identify and update a bounded set of ideas from conversation.
- Track qualitative exploration and contextual importance separately.
- Preserve separate user and assistant assessments.
- Show expandable summaries and unresolved questions.
- Let the user focus, park, dismiss, and reopen an idea.
- Give equivalent conversational instructions and UI actions the same meaning.
- Ensure subsequent assistant behaviour respects user dispositions while retaining
  relevant interpretive tension.

## Out of scope

- Graph visualisation, precise percentages, complex relationships, drafts, or
  persistent cross-work learning.

## Expected files to create or modify

- idea-map domain/client/server modules under the Socratic Draft product
- workspace orchestration and product HTTP contracts
- host adapters only where persistence semantics require them
- behavioural and rendering tests, progress, and task index

## Definition of done

- A user can inspect, correct, focus, dismiss, and reopen assistant-detected ideas.
- Assistant and user views can differ without either being silently overwritten.
- UI and conversation controls affect subsequent responses consistently.
- Tests, typecheck, build, and diff checks pass; progress is updated.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- The UI must communicate interpretation without false authority or visual noise.
- Model assessment may need separation from response generation; decide here only
  with concrete evaluation examples.

## Status

Proposed. Awaiting approval.
