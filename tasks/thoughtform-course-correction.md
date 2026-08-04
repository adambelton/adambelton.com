# ThoughtForm conversational-thinking course correction

## Goal

Make conversational thinking the canonical purpose of ThoughtForm and
align the authoritative product model and remaining roadmap before further
implementation.

The product helps a user explore, organise, and express what they think or feel
about a subject. Its characteristic value is the recognition that can come from
reviewing a faithful first-person articulation: “Yes, that is what I think or
feel.” Creating a Draft remains optional and does not establish a completed or
“done” workspace state.

## Approval record

Approved by Adam on 2026-08-04 together with the two following unnumbered
correction tasks, to be implemented in sequence before remaining planned product
work resumes.

- Articulation is where the product's characteristic recognition and potential
  cathartic value live, but creating a Draft is optional and never establishes a
  completed workspace state.
- The artifact remains the user's first-person expression. The assistant helps
  the user think; it does not analyse the user as a therapist or authority.
- Accurate `Draft` and compose terminology should remain. `Composition` as an
  activity may remain if the task establishes a clear relationship with
  product-facing articulation or expression.
- Draft Format is intentionally discarded despite its recent implementation.
- Preference learning is retired. Only generally useful principles may be
  recorded for possible later use; no replacement preference capability is
  implied or approved.
- Publishing remains valid only as later host-website delivery after Socratic
  Draft v1. Product publishing and export are outside the ThoughtForm scope.
- The product remains an owner-used portfolio demo. Safety language should be
  strengthened proportionately without repositioning it as a mental-health or
  commercial product.
- Validation will primarily come from Adam's sustained production use; this task
  does not add external product research or commercial validation requirements.

## Why this task is next

The current architecture already supports conversation, an inspectable idea map,
and a user-owned Draft, but its writing-tool framing and parts of the planned
roadmap now misstate the product's purpose. The canonical direction must be
corrected before removing incompatible behaviour or changing prompts and the
workspace experience.

## Scope

- Reframe ThoughtForm as a conversational thinking workspace whose core
  journey is exploration, organisation, and expression.
- Define articulation as the intended value and recognisable product outcome,
  not a required artifact, lifecycle phase, completion threshold, or “done”
  state.
- Preserve conversation-only and conversation-plus-idea-map use as valid ways to
  use the product without creating a Draft.
- Define the Draft as optional, private, editable plain text that contains the
  user's first-person articulation or expression.
- Preserve `Draft` and composing operations where they accurately name the
  artifact and mechanism. Settle whether `Composition` remains the internal
  activity name while articulation or expression carries the product-facing
  meaning.
- Keep the assistant's role as helping the user think rather than analysing,
  diagnosing, treating, or authoritatively explaining the user.
- Make safety and privacy language proportionate to an owner-used portfolio demo
  while retaining clear boundaries for sensitive reflection and public demo use.
- Remove Draft Format, product-owned export, preference learning, and publishing
  from the current ThoughtForm direction and planned product dependencies.
- Record potentially useful preference-task ideas as deferred possibilities,
  not planned product capabilities: explicit current guidance, user correction,
  inspectability, narrow scope, and the rule that guidance never overrides a
  current instruction. Do not retain inferred profiles, cross-work preference
  learning, or output-format guidance in the active roadmap.
- Preserve public writing and content delivery as later host-website work after
  ThoughtForm v1 is ready for release. The expected owner workflow begins with
  manual copy/paste, with any later export adapter, local Markdown/Obsidian
  authoring, and static-page pipeline remaining outside the product boundary.
- Update remaining task proposals and dependencies so implementation resumes
  from the corrected product direction.

## Out of scope

- Runtime behaviour, prompts, UI copy, API contracts, database schema, or
  migrations.
- Removing Draft Format from implementation.
- Building the corrected opening, articulation behaviour, or recognition loop.
- Building export, Obsidian integration, Markdown ingestion, static-site content
  delivery, or publishing.
- Renaming implementation concepts merely to make them sound more reflective.
- Commercial product discovery, external user research, clinical claims, or a
  mental-health product strategy.

## Expected files to create or modify

- `docs/products/thoughtform/thoughtform-product-brief.md`
- `docs/products/thoughtform/terminology.md`
- `docs/products/thoughtform/thoughtform-architecture.md`
- `docs/products/thoughtform/thoughtform-implementation-overview.md`
- ThoughtForm privacy and safety documentation
- `docs/decisions.md`
- `docs/product-roadmap.md`
- root and product READMEs
- `tasks/README.md` and affected planned task proposals
- `progress.md`

## Definition of done

- Every authoritative product document describes exploration, organisation, and
  expression consistently.
- Articulation is clearly valuable and encouraged without becoming a required
  completion state.
- The Draft is consistently optional, private, first-person, editable plain text.
- Product-facing articulation/expression and internal draft/composition language
  have an explicit, non-contradictory relationship.
- The assistant is not framed as a therapist, analyst, diagnostic system, or
  authority on the user's personal meaning.
- Preference learning and product-owned export/publishing are absent from the
  active product roadmap, with useful deferred preference principles retained.
- Later public writing is clearly owned by the host website and sequenced after
  product v1 readiness.
- The two following unnumbered correction tasks and all remaining numbered tasks
  have coherent dependencies and boundaries.
- Documentation search, tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
rg -n -i "writing tool|writing workspace|draft format|preference|publishing|export|articulat|composition" README.md docs tasks progress.md packages/products/src/thoughtform/README.md
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

Every retained result must be current, deliberately historical, or an ordinary
use whose meaning remains accurate.

## Risks / questions

- Replacing formal terminology too broadly could destabilise accurate domain and
  implementation language without changing product behaviour.
- The documentation must not imply that articulation is optional in value but
  mandatory as a completion gate.
- Host-owned public writing must remain architecturally separate without being
  accidentally removed from the wider website roadmap.
- Existing decisions that this correction supersedes must be identified
  explicitly rather than left contradictory.

## Decisions this task must settle

- Whether `Composition` remains the internal activity name and, if so, how it is
  described alongside product-facing articulation or expression.
- The exact product-facing name for the optional plain-text outcome and its
  creation action.
- Which existing numbered product tasks remain, are revised, or are retired.
- The v1 boundary that later host public-writing work depends on.

## Blast radius

High documentation and roadmap impact, but no runtime impact. This task changes
canonical product meaning and supersedes prior framing, so it must be completed
before either implementation correction begins.

## Status

Completed on 2026-08-04.

## Completion audit

### Scope and definition-of-done evidence

- **Conversational-thinking purpose:** the canonical product brief, root and
  product READMEs, product roadmap, architecture, and Decision 045 now define
  exploration, organisation, and expression as the product journey.
- **Articulation without completion:** the brief, architecture, terminology, and
  Decision 045 define articulation as the product outcome and recognition value,
  while explicitly rejecting a required Draft, phase, progress score, or “done”
  state.
- **Valid no-Draft use:** the brief, architecture invariants, roadmap, and revised
  Task 036 explicitly preserve conversation-only and conversation-plus-Idea-Map
  use.
- **First-person plain-text Draft:** the brief, architecture, terminology, and
  Decision 045 define the optional Draft as canonical private first-person plain
  text that can preserve uncertainty.
- **Terminology relationship:** Discovery remains the thinking activity;
  Composition remains the internal Draft activity; compose remains the operation;
  Draft remains the artifact; articulation names the recognisable product
  outcome. No runtime rename is implied.
- **Assistant and safety boundary:** the brief and privacy note distinguish help
  with thinking from therapy, diagnosis, crisis support, clinical intervention,
  or authoritative analysis. The scope remains proportionate to an owner-used
  portfolio demo.
- **Retired directions:** Tasks 035, 037, 041, and 043 are marked retired. Task
  042 is marked superseded pending a new post-v1 host-website proposal. The
  roadmap and task index remove preference learning, product export, and product
  publishing from active product work.
- **Deferred preference principles:** the brief, Decision 045, task index, and
  historical Task 035 retain only explicitness, inspectability, correction,
  narrow scope, and current-instruction precedence as possible future design
  considerations without approving a capability.
- **Host public writing:** the roadmap and Decision 045 place local Markdown and
  static public content in later host-website delivery after ThoughtForm v1,
  with no product publishing bridge.
- **Task coherence:** Task 036 no longer depends on preferences or requires a
  Draft; Tasks 038 and 039 have corrected dependencies; the two following
  unnumbered task proposals record their approval and sequence.
- **Documentation status:** the early implementation overview is now explicitly
  historical and points to the canonical brief and architecture, preventing its
  obsolete phase, preference, format, export, and publishing examples from
  competing with current authority.

### Complete branch-diff audit

- Changes are documentation and task records only; no production source,
  contracts, schema, generated migration, or host adapter changed.
- Product meaning remains owned by `packages/products` and its canonical product
  documentation; later website delivery remains host-owned.
- No product behaviour or presentation was moved into a host.
- No production/test implementation was duplicated.
- The approved activity/outcome terminology decision is settled explicitly.
- `progress.md`, READMEs, privacy documentation, and task status claims match the
  documentation-only change and do not claim browser or real-host verification.
- No migration was created or required.

## Summary

Corrected ThoughtForm's canonical purpose from a writing-first tool to a
conversational thinking workspace while preserving its sound implemented
architecture. Articulation now names the optional Draft's recognition value;
Composition remains the accurate internal activity. Retired incompatible roadmap
directions and separated later public writing into host-website delivery.

## Files changed

- Canonical ThoughtForm brief, architecture, terminology, privacy note, and
  historical implementation-overview status.
- Root and product READMEs, repository decisions, product roadmap, and progress.
- Task index, affected numbered historical/planned tasks, and the three approved
  unnumbered correction proposals.

## Commands run

```txt
rg -n -i "writing tool|writing workspace|draft format|preference|publishing|export|articulat|composition" README.md docs tasks progress.md packages/products/src/thoughtform/README.md
rg -n -i "writing tool|writing workspace|blank page|preference learning|product publishing|publishing bridge|product-owned export|draft format" README.md packages/products/src/thoughtform/README.md docs/products/thoughtform/thoughtform-product-brief.md docs/products/thoughtform/thoughtform-architecture.md docs/products/thoughtform/terminology.md docs/products/thoughtform/privacy-and-data-lifecycle.md docs/product-roadmap.md docs/decisions.md tasks/README.md progress.md
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

The first concurrent `pnpm typecheck` attempt raced `pnpm build` while both
generated the Prisma client and failed with `EEXIST`. Build passed, and the
required standalone typecheck was rerun successfully.

## What works end to end

This was a documentation and roadmap correction, so it did not change a mounted
user flow. The authority chain now leads coherently from the product brief to the
architecture, terminology, decisions, roadmap, task sequence, READMEs, privacy
note, and progress record.

## Not implemented

- Draft Format remains in runtime and database state until the next approved
  unnumbered task removes it through a generated migration.
- Product copy, prompts, readiness, articulation behaviour, safety behaviour, and
  evaluations remain unchanged until the third approved correction task.
- The complete temporary demo, usage protection, v1 release work, and later host
  static-content delivery remain future tasks.

## Risks / follow-ups

- Historical decisions and task files intentionally retain superseded language;
  Decision 045 and retirement notices establish their current status.
- The implementation and canonical model temporarily differ on Draft Format.
  The next task should close that bounded gap before other product work resumes.

## Suggested next task

Implement the approved unnumbered Draft Format removal task.
