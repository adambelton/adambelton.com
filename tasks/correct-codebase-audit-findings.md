# Correct the codebase audit findings before Task 036

## Goal

Resolve every finding from the pre-Task-036 codebase audit so lifecycle
behaviour, ownership boundaries, terminology, testing structure, and automated
architecture enforcement provide a coherent baseline for Task 036.

## Why this task is next

Task 036 would otherwise build lifecycle hardening on reused temporary-workspace
identifiers, destructive failure recovery, fragmented lifecycle ownership,
duplicated delivery policy, stale demo terminology, mixed host responsibilities,
incomplete architecture enforcement, and misplaced browser fixture behaviour.

## Scope

- Give every recreated temporary workspace a fresh unguessable identity and
  reject stale identities.
- Preserve submitted composer text and unsaved Draft text through the audited
  request, concurrency, hosted-AI, and unavailable-workspace failures without
  persisting private content in the browser.
- Introduce the smallest product-owned temporary-workspace lifecycle contract
  needed to coordinate conversation, Idea Map, drafting state, proposals,
  revision history, and completed operations while hosts retain timers and
  in-memory mechanisms.
- Replace fire-and-forget cross-store cleanup with awaited lifecycle operations.
- Consolidate shared temporary and durable conversation HTTP delivery policy
  while keeping their security, observability, identity, and expiry differences
  explicit.
- Align current code, interface copy, tests, and current documentation with the
  owner-only temporary workspace established by Task 046. Preserve historical
  task evidence where rewriting it would misrepresent its approval context.
- Keep the API ThoughtForm mount focused on dependency assembly by moving
  disclosure and owner-observation delivery and validation into focused
  host-owned modules.
- Extend repository architecture enforcement to static imports, dynamic
  imports, side-effect imports, export-from declarations, and TypeScript import
  type expressions, with focused regression fixtures.
- Move browser scenario model behaviour from the browser host into an
  appropriate fixture or focused fake.
- Split broad production files only where the audit identified a concrete
  second responsibility: conversation prompt/schema/context/decoding, Idea Map
  mutation versus model-output validation, and client workspace orchestration
  versus presentation.
- Update the nearest owning README trees when the implemented shape changes.
- Align the About page heading and subtitle with the established public index-page
  typography convention.
- Review and narrow Task 036 against the corrected baseline.

## Out of scope

- Remaining Task 036 behaviour beyond the audited findings.
- Usage accounting, measurement, or enforcement.
- Autonomous Idea Map merge/split behaviour.
- Provider, prompt, or model behaviour changes.
- Public ThoughtForm access, visual redesign, publishing, export, or preference
  learning.
- Database schema changes or migrations.

## Expected files

- ThoughtForm temporary-workspace contracts, application coordination, HTTP
  delivery, client workspace state, and product tests.
- API ThoughtForm persistence adapters, focused host delivery/configuration
  modules, mount, and tests.
- Product browser fixtures/fakes and browser host.
- Repository architecture tests and fixtures.
- Current ThoughtForm README, architecture/privacy documentation, progress, task
  index, this task, and Task 036.

## Definition of done

- Every audit finding has concrete implementation or documentation evidence.
- Recreated temporary workspaces always receive fresh identities and stale
  clients cannot apply work to replacement state.
- Composer and Draft text remain locally recoverable through the audited failure
  paths.
- Temporary clearing is coordinated and awaited across all retained state.
- Shared conversation HTTP delivery policy has one implementation.
- Current owner-only temporary-workspace terminology is consistent.
- The host product mount is an assembly boundary rather than an HTTP delivery
  module.
- Architecture checks cover every supported import and re-export form.
- Browser scenario behaviour resides in fixtures or fakes rather than host
  composition.
- Extracted files communicate real responsibilities without speculative layers.
- Existing public and owner flows continue to work.
- Task 036 is narrowed against the corrected baseline.
- The requirement-by-requirement and complete branch-diff audits pass.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

Mounted real-host verification must cover workspace creation, clearing and
recreation, stale-identity rejection, composer recovery, unsaved Draft recovery,
coordinated clearing, and an unchanged durable owner flow. Automated checks and
browser inspection must be recorded separately.

## Risks / questions

- Lifecycle coordination must not merge the separate capability aggregates.
- Shared delivery must preserve deliberate temporary/durable differences.
- Local recovery must remain mounted React state rather than browser
  persistence.
- Historical documents must remain truthful about earlier decisions.
- Extraction must improve diagnostic routing rather than add thin indirection.

## Approval record

Approved by Adam on 6 August 2026.

- **Intentional boundaries:** address all audit findings in one unnumbered task
  before Task 036; preserve owner-only ThoughtForm access; keep persistence
  mechanisms host-owned and capability meaning product-owned.
- **Important deferrals:** remaining Task 036 lifecycle polish, usage work,
  autonomous Idea Map merge/split behaviour, public access, and visual redesign.
- **Implementation decisions left open:** the smallest lifecycle contract, the
  internal shared-delivery shape, and exact focused file boundaries that satisfy
  existing repository roles.
- **Decisions not to reopen:** no browser persistence, no database migration, no
  product publishing/export, and no provider or prompt behaviour change.
- **Approved scope amendment (6 August 2026):** align the About page heading
  scale and subtitle treatment with the Writing and Products indexes; no broader
  visual redesign.

## Status

Complete.

## Current completion audit

- Complete: fresh temporary identities, stale-identity rejection, awaited
  cross-store cleanup, product-owned cleanup coordination, composer and unsaved
  Draft recovery, shared conversation HTTP policy, host delivery extraction,
  owner-only terminology, architecture import-form coverage, scenario-fixture
  ownership, and Task 036 narrowing.
- Validated: 302 unit/integration tests pass, all workspace typechecks pass, the
  production build passes, all three deterministic browser journeys pass, and
  `git diff --check` passes.
- Complete: Idea Map model-output validation is separate from mutation rules,
  and bounded conversation model-request/context construction is separate from
  conversation application behaviour.
- Complete: the conversation prompt and output schema now have a focused model
  contract owner. The complete automated branch audit found no dependency,
  role, migration, relative-import, or unsupported-documentation blocker.
- Complete: authenticated real-host browser inspection covered temporary
  creation, fixed expiry presentation, complete clearing and recreation, early
  API-process loss, stale-workspace rejection, composer recovery, unsaved Draft
  recovery, and the unchanged durable owner conversation list. It exposed and
  corrected stale Idea Map presentation and hidden unsaved-Draft recovery before
  the mounted checks passed.

## Requirement-by-requirement completion audit

- Fresh identities and stale rejection: resolver tests prove recreated IDs
  differ and stale IDs do not load; mounted early-process loss returned the
  unavailable result without applying submitted text to replacement state.
- Recoverable local text: component regressions cover request, concurrency,
  unavailable, and failed Draft-save paths; mounted inspection confirmed both
  composer and detached Draft text remain visible.
- Coordinated clearing: the product application cleanup is awaited by the host;
  persistence tests prove cleanup completion, while mounted clearing removed
  conversation and Idea Map state before recreation.
- Delivery and boundaries: temporary and persistent routes delegate shared
  policy to `conversation-response-handler.ts`; the host mount delegates its
  disclosure and observation HTTP roles; architecture tests cover static,
  dynamic, side-effect, re-export, and import-type forms.
- Terminology, fixtures, and responsibilities: current owner-only language is
  aligned; deterministic scenario behaviour lives in fixtures; prompt/schema,
  request/context, response decoding, Idea Map mutation, and Idea Map model
  output have focused owners; the About page follows public index typography.
- Complete branch audit: no ownership, host/product, duplicated-policy,
  unsettled-decision, unsupported-documentation, relative-import, or migration
  blocker remains. No migration was introduced.
