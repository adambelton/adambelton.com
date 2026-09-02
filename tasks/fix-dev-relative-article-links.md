# Fix DEV relative article links

## Goal

Ensure root-relative links in syndicated Markdown continue to point to
`adambelton.com` when rendered by DEV.

## Why this task is next

The published Engineering Capability Profile article's `/about` link resolves
against DEV's origin and incorrectly navigates to DEV's About page.

## Scope

- Convert root-relative Markdown link destinations to absolute production URLs
  in DEV payloads.
- Preserve fragment-only and already-absolute destinations.
- Add focused regression coverage.
- Resynchronise and verify the corrected live DEV article after deployment.

## Out of scope

- Website article wording, metadata, images, or visible link styling.
- Changes to external or fragment-only links.

## Expected files to create or modify

- `apps/client/src/website/content/syndication/dev-to-syndication.ts`
- `apps/client/src/website/content/syndication/dev-to-syndication.test.ts`
- `progress.md`
- this task record

## Definition of done

- The DEV payload uses `https://adambelton.com/about` for the article's final
  link.
- Root-relative images retain their existing absolute conversion.
- Fragment-only and already-absolute links remain unchanged.
- Focused tests, typecheck, syndication dry run, and CI pass.
- The live DEV article contains the corrected destination.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/content/syndication/dev-to-syndication.test.ts
pnpm typecheck
pnpm syndicate:dev-to --dry-run
git diff --check
```

## Risks / questions

- Markdown link syntax has edge cases; the change deliberately retains the
  adapter's existing inline-link scope rather than attempting to rewrite
  reference definitions or HTML anchors.

## Approval record

Approved by Adam on 2 September 2026.

- **Intentional boundaries:** transform only root-relative inline Markdown
  destinations in the DEV payload.
- **Important deferrals:** reference-style Markdown links and HTML anchors,
  neither of which is used by the affected article.
- **Implementation decisions:** reuse the production origin already owned by
  the syndication adapter and cover links and images with the same transform.
- **Do not reopen without new evidence:** the authored website link remains
  `/about`.

## Status

Implemented and locally validated on `codex/fix-dev-relative-links`; live DEV
verification follows merge and automatic resynchronisation.

## Completion audit

- **Root-relative links:** `markdownForDev` now converts `/about` to
  `https://adambelton.com/about` in the DEV payload using the adapter's existing
  production origin.
- **Existing destination behaviour:** focused coverage confirms root-relative
  images retain their absolute conversion while fragment-only and already-
  absolute links remain unchanged.
- **Validation:** all 12 focused syndication tests, repository typecheck, the
  four-post DEV dry run, and `git diff --check` pass.
- **Branch audit:** the complete branch diff is confined to the host-owned DEV
  adapter, its colocated test, and required task/progress records. It changes no
  article copy, metadata, styling, assets, product behaviour, persistence,
  schema, migration, auth, or prompt fallback.
- **Pending external evidence:** CI, automatic DEV resynchronisation, and the
  corrected live DEV destination require the approved commit, push, and merge.
