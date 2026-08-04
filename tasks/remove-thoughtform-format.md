# Remove ThoughtForm Format

## Goal

Remove Draft Format completely because selecting or retaining an intended output
form before articulation is incompatible with the corrected conversational-
thinking product.

## Approval record

Approved by Adam on 2026-08-04 as the second of three unnumbered correction
tasks, after the canonical course correction is complete.

- Draft Format is fundamentally incompatible with the product and must be
  removed rather than hidden, deprecated in place, or repackaged as a
  preference.
- Loss of retained format values is intentional; all unrelated workspace and
  Draft data must be preserved and verified.
- Accurate Draft and composition mechanics are not reopened by this removal.
- Export, publishing, Markdown structure, and replacement output-format controls
  remain outside scope.
- Schema removal must use the approved schema-first generated-migration workflow.

## Why this task is next

The course-correction task establishes the product boundary. Draft Format is the
one currently implemented capability that directly contradicts it, even though
the saved value is not yet supplied to conversation, composition, revision, or
publishing behaviour. Removing it before experience work prevents obsolete
state and controls from shaping later implementation.

## Depends on

The unnumbered ThoughtForm conversational-thinking course correction.

## Scope

- Remove `DraftFormat`, format state, format revisions, commands, validation,
  stores, ports, delivery contracts, client requests, and workspace controls.
- Remove Draft Format from temporary and durable host adapters.
- Remove the persisted database fields through the approved schema-first,
  generated-migration workflow.
- Remove format-specific tests and replace them with regression evidence that a
  workspace and Draft load and behave correctly without format state.
- Preserve all canonical Draft content, revision history, proposals,
  conversation history, idea-map state, and saved-edit interpretation.
- Update architecture, privacy, progress, README, and decision records affected
  by the removal.
- Verify the mounted owner and temporary flows through their real host
  compositions, applying the generated migration where required.

## Out of scope

- Renaming Draft, drafting, compose, or Composition.
- Changing composition prompts, readiness, opening copy, or articulation
  behaviour except where needed to remove false format references.
- Migrating format values into another preference or guidance capability.
- Export, publication, Markdown structure, audience selection, templates, or
  replacement format controls.
- Removing or rewriting canonical Draft content previously created while a
  behaviourally inert format value happened to be retained.

## Expected files to create or modify

- `packages/products/src/thoughtform/shared/types.ts`
- drafting capability service, store, ports, delivery, and tests
- ThoughtForm client draft actions and workspace components
- temporary API-host persistence adapters
- `packages/db/prisma/schema.prisma` and a generated migration
- durable ThoughtForm database adapter and integration tests
- product browser scenarios
- owning READMEs, privacy documentation, decisions, and `progress.md`

## Definition of done

- No production contract, state, UI, prompt, adapter, or database field retains
  Draft Format or an equivalent intended-output-form concept.
- The generated migration removes only the obsolete format fields and preserves
  all other workspace data.
- Existing temporary and owner work loads without compatibility errors after the
  removal.
- Creating, directly editing, restoring, and proposing changes to a Draft still
  work through the mounted product.
- The complete branch diff contains no accidental product or persistence
  boundary regression.
- Unit, browser, database integration, real-host, typecheck, build, schema, and
  diff validation pass.

## Validation commands

```txt
rg -n "DraftFormat|draftFormat|Draft Format|draft format" apps packages docs README.md progress.md
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

Run the database-connected ThoughtForm adapter suites and apply the generated
migration to the configured development database before completion. Any search
results retained in historical task or decision records must be clearly marked
as superseded history rather than active product behaviour.

## Risks / questions

- The fields were implemented recently and cross product, client, temporary,
  durable, and migration boundaries; a purely visual removal would leave false
  domain state behind.
- Migration generation must follow the repository's approved Prisma workflow and
  must not hand-edit generated SQL.
- Existing rows may contain format values. Their removal is intentional, but all
  unrelated Draft and workspace state must be proven intact.

## Decisions this task must settle

- Whether compatibility parsing is required during a rolling deployment or the
  current single-owner deployment permits coordinated schema and application
  removal.
- Which historical references remain useful enough to retain with explicit
  supersession notes.

## Blast radius

Medium to high: one product capability slice, client controls, two persistence
mechanisms, a generated schema migration, and their verification. Core Draft
behaviour should otherwise remain unchanged.

## Status

Completed on 2026-08-04.

## Completion audit

### Scope and definition-of-done evidence

- **Product contracts and operations:** `DraftFormat`, format/revision fields,
  normalization, change commands, store operations, and persistence commit input
  were removed. `DraftingState` now owns only the optional Draft, revisions, and
  active proposal.
- **HTTP and client:** the `/format` mutation and client request were removed;
  `DraftPanel` no longer loads, edits, saves, clears, or renders format state.
- **Temporary persistence:** in-memory and deterministic test adapters no longer
  compare or retain a format revision.
- **Durable persistence:** the Prisma adapter no longer selects, returns,
  compares, or updates format fields. Draft/proposal concurrency and operation
  idempotency remain intact.
- **Generated migration:** Prisma originally generated and applied a migration
  containing only the two approved column drops. That incremental file was
  intentionally retired by the later approved ThoughtForm initial-schema reset.
- **Preserved data and behaviour:** focused product/HTTP/client/adapter tests,
  real Prisma integration tests, deterministic browser journeys, and the mounted
  owner flow prove conversation, Idea Map, composition, manual save, revision,
  and reload behaviour after removal.
- **No replacement concept:** production search returns no Draft Format contract,
  route, state, persistence field, or UI control. Documentation retains only
  historical, retired, or explicit non-goal references.
- **Documentation:** Decision 046, the architecture, terminology, roadmap,
  product README, and progress record describe the removed state accurately.

### Complete branch-diff audit

- Draft meaning and behaviour remain product-owned. Concrete temporary and
  durable mechanisms changed only behind product-owned ports.
- No product behaviour or presentation moved into a host.
- Production and test hosts use the same reduced `DraftingState`; no parallel
  format implementation remains.
- The approved concurrency decision is settled: Draft and proposal revisions,
  operation idempotency, and the unique Draft relationship replace the obsolete
  format revision in relevant commits.
- Documentation does not claim browser, database, hosted-model, or real-host
  evidence without the corresponding recorded validation.
- The migration was generated by Prisma and reviewed. It contains no semantic-
  editor cleanup or unrelated schema change.

## Summary

Removed Draft Format completely through the ThoughtForm product, client,
HTTP, temporary and durable persistence, database schema, tests, and current
documentation. Preserved canonical Draft, revision, proposal, and saved-edit
behaviour.

## Files changed

- Product shared types, drafting service/store/port, HTTP route, client request,
  Draft panel, fakes, and tests.
- API in-memory persistence and database Prisma adapter/tests.
- Prisma schema and the then-current generated removal migration.
- Product architecture, terminology, roadmap, README, decisions, progress, and
  this task record.

## Commands run

```txt
pnpm typecheck
pnpm db:migrate:dev --name remove_thoughtform_format
pnpm --filter @adambelton/db exec prisma db pull --print
pnpm --filter @adambelton/db exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script --output <generated-removal-migration>/migration.sql
pnpm db:migrate:deploy
pnpm db:validate
pnpm exec vitest run packages/products/src/thoughtform/server/capabilities/drafting packages/products/src/thoughtform/server/delivery/http/draft-route.test.ts packages/products/src/thoughtform/client/workspace packages/db/src/adapters/thoughtform/draft-persistence.test.ts apps/api/src/products/thoughtform/adapters/persistence
pnpm exec vitest run packages/db/src/adapters/thoughtform/draft-persistence.integration.test.ts packages/db/src/adapters/thoughtform/conversation-persistence.integration.test.ts
pnpm test
pnpm test:e2e
pnpm build
rg -n "DraftFormat|draftFormat|Draft Format|draft format|formatRevision|changeDraftFormat|expectedFormatRevision" apps packages -g '*.{ts,tsx,prisma}'
git diff --check
```

`prisma migrate dev` correctly refused to proceed because Neon `dev` retains an
applied semantic-editor migration intentionally absent from local history. No
reset was performed. The actual database schema was inspected read-only, and
Prisma `migrate diff` generated a migration from that schema to a temporary
target that preserved the unrelated semantic columns. The resulting reviewed
SQL drops only Draft Format. `migrate deploy` then applied it successfully.

The first sandboxed Playwright attempt could not create its local IPC socket;
the required escalated rerun passed.

## What works end to end

- The real authenticated owner editor loaded through the client host, fresh API
  host, hosted model, and migrated Neon adapter.
- An existing empty owner workspace accepted a conversation turn and created one
  established idea.
- The Draft surface exposed no format control, composed revision 1, saved a
  direct edit as revision 2, and reloaded the exact canonical text.
- The mounted reload exposed zero elements labelled `Optional format guidance`.
- Both deterministic Playwright journeys pass, including composition, revision,
  proposal review, restoration, and clearing.

## Not implemented

- Product presentation, prompts, readiness language, minimum coherent
  articulation shape, recognition-loop refinements, and sensitive-use policy
  remain for the third approved correction task.
- The unrelated abandoned semantic-editor migration drift in Neon remains
  documented and was deliberately not changed by this task.

## Risks / follow-ups

- The mounted verification left a small explicit verification conversation and
  two-revision Draft in the previously empty owner workspace. It is private owner
  data and can be deleted later through the ordinary conversation lifecycle if
  desired.
- Future migrations should account for the known Neon semantic-editor drift
  without resetting owner data or absorbing unrelated columns silently.

## Suggested next task

Implement the approved unnumbered conversational-thinking experience alignment
task.
