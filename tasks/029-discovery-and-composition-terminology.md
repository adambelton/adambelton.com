# Task 029 — Replace articulation with composition

## Goal

Correct the ThoughtForm's conceptual vocabulary so its two activities are
discovery and composition. Discovery includes finding language for what the user
means. Composition creates and continually develops the canonical draft.

## Why this task is next

The previous discovery/articulation distinction blurred idea exploration with
work on the draft. Correcting it before richer conversation behaviour prevents
that ambiguity from spreading into prompts, controls, and evaluations.

## Scope

- Replace formal product uses of articulation with composition.
- Define a composition request as the operation that first creates the draft.
- Preserve movement from composition back to discovery when writing exposes a
  gap.
- Remove the standalone articulate user intention.
- Update product contracts, tests, authoritative documentation, decisions,
  progress, and planned tasks.
- Renumber the remaining proposed tasks.

## Out of scope

- Richer conversation behaviour, readiness assessment, draft creation, or
  composition UI.
- Persistence or database changes.
- A persistent workspace mode or lifecycle phase.

## Expected files to create or modify

- product activity and user-intention contracts and tests
- product brief, architecture, implementation overview where applicable,
  roadmap, decisions, and progress
- planned task files and task index

## Definition of done

- Formal product contracts use discovery and composition as activities.
- Finding words before a draft exists remains discovery.
- Composition is tied to creating or working on the canonical draft.
- Ordinary descriptive uses of articulate remain where they are clearer English.
- Planned tasks and cross-references are coherent.
- Tests, typecheck, build, and diff checks pass.

## Validation commands

```txt
rg -n -i "articulat" docs tasks progress.md packages/products/src/thoughtform
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

Remaining search results must be intentionally historical or ordinary descriptive
language rather than part of the current formal taxonomy.

## Risks / questions

- Architecture documentation also uses composition to describe dependency
  assembly. Those contextual uses do not create a code-level naming conflict and
  remain unchanged.
- Mechanical replacement must not make ordinary prose less precise.
- Renumbering planned tasks requires coherent cross-references.

## Status

Complete.
