# Restore ThoughtForm Idea Map output headroom

## Status

Complete.

## Goal

Restore the ThoughtForm Idea Map analysis ceiling from 1,536 to 3,072 tokens,
validate the autonomous split path that production exposed, and include the
existing About-page copy changes in the same pull request.

## Why this task is next

Production conversation `1610d945-2647-43ad-a48c-bb78c9442292` demonstrated
that the first ordinary Idea Map update succeeded, while the second message
triggered an autonomous split that repeatedly truncated at 1,536 tokens. Three
exact-state calls stopped at `max_tokens`; the same state completed at 3,072.
The Task 039 calibration never successfully exercised an autonomous structural
proposal before Task 040 inferred and adopted the smaller ceiling.

The affected production conversation has been repaired through a reviewed Idea
Map-only recovery revision, but the deployed ceiling remains vulnerable.

## Scope

- Change `MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS` from 1,536 to 3,072.
- Add regression coverage proving Idea Map analysis requests receive the
  restored ceiling.
- Record that the prior calibration omitted a successful autonomous split and
  that production supplied new evidence.
- Amend Task 040's documentation so it no longer presents 1,536 as a currently
  validated safe Idea Map bound.
- Update `progress.md`, `docs/decisions.md`, and the task index.
- Include the existing user-authored About-page copy changes unchanged.
- Use a dedicated `codex/` branch.

## Out of scope

- Changing `maxItems` or Anthropic schema projection.
- Automatic retries or provider fallback.
- A general Idea Map catch-up interface.
- New persistence operation kinds or migrations.
- Further editing of the About-page copy.
- Regenerating or modifying production conversation messages.
- Committing, pushing, opening a pull request, or deploying without separate
  requests.

## Expected files

- `packages/products/src/thoughtform/server/capabilities/idea-map/idea-map-analysis-service.ts`
- `packages/products/src/thoughtform/server/capabilities/idea-map/idea-map-analysis-service.test.ts`
- `docs/products/thoughtform/usage-measurement-2026-08-13.md`
- `tasks/040-calibrated-usage-enforcement.md`
- `tasks/restore-thoughtform-idea-map-headroom.md`
- `tasks/README.md`
- `docs/decisions.md`
- `progress.md`
- `apps/client/src/content/pages/about.md`

## Definition of done

- Mounted Idea Map requests use a 3,072-token ceiling.
- Automated coverage fails if the ceiling regresses.
- Documentation distinguishes the original 3,072-token measurements from the
  unvalidated 1,536-token inference.
- A bounded paid Anthropic validation successfully completes the exact
  second-turn autonomous-split state at 3,072.
- The About page builds with the existing copy changes.
- Tests, typecheck, build, end-to-end checks, and diff checks pass.
- The completion audit verifies every approved scope item and the complete
  branch diff.

## Validation commands

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
git diff --check
```

Plus one separately authorized, non-persisted mounted Anthropic split
validation using the production-derived state.

## Risks / questions

- One successful 3,072-token split is stronger than the original evidence but
  does not establish a universal upper bound.
- Restoring the larger ceiling increases worst-case output usage.
- The existing 7,000-token Idea Map reservation must be checked against
  measured input plus the restored output ceiling.
- This fixes the demonstrated truncation but does not make failures
  automatically recoverable.

## Approval record

- **Approved:** 20 August 2026 by Adam.
- **Intentional boundaries:** restore only the demonstrated Idea Map output
  headroom; retain product-owned collection limits and Anthropic transport
  projection; include the existing About-page copy without further editing.
- **Important deferrals:** automatic retry, provider fallback, general catch-up
  UI, recovery-specific persistence identity, and broader model or prompt tuning.
- **Implementation decisions:** preserve Task 040's original values as
  historical evidence and add a dated correction rather than rewriting its
  approval record; settle exact test placement within the existing Idea Map
  capability owner.
- **Do not reopen without new evidence:** the provider-compatible schema
  projection remains intentional, production conversation messages remain
  unchanged, and unrelated About-page rewriting is outside this task.

## Completion audit — 20 August 2026

### Scope and definition-of-done evidence

- **Restored ceiling:** `MAX_IDEA_MAP_ANALYSIS_OUTPUT_TOKENS` is 3,072 and the
  Idea Map analysis service passes it to every model request. Its colocated test
  asserts both the owned constant and the observable request value.
- **Production evidence:** the separately authorized non-persisted matrix used
  the production-derived second-turn state, Sonnet 5 at medium effort, and the
  mounted Anthropic schema projection. Three of three 1,536-token calls stopped
  at `max_tokens`; the 3,072-token control completed an implicit split with
  1,265 output tokens, including 755 reasoning tokens. This is paid provider
  validation, not an automated test or browser claim.
- **Historical correction:** the dated measurement and Task 040 amendments plus
  Decision 067 preserve the original approval record while identifying the
  missing autonomous-structure path and superseding only the Idea Map bound.
- **Reservation review:** the reproduced request's 3,897 input tokens plus the
  3,072 ceiling fit the 7,000-token reservation at 6,969. The largest historical
  4,803-token input could reach 7,875 at the hard ceiling; existing Task 040
  semantics permit completion above reservation, reconcile actual usage, and
  deny later admission when required. No reservation policy was changed.
- **About page:** the existing user-authored copy is unchanged by this task;
  its page test now asserts the corresponding description, and the production
  client build includes the updated repository Markdown.
- **Automated validation:** focused Idea Map tests passed 4/4; the full suite
  passed 384 tests with 16 skipped; all packages typechecked and built; all six
  Playwright browser scenarios passed; `git diff --check` passed.

### Complete branch-diff audit

- Product behavior and its regression test remain in the Idea Map capability;
  no host behavior, provider schema projection, persistence, migration, prompt,
  or usage-accounting implementation changed.
- The branch introduces no duplicated implementation or unsettled approved
  decision. The About-page test is the only necessary integration change for
  the included copy.
- Documentation distinguishes production diagnosis, paid provider validation,
  automated checks, and browser validation. It does not claim human assistive-
  technology verification or automatic recovery.
- No approved criterion is incomplete. Commit, push, pull-request creation, and
  deployment remain unperformed pending explicit requests.
