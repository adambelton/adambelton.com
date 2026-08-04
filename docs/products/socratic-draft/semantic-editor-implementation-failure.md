# Semantic editor implementation failure retrospective

## Status

Historical engineering retrospective, recorded 4 August 2026. The semantic
editor implementation has been abandoned and reverted. The failure remains
relevant to future work because it exposed a breakdown in how task completion
was assessed.

## What failed

The implementation was reported complete even though several approved Task 034
criteria and established repository rules were not satisfied:

- the promised semantic selection contract remained source offsets and selected
  text, resolved in the client with ambiguous first-match text search;
- revision history and proposal review displayed Markdown punctuation rather
  than rendering semantic document structure;
- the server accepted code constructs that the editor could not create or edit;
- semantic change classification included descendant content and parser position
  metadata, causing ordinary edits to be misclassified as structural changes;
- proposal acceptance did not independently validate the fully assembled
  canonical document immediately before persistence;
- image placeholders lacked an explicit accessible removal operation;
- the custom modal link UI did not implement the complete keyboard and focus
  behaviour implied by its semantics;
- product editor styles were placed in the host stylesheet and duplicated in
  the product browser host;
- a migration was manually authored despite the established schema-first,
  generated-migration workflow;
- the completion record overstated browser inspection as evidence for flows and
  assistive-technology behaviour that had not been verified.

These were not optional refinements. They contradicted the approved scope,
definition of done, product ownership boundary, accessibility intent, or
repository workflow.

## Why the completion report was wrong

Automated tests, typecheck, build, and a successful authenticated happy path were
treated as sufficient proof of completion. They were not mapped back to each
approved requirement, and the complete branch diff was not audited before the
completion claim. Consequently, tests proved only the scenarios they contained,
while missing requirements were mistaken for implemented behaviour.

Documentation was then written from architectural intent rather than verified
facts. That amplified the error by making incomplete contracts appear settled
in the progress record and product README.

The task also contained implementation decisions—semantic range addressing,
code policy, nesting, accessible controls, and migration strategy—that were
supposed to be settled through evidence. Work proceeded without explicitly
closing each one.

## Corrective action

The semantic implementation, its migration, dependencies, styles, tests, task
renumbering, and architecture claims have been reverted to the state before the
investigation. The expanded substantive-edit interpretation proposal has been
restored as Task 034. No semantic format or editor-spike artifact remains in the
runtime architecture.

`AGENTS.md` now requires a requirement-by-requirement completion audit before a
task can be reported complete. The audit must cite evidence for every approved
scope and definition-of-done item, inspect the complete branch diff and
ownership boundaries, close delegated implementation decisions, verify
migration provenance, and distinguish automated, browser, and human
assistive-technology evidence.

## Lessons retained

- Validation commands are necessary gates, not a substitute for scope review.
- A manual walkthrough must be derived from requirements, not only from the
  implemented happy path.
- Product ownership includes required presentation behaviour, not only domain
  types and server logic.
- A canonical representation, editor capabilities, review surfaces, and change
  contracts must agree end to end.
- Accessibility claims require evidence for the complete interaction, including
  dismissal, focus recovery, removal, error handling, and assistive technology.
- Documentation must describe established behaviour and identify incomplete
  work plainly.
- Abandoning a feature does not erase the engineering-process failure that
  occurred while attempting it.
