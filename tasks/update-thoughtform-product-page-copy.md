# Update ThoughtForm product-page copy

## Goal

Replace the ThoughtForm overview-page copy with Adam's supplied Explore,
Inspect, and Articulate presentation while preserving the existing access-aware
workspace links and responsive product-page structure.

## Approval record

Approved by Adam on 2026-08-08.

- Adam's supplied wording is authoritative.
- Only mechanical JSX, punctuation, semantic-HTML, and layout adjustments are
  delegated to implementation.
- The existing domain terminology remains unchanged.
- Workspace availability, saved-conversation access, privacy routing, assistant
  behaviour, prompts, and public-beta policy must not change.
- Open-source distribution, prompt publication, hosted service operation, and
  billing remain conceptual and unimplemented.
- The work remains on `codex/refine-thoughtform-product-direction` as the tightly
  related user-facing follow-up to the completed documentation task.

## Why this task is next

The canonical documentation now treats articulation as ThoughtForm's intended
culmination, but the mounted overview still gives it the weaker earlier “when it
is useful” hierarchy. The supplied copy resolves that known mismatch and adds
the approved category, agency, and conceptual open-model framing.

## Scope

- Replace the overview introduction and gateway-use explanation.
- Present Explore, Inspect, and Articulate with the supplied descriptions.
- Add the agency and possible-open-model sections.
- Update the development snapshot.
- Preserve the beta status, workspace, saved-conversation, and privacy links.
- Update observable page tests.
- Verify desktop and narrow-mobile rendering through the real local host.
- Update the task index and progress record.

## Out of scope

- Assistant prompts or runtime behaviour.
- Editor, onboarding, privacy-page, or other product copy.
- Product terminology changes.
- Open-source licensing or distribution, prompt publication, hosted-service
  operation, billing, pricing, access policy, or beta release.

## Expected files to create or modify

- `packages/products/src/thoughtform/client/pages/OverviewPage.tsx`
- `packages/products/src/thoughtform/client/pages/OverviewPage.test.tsx`
- `tasks/README.md`
- this task record
- `progress.md`

## Definition of done

- The complete supplied copy appears on the ThoughtForm product page.
- Heading hierarchy and section structure are semantic and accessible.
- The open-model section remains explicitly hypothetical.
- The wellbeing statement retains its non-therapy boundary.
- Existing access-aware links retain their behaviour.
- Desktop and mobile layouts are readable without horizontal overflow.
- Focused tests, typecheck, build, diff checks, mounted browser verification, and
  a complete branch-diff audit pass.

## Validation commands

```sh
pnpm exec vitest run packages/products/src/thoughtform/client/pages/OverviewPage.test.tsx
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

The supplied page is substantially longer than the current overview. Responsive
rhythm and readable line length require inspection, but the copy itself must not
be editorially shortened during implementation.

## Status

Completed on 2026-08-08.

## Completion audit

### Scope and definition-of-done evidence

- **Complete supplied copy:** `OverviewPage.tsx` contains the supplied hero,
  gateway use case, Explore/Inspect/Articulate flow, agency statement, wellbeing
  boundary, possible open model, and development snapshot without editorial
  shortening.
- **Semantic structure:** the mounted DOM exposes one `h1` and five labelled
  `h2` regions. Explore, Inspect, and Articulate remain an ordered list.
- **Hypothetical open model:** the page says ThoughtForm is currently a portfolio
  project rather than a commercial service and closes by stating that the model
  is not yet how ThoughtForm operates.
- **Safety boundary:** the supplied reflection-and-wellbeing statement is
  immediately qualified by the therapist, diagnostic-tool, and professional-
  support boundary.
- **Access-aware links:** implementation changes are confined to content and
  presentation inside `OverviewPage`; the existing workspace-availability,
  owner conversation, and privacy-link conditions are unchanged. Existing link
  tests pass.
- **Responsive rendering:** real mounted checks at 1440×1000 and 390×844 found
  no horizontal overflow. All six sections remained within the mobile document,
  and no browser warnings or errors were recorded with the API host running.

### Complete branch-diff audit

- The current task changes only the ThoughtForm overview component and its
  observable tests plus task/progress documentation. It does not change prompts,
  product operations, access policy, routing, persistence, adapters, schema, or
  migrations.
- The complete branch diff retains the previously audited documentation changes
  and adds no terminology rename or unsupported launched-business-model claim.
- Product meaning and presentation remain product-owned; host composition is
  unchanged.
- The configured development database reported one migration and no pending
  migrations. No migration was created.

### Validation evidence

- Focused overview suite: 4 tests passed.
- `pnpm typecheck`: passed for all workspace projects.
- `pnpm build`: passed, including the Vite production client build.
- `git diff --check`: passed.
- `pnpm db:migrate:status`: configured development schema is up to date.
- Real client and API hosts: mounted desktop and mobile inspection passed with
  the configured database adapters and no pending migrations.
