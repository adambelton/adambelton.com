# Task 034 — Complete the temporary demo session

## Goal

Let a demo user experience the defining Socratic Draft journey from a rough
thought through discovery, composition, an editable draft, revision, and export.

## Why this task is next

The core capabilities now exist and must work together as one comprehensible,
private, temporary experience before final usage limits are calibrated.

## Scope

Composes the baseline capabilities under **Client and API responsibilities** and
the demo portion of **Persistence architecture** from the product architecture.

- Integrate conversation, idea map, draft, retained revision history, proposals,
  and session preferences.
- Preserve temporary lifecycle and privacy behaviour.
- Add copy, Markdown download, JSON download, and clear-session controls.
- Exercise guided and user-led paths.
- Measure representative request, context, and output usage for quota planning.
- Improve empty, loading, recovery, and unavailable states across the workspace.

## Settled constraints

- `/products/socratic-draft/editor` remains the temporary workspace for every
  authenticated user, including the owner. Owner persistence continues through
  the separate ID-addressed conversation/workspace routes.
- Each authenticated user has at most one current temporary workspace, isolated
  by authenticated user and identified by an unguessable identifier.
- The temporary workspace has one fixed deadline 24 hours after creation.
  Activity does not extend it, and process restart or deployment may remove it
  sooner.
- Conversation, idea-map, draft, revision, proposal, and workspace-preference
  content use the same product concepts as owner work but are never durably
  persisted server-side for the demo.
- Clearing removes the complete temporary workspace rather than conversation
  alone. Expiry or early loss returns a stable unavailable result and clears
  stale client identity safely.
- Hosted-AI disabled, unavailable, or limited states must leave retained work
  readable, directly editable, copyable, downloadable, and clearable.
- Rejected editor text and unsaved local edits remain recoverable where possible;
  a failed model action must not discard them.
- Copy and download are explicit user-initiated export operations. They do not
  create server persistence or publish content.
- Operational usage metadata may persist under the documented privacy boundary,
  but it must not contain prompts, messages, idea content, draft/proposal content,
  generated prose, IP addresses, or user-agent strings.
- Do not introduce browser persistence that fragments canonical temporary
  workspace state without a separately approved decision.
- Product writing and revision history remain server-owned. The client keeps only
  running app state; do not add cookies, `localStorage`, IndexedDB, or another
  browser-held recovery layer for workspace content.
- Preserve Task 031's approved responsive interaction architecture: conversation
  remains visible beside the toggleable Idea map/Draft workspace on desktop, and
  smaller screens show one explicitly navigable surface at a time. This task may
  refine integrated behaviour but does not reopen the final visual design.

## Out of scope

- Demo persistence, publishing, live research, or long-term demo preferences.

## Expected files to create or modify

- Socratic Draft client workspace and integration modules
- temporary workspace server/store contracts and adapters
- end-to-end behavioural tests, privacy docs, progress, and task index

## Definition of done

- A demo user can complete and export a draft without durable writing persistence.
- Both guided discovery and explicit user-led composition work end to end.
- Representative usage measurements are documented for the next task.
- Clearing, fixed expiry, early process loss, hosted-AI failure, and export remain
  coherent across the complete workspace rather than conversation alone.
- Tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- The combined UI must remain calm despite exposing a rich workspace.
- Measurement fixtures should represent multiple legitimate writing styles.

## Decisions this task must settle

- The versioned JSON export contract, including whether retained draft revisions
  are included by default or only through an explicit history option, and which
  conversation, idea, preference, proposal, and draft fields are selectable.
- The Markdown export order and headings, and whether copy copies only canonical
  draft content or another explicitly selected export.
- Any integrated focus and recovery refinements required beyond Task 031's
  approved workspace layout, without turning activity into a mandatory mode
  selector or treating current host styling as final product design.
- The recovery policy for unsaved local edits when the temporary server workspace
  expires or disappears early.
- The representative guided, user-led, short-form, and long-form measurement
  fixtures. Record request counts, bounded context sizes, input/output tokens,
  and action types in a documented repository file consumed by Task 035.

## Status

Proposed. Awaiting approval.
