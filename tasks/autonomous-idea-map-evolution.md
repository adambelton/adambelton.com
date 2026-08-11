# Add autonomous, user-correctable Idea Map evolution

## Goal

Let ThoughtForm recognise when established material is better represented by
merging related ideas or splitting an overloaded idea, while keeping every
structural change visible, attributable, concurrency-safe, and correctable by
the user.

## Why this task is next

The current Idea Map can add, enrich, correct, focus, satisfy, park, dismiss, and
reopen stable ideas, but it cannot change their structural boundaries. The
product roadmap records autonomous, user-correctable merge/split behavior as
required before the editor is fully functional. This proposal captures the
known boundary now, but must be re-reviewed after Task 038 so any hosted behavior
uses the settled attempt lifecycle.

## Depends on

- Completed temporary-workspace lifecycle and current optimistic Idea Map
  persistence baseline.
- Completed Task 038 attempt accounting if implementation changes hosted model
  invocation or usage aggregation.
- A fresh review deciding whether this behavior remains required for public beta
  and settling the structural identity/correction decisions below.

## Scope

- Extend the existing Idea Map analysis contract so it may propose bounded
  structural operations based only on user-established material:
  - merge two or more genuinely overlapping ideas;
  - split one idea whose established substance contains meaningfully distinct
    ideas.
- Validate structural proposals in product-owned capability code before any
  mutation. Reject unknown, duplicate, dismissed/incompatible, over-limit, or
  semantically incomplete references without changing the map.
- Apply a valid structural operation atomically against an expected Idea Map
  revision, preserving current user interpretations, dispositions, unresolved
  questions, assistant assessments, and potential-conflict references according
  to explicitly approved rules.
- Make each applied merge/split immediately visible in the Idea Map with concise
  product-language explanation of what changed.
- Give the user direct, accessible operations to correct the resulting idea
  boundaries, including explicit user-directed merge/split and a bounded way to
  reverse or replace the most recent structural interpretation.
- Preserve correction through reload and through both temporary and durable
  workspace adapters for their existing lifetimes.
- Ensure later conversation and Draft context use the corrected current Idea Map
  rather than retired structural references.
- Prefer extending the existing asynchronous Idea Map analysis attempt. If a
  separate model call is proposed, stop for fresh scope review and update Tasks
  038 and 039 before implementation.

## Out of scope

- A general Idea Map history browser or arbitrary time travel.
- Silently inventing, deleting, or rewording user-established meaning.
- Merging merely to stay below idea-count limits.
- Treating similarity as proof that the user considers two ideas equivalent.
- Automatic Draft rewriting, conversation-history rewriting, or publication.
- Cross-workspace idea identity or learned user profiles.
- A broad Idea Map visual redesign.

## Expected files to create or modify

- ThoughtForm shared structural-operation contracts and stable outcomes
- Idea Map analysis schema/prompt fallback and Langfuse-managed prompt version
- product-owned Idea Map validation/application and workspace coordination
- temporary and durable persistence only where reversible structural provenance
  requires it
- HTTP delivery, client correction presentation, and accessible controls
- capability, concurrency, persistence, API, client, browser, and hosted evaluation tests
- product README, architecture/decision, privacy, progress, and task records

## Settled constraints

- Conversation history remains unchanged and canonical; structural evolution
  changes only the current Idea Map representation.
- The model may propose structure but product code validates and applies it.
- A merge or split must contain only already user-established meaning. Unconfirmed
  assistant hypotheses never become synthesis or substance through restructuring.
- Structural updates use expected Idea Map revision and fail safely on conflict.
- User correction is canonical and takes precedence over later assistant
  assessment until new user-established evidence supports another change.
- Dismissed ideas are not silently reactivated or absorbed into active ideas.
- Existing retained/active idea limits remain policy rather than a reason to
  discard material.
- Temporary and durable workspaces receive the same product behavior while
  retaining their different host persistence lifetimes.
- Temporary-user structural operations emit no Langfuse trace.

## Decisions required before approval

- Merge identity: which idea ID survives, how retired IDs are represented, and
  how potential conflicts and other references are remapped.
- Split identity: whether the original ID survives for one result or is retired,
  and how new IDs and references are assigned.
- The minimum reversible provenance needed to correct or undo a structural
  interpretation without creating a general history feature.
- Whether assistant-proposed operations apply automatically with immediate undo,
  or require a lightweight confirmation; the result must still satisfy the
  approved meaning of autonomous and user-correctable.
- How dispositions, user interpretations, assessments, unresolved questions,
  synthesis, and substance combine or distribute.
- Which operations are allowed for parked, satisfied, focused, or dismissed
  ideas.
- How repeated or oscillating structural proposals are suppressed after a user
  correction.
- Whether the existing Idea Map analysis response can carry the operation safely
  without another hosted call.

## Definition of done

- Valid merge and split scenarios preserve all user-established meaning and
  produce a coherent current Idea Map.
- Invalid or stale proposals leave the map unchanged and return stable outcomes.
- The user can inspect, correct, and reverse/replace a structural interpretation
  with accessible controls and authoritative server persistence.
- Corrections survive reload and are respected by later conversation, Idea Map
  analysis, and Draft context.
- Concurrent analysis and direct user correction cannot overwrite one another.
- Dismissed material, potential conflicts, limits, and identity references obey
  the approved rules.
- Temporary operations retain the no-Langfuse boundary and any hosted usage is
  correctly represented by Task 038.
- Deterministic capability, persistence, API, client, browser, and representative
  hosted evaluation evidence passes.

## Validation commands

```txt
pnpm validate:thoughtform-prompts
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

If schema changes are approved, generate and apply the migration through the
schema-first workflow and run non-skipped database integration tests. Hosted
evaluation is paid, outside ordinary CI, and requires explicit approval.

## Risks / questions

- Structural operations can lose meaning or make references ambiguous if
  identity and provenance are underspecified.
- Immediate automatic restructuring may feel unstable; confirmation-only
  behavior may fail the intended autonomous capability. The review must choose
  an honest interaction.
- Undo/provenance can accidentally become an unbounded history subsystem; keep
  it to the smallest correction contract that protects user authorship.
- Prompt/schema changes must follow the reviewed Langfuse fallback workflow.

## Status

Approved by Adam on 11 August 2026. Implementation in progress.

## Approval record

- **Approval date:** 11 August 2026.
- **Intentional boundaries:** extend the existing asynchronous Idea Map analysis
  attempt with bounded merge and split proposals; validate and apply them in
  product-owned code; expose accessible direct correction and one-step undo;
  preserve the distinct temporary and durable persistence lifetimes and the
  Task 038 accounting boundary.
- **Important deferrals:** general Idea Map history, arbitrary time travel,
  conversation or Draft rewriting, cross-workspace identity, learned profiles,
  broad visual redesign, and changes to hosted-attempt ledger semantics remain
  outside this task.
- **Implementation decisions:** assistant proposals apply automatically with an
  immediate undo; merges retain the oldest source ID and remap absorbed IDs;
  splits retain the original ID for the primary result and allocate new IDs for
  the others; all established substance must be distributed; reversible
  provenance is limited to the most recent structural change; dismissed ideas
  cannot participate automatically; splits inherit disposition and merges
  cannot silently become more active than their sources; user correction is
  canonical and suppresses an equivalent proposal until materially new
  user-established evidence exists.
- **Do not reopen:** the model proposes but product code validates and applies;
  conversation history remains canonical and unchanged; structural changes use
  optimistic Idea Map revisions; temporary and durable workspaces receive the
  same product behavior; temporary workspaces emit no Langfuse trace; and a new
  hosted call or separate hosted action requires fresh scope review.
