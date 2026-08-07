# Task 036 — Harden the temporary workspace lifecycle and recovery

## Goal

Harden ThoughtForm's temporary workspace so conversation, Idea Map, optional
Draft, revision history, revision proposals, and completed-operation records
behave as one coherent, private, expiring unit across restoration, clearing,
process loss, and hosted-AI failure.

## Why this task is next

The core capabilities now exist and must work together as one comprehensible,
private, temporary experience before final usage limits are calibrated. The
same lifecycle must be exercised with isolated authenticated non-owner users in
development while the deployed production host keeps non-owner access closed
until a later demo-release task approves opening it.

## Depends on

The completed unnumbered correction tasks, including the pre-036 codebase-audit
correction that established fresh temporary identities, awaited cross-store
cleanup, shared HTTP delivery, and mounted-state text recovery.

## Scope

Hardens the remaining baseline capabilities under **Client and API
responsibilities** and the temporary portion of **Persistence architecture**.

- Harden the already integrated conversation, Idea Map, optional Draft, retained
  revision history, revision proposal, and completed-operation capabilities
  under one temporary-workspace lifecycle.
- Make expiry, early process loss, and clear-session behaviour coherent across
  conversation, Idea Map, Draft state, revision history, proposals, and
  completed-operation records.
- Exercise guided and user-led paths through conversation-only,
  conversation-plus-Idea-Map, and optional-Draft workspaces.
- Improve the remaining empty, loading, status, focus, recovery, and unavailable
  transitions across the workspace.
- Preserve the established temporary-conversation unavailable result and
  detached local-text recovery, then extend equivalent lifecycle handling where
  it is missing across this explicit temporary-operation inventory:
  - restore or load the current temporary workspace;
  - clear the complete temporary workspace;
  - send a streamed or non-streamed conversation response;
  - focus, satisfy, park, dismiss, reopen, or correct an Idea Map idea;
  - load drafting state;
  - compose the first Draft;
  - save direct Draft edits;
  - restore a historical Draft revision;
  - interpret a saved Draft change;
  - create or amend a revision proposal; and
  - accept, reject, or dismiss a revision proposal.
- Audit whether completed-operation records for those operations share the same
  expiry and clearing boundary, and correct any concrete escape.
- Introduce a host-owned environment or release gate that enables authenticated
  non-owner temporary-workspace access in development while production remains
  owner-only. Enforce the gate authoritatively in the API and mirror it in the
  client only as a route-presentation decision.

## Settled constraints

- `/products/thoughtform/editor` is the temporary workspace for authenticated
  users when the host deployment enables their access. Development enables
  authenticated non-owner access; production remains owner-only until a
  separately approved demo-release task changes that release policy.
- The owner may use the same temporary workspace and also has separate,
  owner-only ID-addressed durable conversation and workspace routes.
- Each authenticated user with temporary-workspace access has at most one
  current temporary workspace, isolated by authenticated user and identified by
  an unguessable identifier.
- Non-owner users never receive access to durable owner conversations or any
  owner-only observation surface.
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
- The existing detached composer and Draft presentation, fresh replacement
  identity, stale-client rejection, awaited complete clearing, canonical
  conversation and Idea Map removal, and temporary-conversation
  `conversation_unavailable` HTTP mapping are completed baseline behaviour.
  This task may extend but must not redesign or reopen them without new evidence.
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

- Enabling non-owner ThoughtForm access in production.
- Durable non-owner workspaces or temporary content persistence.
- Usage accounting, measurement, limits, or enforcement.
- Host public-website delivery, preference learning, live research, publishing,
  export, autonomous Idea Map merge/split behaviour, or broad visual redesign.

## Expected files to create or modify

- Existing ThoughtForm client workspace actions, orchestration, and presentation
  modules for concrete uncovered transitions.
- Product-owned temporary-operation result contracts and HTTP mappings only
  where the operation audit proves coverage is missing.
- API-host access policy and ThoughtForm composition, plus matching client route
  presentation, for the development-enabled and production-disabled non-owner
  gate.
- Focused product tests, host access/composition tests, deterministic browser
  journeys, privacy and architecture documentation, progress, and task index.

Existing lifecycle coordination, shared conversation HTTP delivery, in-memory
conversation and Draft adapters, and product mounts change only if a specific
remaining behaviour requires it. This task does not authorise a new
architectural pattern or a speculative server/store rewrite.

## Definition of done

- An authenticated user with temporary-workspace access can explore and organise
  temporary material without a Draft and can create and refine a first-person
  Draft without durable content persistence when useful.
- Development permits authenticated non-owner temporary workspaces, keeps two
  users' work isolated, and continues to deny non-owner access to durable owner
  routes. Production continues to deny every non-owner ThoughtForm operation.
- Both guided discovery and explicit user-led composition work end to end.
- Clearing, fixed expiry, early process loss, and hosted-AI failure remain
  coherent across the complete workspace rather than conversation alone.
- Conversation, Idea Map, Draft state, revision history, proposals, and completed
  operations share one expiry and clearing boundary.
- Every operation in the explicit inventory returns an equivalent stable
  unavailable-workspace outcome after expiry or early loss; the client clears
  stale canonical identity without discarding locally recoverable text or
  silently applying it to a new workspace.
- Existing request, hosted-AI, concurrency, and unavailable recovery regressions
  remain green while each uncovered operation from the explicit inventory
  receives equivalent stable unavailable handling.
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
local client and API composition. It must cover an authenticated non-owner in
development, isolation between two authenticated users, restoration, at least
one non-conversation unavailable recovery path, complete clearing, denial of a
durable owner route to a non-owner, and continued production denial. Automated
checks and browser inspection must be recorded separately.

## Risks / questions

- The combined UI must remain calm despite exposing a rich workspace.
- A development access gate must not accidentally enable production demo access.
- Lifecycle handling must not merge the distinct conversation, Idea Map, and
  drafting aggregates.

## Decisions this task must settle

- Any integrated focus and recovery refinements required beyond Task 031's
  approved workspace layout, without turning activity into a mandatory mode
  selector or treating current host styling as final product design.
- Which inventoried temporary operations genuinely lack unavailable-workspace
  coverage or a coherent client transition.
- The narrow product result-contract and HTTP-mapping extensions required for
  uncovered operations while preserving the established temporary-conversation
  mapping.
- Whether any completed-operation record currently escapes the common expiry or
  clearing boundary.
- The exact guided and user-led scenarios needed to prove the complete lifecycle.
- The smallest host-owned access-policy configuration that defaults safely for
  production and can later be removed or enabled without changing product
  lifecycle behaviour.

Approval of this proposal intentionally changes the release-boundary direction
recorded in Decisions 053 and 055: authenticated-user temporary workspaces are
the intended capability, development enables non-owner access, and production
retains an owner-only release gate. Implementation must update
`docs/decisions.md` to supersede the conflicting product-level owner-only
language while preserving owner-only durable work.

## Blast radius

Medium: existing temporary orchestration, client recovery states, and host access
composition. Usage measurement remains deliberately separate in Task 039;
product export is retired.

## Approval record

Approved by Adam on 7 August 2026.

- **Intentional boundaries:** authenticated-user temporary workspaces are the
  intended capability; authenticated non-owner access is enabled only in
  development; production remains owner-only; durable conversations and owner
  observation remain owner-only in every environment.
- **Important deferrals:** production demo release, usage accounting,
  measurement and enforcement, durable non-owner workspaces, browser content
  persistence, autonomous Idea Map merge/split behaviour, publishing, export,
  preference learning, live research, and broad visual redesign.
- **Implementation decisions left open:** the smallest safe host-owned access
  gate; which inventoried operations lack unavailable handling or coherent
  client transitions; narrow result-contract and HTTP extensions; any escape of
  completed-operation records from lifecycle cleanup; remaining focus/status
  refinements; and exact complete-lifecycle verification scenarios.
- **Decisions not to reopen:** fixed 24-hour lifetime, fresh replacement
  identities, stale-client rejection, awaited complete clearing, detached
  composer and Draft recovery, no automatic submission of recovered text,
  existing temporary-conversation unavailable semantics, no browser persistence,
  distinct capability aggregates, the Task 031 responsive structure, and
  product-owned lifecycle meaning with host-owned mechanisms.
- **Decision-record change approved:** supersede the product-level owner-only
  language in Decisions 053 and 055 with an authenticated-user temporary
  capability controlled by a development-enabled, production-disabled host
  release gate, while preserving owner-only durable work.

## Status

Approved. Implementation in progress.
