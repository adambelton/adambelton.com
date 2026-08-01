# Task 031 — Interpret substantive manual draft edits

## Goal

Let direct draft edits inform the shared inquiry so articulation can reveal new
meaning, changed claims, structural choices, or discovery gaps.

## Why this task is next

Without this feedback path, the assistant treats the draft as output rather than
another place where the user thinks.

## Scope

Implements **Manual draft edit** and its associated **Concurrency and
consistency** and **Failure and degraded-state behaviour** rules from the product
architecture.

- Represent saved edits as product-level changes.
- Distinguish conservative substantive edits from textual maintenance.
- Let the assistant respond when useful without commenting on every correction.
- Update relevant idea interpretations while preserving user authority.
- Allow the user to request or suppress discussion of an edit.

## Out of scope

- General automatic preference inference or sophisticated semantic diff history.

## Expected files to create or modify

- draft change and workspace orchestration modules
- conversation and idea-map integration
- client save/discuss interaction and tests
- progress and task index

## Definition of done

- A meaningful edit can change subsequent inquiry and idea summaries.
- Trivial edits do not produce distracting responses.
- The user controls whether ambiguous edits are discussed.
- Tests, typecheck, build, and diff checks pass; progress is updated.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- Fully automatic classification may be unreliable; the baseline should fail
  quietly and preserve explicit user control.

## Status

Proposed. Awaiting approval.
