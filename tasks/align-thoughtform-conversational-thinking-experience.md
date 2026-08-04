# Align the ThoughtForm conversational-thinking experience

## Goal

Make the mounted product deliver the corrected exploration, organisation, and
expression experience, culminating when useful in a first-person articulation
the user can inspect and recognise as faithful.

## Approval record

Approved by Adam on 2026-08-04 as the third of three unnumbered correction tasks,
after the canonical correction and Draft Format removal are complete.

- Exploration, organisation, and expression are the core journey.
- Articulation carries the product's characteristic recognition and potential
  catharsis, but the user may reasonably never create a Draft and there is no
  “done” state.
- Any Draft is a first-person user expression, not an assistant report or
  therapeutic analysis.
- Existing accurate Draft and compose mechanics should remain; terminology
  changes require clear evidence that the current term misrepresents intent.
- Safety work is proportionate to an owner-used portfolio demo and must not turn
  the product into an explicitly positioned mental-health product.
- Product validation comes from Adam's production use. Deterministic and hosted
  evaluation in this task verifies contracts and policy bounds rather than
  claiming market or clinical validation.
- Preference learning, output formats, export, publishing, and CMS behaviour are
  intentional boundaries and must not be reintroduced.

## Why this task is next

The canonical direction and incompatible Draft Format state must be corrected
before prompts, readiness, interface language, and evaluations can be changed as
one observable vertical slice. This task makes the product correction real
rather than leaving it as positioning copy.

## Depends on

- The unnumbered ThoughtForm conversational-thinking course correction.
- The unnumbered Draft Format removal.

## Scope

- Change product overview, onboarding, empty-state, editor, action, readiness,
  and recovery copy from writing-first assumptions to conversational thinking.
- Open with an invitation such as “What would you like to think through?”
  without asking for audience, format, publication intent, document type, or
  word count.
- Align conversation-model instructions with focused exploration, visible
  organisation, and faithful expression of the user's own thinking or feeling.
- Preserve the ordinary response pattern of one concise reflection,
  distinction, or observation and one useful question when inquiry should
  continue.
- Treat articulation readiness as advisory. Allow the user to request a Draft at
  any time and allow the assistant to offer one when a coherent expression would
  be useful.
- Compose the minimum coherent first-person plain-text shape supported by the
  selected user-established material, which may be one sentence, a paragraph, a
  list, or a longer account.
- Preserve uncertainty, mixed feelings, contradictions, provisional conclusions,
  and unresolved questions instead of manufacturing resolution or confidence.
- Strengthen the recognition-and-correction loop: the Draft remains directly
  editable; assistant revisions remain reviewable proposals; the user controls
  whether it expresses what they think or feel accurately.
- Preserve conversation-only and conversation-plus-idea-map use without
  presenting the absent Draft as failure, incompletion, or blocked progress.
- Add proportionate safety language and behaviour for an owner-used portfolio
  demo, including clear non-therapy/non-diagnostic boundaries and safe handling
  of sensitive reflection without positioning the product as mental-health
  support.
- Add deterministic browser scenarios and bounded hosted evaluations for a
  personal reflection, mixed or unresolved feelings, a practical decision, an
  idea or argument, an early articulation request, and correction of a
  misaligned Draft.
- Verify the complete corrected journey through the real client, API, configured
  development adapters, and hosted model.

## Out of scope

- A required Draft, completion status, progress score, lifecycle phase, or “done”
  state.
- Therapy, diagnosis, clinical claims, crisis-service positioning, wellbeing
  efficacy claims, emotional-dependency features, or external product research.
- Renaming accurate internal Draft, compose, drafting, persistence, route, or
  revision concepts solely for product tone.
- Preference learning, output formats, templates, audience modes, rich text,
  Markdown structure, export, publishing, or CMS behaviour.
- Final visual redesign beyond changes required for truthful, coherent mounted
  behaviour.

## Expected files to create or modify

- ThoughtForm overview, onboarding, workspace, and Draft client components
- conversation and drafting capability prompts, contracts, policy, and tests
- API-host model adapters and hosted evaluation fixtures where host translation
  or evaluation wiring is required
- product-owned deterministic fixtures, browser scenarios, and evaluations
- privacy/safety copy, product README, decisions, and `progress.md`

## Definition of done

- The mounted product consistently presents itself as a conversational thinking
  workspace rather than a tool that assumes a writing or publishing goal.
- A user can explore and organise material indefinitely without creating a Draft
  or being told that the workspace is incomplete.
- A user can request expression at any time, and the assistant can offer it
  without gating or pressure.
- Created Drafts are first-person, grounded only in user-established material,
  no longer than coherence requires, and capable of preserving uncertainty.
- The user can reject, directly correct, or request a reviewable revision until
  the Draft feels faithful without assistant interpretation becoming canonical
  silently.
- Safety and privacy language accurately describes the portfolio demo and avoids
  mental-health claims while retaining meaningful boundaries.
- Deterministic and hosted scenarios provide concrete evidence for exploration,
  organisation, expression, recognition, correction, and no-Draft use.
- The complete real-host owner flow works end to end with pending migrations
  applied.
- Tests, browser tests, typecheck, build, hosted evaluation, schema validation,
  and diff checks pass.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
RUN_HOSTED_EVALUATIONS=true pnpm evaluate:thoughtform
git diff --check
```

The completion audit must distinguish deterministic tests, hosted-model
evaluation, browser inspection, and real-host verification. None may be claimed
as evidence of another.

## Risks / questions

- Smooth generated prose can overstate certainty or sound like an assistant's
  analysis even when every included idea originated with the user.
- Readiness language can become a hidden completion gate if UI and conversation
  treatment are not reviewed together.
- “Minimum coherent shape” requires bounded policy and evaluation evidence; it
  must not become an undocumented model preference.
- Safety language can either over-medicalise a personal thinking tool or become
  too weak for emotionally sensitive public demo input.

## Decisions this task must settle

- The final product-facing terms and actions for offering, creating, and
  reviewing the optional articulation while preserving accurate internal Draft
  mechanics.
- The bounded composition instructions used to choose a coherent shape without
  format selection.
- The minimum proportionate sensitive-reflection and crisis boundary required
  for the public portfolio demo.
- Which evaluation outcomes constitute sufficient evidence to resume the
  remaining planned product work.

## Blast radius

High but product-centred: public product language, two model-backed
capabilities, readiness presentation, the complete workspace journey, safety
copy, and evaluation coverage. Persistence mechanics and host public-writing
delivery remain outside scope.

## Status

Completed on 2026-08-04.

### Corrective-pass approval record

Approved by Adam on 2026-08-04 after mounted inspection showed that removing
Draft Format left a five-row Draft grid with only four visible items. The
approved correction is limited to restoring the editor as the flexible row and
adding a browser regression assertion; broader workspace styling and responsive
redesign remain out of scope.

The corrective pass is complete. `DraftPanel` now uses four visible grid rows,
placing the editor in `minmax(0,1fr)`. The deterministic browser test requires
the editor to consume more than half of the available Draft surface. In the
mounted owner workspace the editor measured 827px of a 1,212px Draft surface
(68.2%), compared with 82px before the correction. Focused component tests,
typecheck, all three browser journeys, and diff checks pass.

## Completion audit

- Mounted language: the registry, overview, acknowledgement, opening prompt,
  composer, empty Draft state, Draft composition controls, privacy page, and
  recovery-adjacent language describe conversational thinking and optional
  expression without audience, format, publication, document-type, or word-count
  prompts.
- No-Draft use: the opening and empty Draft state explicitly say that conversation
  and the Idea Map can stand alone. The deterministic browser journey verifies
  four distinct thinking uses before any Draft exists.
- Conversation behaviour: the product-owned system policy requires grounded
  exploration, visible organisation, faithful expression, one concise reflection
  or distinction plus one question, advisory readiness, and preservation of
  uncertainty, mixed feelings, contradiction, provisional conclusions, and open
  questions.
- Expression: the hosted Draft adapter requires first person and the minimum
  coherent plain-text shape—one sentence, paragraph, list, or longer account—
  without manufactured resolution, causes, confidence, or advice. Direct editing,
  immutable history, and reviewable assistant proposals remain intact.
- Safety: acknowledgement, privacy copy, and conversation policy state that the
  portfolio demo is not therapy, diagnosis, crisis response, or professional
  support, with direct immediate-danger guidance but no mental-health positioning.
- Deterministic evidence: 200 unit/integration tests pass and three Playwright
  journeys pass, including the new six-shape conversational-thinking journey,
  optional no-Draft use, early articulation, correction, and Draft creation.
- Hosted evidence: capped personal-reflection, mixed-unresolved-feelings,
  practical-decision, idea-or-argument, early-articulation, and correction
  scenarios pass with `gpt-5-mini`; hosted first-person Draft composition passes.
  Invalid structured idea output is now a hard evaluation failure.
- Real-host evidence: pending migrations were applied (none remained), the
  signed-in owner workspace loaded through the client, API, Neon adapter, and
  hosted model, and a mixed-feeling message received one faithful reflection and
  one question without forced resolution. The persisted editable Draft and
  reviewable proposal surface loaded at revision 2.
- Repository evidence: typecheck, build, schema validation, full tests, browser
  tests, hosted evaluations, and diff checks pass. The complete branch diff was
  audited against the merge base for ownership, product/host boundaries,
  duplicated behaviour, settled decisions, documentation claims, and generated
  migration provenance; no blocker remains.

## Files changed

- Product registry and ThoughtForm client copy
- Conversation policy and structured-output contract
- Hosted Draft composition policy and tests
- Deterministic browser fixture, journey, and hosted evaluation scenarios
- Product README, decision log, progress, and task records

## Commands run

`pnpm test`, `pnpm test:e2e`, `pnpm typecheck`, `pnpm build`,
`pnpm db:validate`, bounded `pnpm evaluate:thoughtform` runs for all six
scenarios, `pnpm evaluate:thoughtform-composition`, and `git diff --check`.

## What works end to end

A person can begin with a question, experience, decision, or idea; explore and
organise it without a Draft; request an early articulation; create a minimal
first-person Draft that keeps uncertainty visible; directly correct it; and
review, reject, amend, or accept assistant revision proposals.

## Not implemented

Preference learning, formats, templates, audience modes, rich text, export,
publishing, CMS behaviour, completion state, or mental-health support.

## Risks / follow-ups

Hosted behaviour remains probabilistic and needs sustained owner use. The final
real-host check added one mixed-feeling verification turn to the existing private
verification workspace. This is deliberate development data, not product content.

## Suggested next task

Review Task 036 against the corrected product vocabulary, then complete the
temporary workspace lifecycle and recovery slice if approved.
