# Task 032 — Interpret substantive manual draft edits

## Goal

Let direct draft edits inform discovery so composition can reveal new
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

## Settled constraints

- Saving canonical user content and interpreting the change are separate
  outcomes. Every successful save changes canonical draft content even if
  classification or optional assistant commentary fails.
- Manual saves use the draft's expected revision contract. A stale save must
  preserve the newer canonical draft and return a recoverable conflict.
- The conservative baseline change vocabulary is textual maintenance,
  composition, conceptual change, and structural change. Classification is an
  interpretation rather than objective truth.
- Classification failure must fail quietly after a successful save and must not
  manufacture idea-map or preference changes.
- Meaningful change information is offered to the idea map through an explicit
  product operation. The draft capability must not directly mutate idea-map
  internals.
- Optional conversation response is independent of the canonical save and should
  occur only when useful or explicitly requested. Failure must not roll back the
  edit.
- The user can explicitly request discussion or suppress it. Explicit current
  direction takes precedence over an inferred suggestion to comment.
- General preference inference remains out of scope. This slice may expose a
  concise product-level evidence event for the later preference capability, but
  it must not persist or infer a preference itself.

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
- Classification or commentary failure never rolls back a successful edit.
- Stale edits cannot overwrite newer canonical content.
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

## Decisions this task must settle

- The deterministic rules, explicit user action, model classification, or
  combination used for the conservative baseline.
- The observable threshold/policy that distinguishes trivial maintenance from a
  change worth offering to conversation or the idea map.
- The exact discuss/suppress command and client interaction.
- Whether classification is synchronous with the save response or follows as a
  separately reported optional outcome.

## Status

Proposed. Awaiting approval.
