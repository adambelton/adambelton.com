# Task 036 — Harden the complete temporary workspace lifecycle and recovery

## Goal

Harden ThoughtForm's complete temporary workspace so conversation, Idea Map,
Draft, revision history, and proposals behave as one coherent, private,
expiring unit across restoration, clearing, process loss, and hosted-AI
failure.

## Why this task is next

The core capabilities now exist and must work together as one comprehensible,
private, temporary experience before final usage limits are calibrated.

## Depends on

The completed unnumbered correction tasks, including the pre-036 codebase-audit
correction that established fresh temporary identities, awaited cross-store
cleanup, shared HTTP delivery, and mounted-state text recovery.

## Scope

Hardens the remaining baseline capabilities under **Client and API
responsibilities** and the temporary portion of **Persistence architecture**.

- Harden the already integrated conversation, Idea Map, optional Draft, retained
  revision history, and proposal capabilities under one temporary-workspace
  lifecycle.
- Make expiry, early process loss, and clear-session behaviour coherent across
  conversation, Idea Map, Draft state, revision history, proposals, and
  completed-operation records.
- Exercise guided and user-led paths.
- Improve empty, loading, recovery, and unavailable states across the workspace.
- Extend the established unavailable-workspace result and detached local-text
  recovery to every temporary operation and remaining client state transition.

## Settled constraints

- `/products/thoughtform/editor` remains the temporary workspace for every
  authenticated user, including the owner. Owner persistence continues through
  the separate ID-addressed conversation/workspace routes.
- Each authenticated user has at most one current temporary workspace, isolated
  by authenticated user and identified by an unguessable identifier.
- The temporary workspace has one fixed deadline 24 hours after creation.
  Activity does not extend it, and process restart or deployment may remove it
  sooner.
- Conversation, idea-map, draft, revision, and proposal
  content use the same product concepts as owner work but are never durably
  persisted server-side for the temporary workspace.
- Clearing removes the complete temporary workspace rather than conversation
  alone. Expiry or early loss returns a stable unavailable result and clears
  stale client identity safely.
- Hosted-AI disabled, unavailable, or limited states must leave retained work
  readable, directly editable, and clearable.
- Rejected editor text and unsaved local edits remain recoverable where possible;
  a failed model action must not discard them.
- The corrective baseline already retains locally typed composer text and
  unsaved Draft edits through audited request, hosted-AI, concurrency, and
  unavailable-workspace failures; Task 036 must preserve and complete that
  behaviour rather than reimplement it.
- If the server workspace expires or disappears early, locally typed text remains
  visible and copyable while canonical server state and stale workspace identity
  are cleared. It must not be silently submitted into a newly created workspace.
- Explicit clearing is intentionally destructive and may discard unsaved local
  edits only after clear confirmation.
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

- Temporary content persistence, host public-website delivery, preference learning, or
  live research.

## Expected files to create or modify

- ThoughtForm client workspace and integration modules
- temporary workspace server/store contracts and HTTP delivery
- host in-memory conversation and Draft persistence adapters and their product
  mounts
- end-to-end behavioural tests, privacy docs, progress, and task index

## Definition of done

- The owner can explore and organise temporary material without a Draft and can create
  and refine a first-person Draft without durable content persistence when useful.
- Both guided discovery and explicit user-led composition work end to end.
- Clearing, fixed expiry, early process loss, and hosted-AI failure remain
  coherent across the complete workspace rather than conversation alone.
- Conversation, Idea Map, Draft state, revision history, proposals, and completed
  operations share one expiry and clearing boundary.
- Every temporary operation returns a stable unavailable-workspace outcome after
  expiry or early loss; the client clears stale canonical identity without
  discarding locally recoverable text or silently applying it to a new workspace.
- Existing request, hosted-AI, concurrency, and unavailable recovery regressions
  remain green while every other temporary operation receives equivalent stable
  unavailable handling.
- Explicit clearing confirms the destructive action and removes the complete
  temporary workspace, including local unsaved edits.
- The complete temporary flow is verified through the real local client and API
  host composition using configured development adapters in addition to
  product-owned deterministic browser hosts.
- Tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

Mounted verification must also exercise the temporary editor through the real
local client and API composition, covering restoration, one failure-recovery
path, and complete clearing. Automated checks and browser inspection must be
recorded separately.

## Risks / questions

- The combined UI must remain calm despite exposing a rich workspace.

## Decisions this task must settle

- Any integrated focus and recovery refinements required beyond Task 031's
  approved workspace layout, without turning activity into a mandatory mode
  selector or treating current host styling as final product design.
- The exact client presentation and focus transition used when an unavailable
  server workspace leaves locally recoverable text visible but detached from
  canonical workspace state.
- The product failure-code and HTTP mapping used to make unavailable-workspace
  outcomes stable across every temporary operation.

## Blast radius

Medium: existing temporary orchestration and client recovery states. Usage
measurement remains deliberately separate in Task 039; product export is retired.

## Status

Reviewed after all four unnumbered corrections. Awaiting approval.
