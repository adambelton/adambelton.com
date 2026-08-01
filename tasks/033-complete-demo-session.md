# Task 033 — Complete the temporary demo session

## Goal

Let a demo user experience the defining Socratic Draft journey from a rough
thought through inquiry, articulation, an editable draft, revision, and export.

## Why this task is next

The core capabilities now exist and must work together as one comprehensible,
private, temporary experience before final usage limits are calibrated.

## Scope

Composes the baseline capabilities under **Client and API responsibilities** and
the demo portion of **Persistence architecture** from the product architecture.

- Integrate conversation, idea map, draft, proposals, and session preferences.
- Preserve temporary lifecycle and privacy behaviour.
- Add copy, Markdown download, JSON download, and clear-session controls.
- Exercise guided and user-led paths.
- Measure representative request, context, and output usage for quota planning.
- Improve empty, loading, recovery, and unavailable states across the workspace.

## Out of scope

- Demo persistence, publishing, live research, or long-term demo preferences.

## Expected files to create or modify

- Socratic Draft client workspace and integration modules
- temporary workspace server/store contracts and adapters
- end-to-end behavioural tests, privacy docs, progress, and task index

## Definition of done

- A demo user can complete and export a draft without durable writing persistence.
- Both guided discovery and explicit user-led articulation work end to end.
- Representative usage measurements are documented for the next task.
- Tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- The combined UI must remain calm despite exposing a rich workspace.
- Measurement fixtures should represent multiple legitimate writing styles.

## Status

Proposed. Awaiting approval.
