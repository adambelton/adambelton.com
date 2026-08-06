# Try DM Sans across the site

## Goal

Test DM Sans as an intentional, crisp site-wide typeface against the refined
public-writing hierarchy.

## Why this task is next

The existing CSS names Inter without loading it, so visitors receive differing
system fallbacks. Blackout's known DM Sans treatment provides a useful local
baseline before making a permanent font decision.

## Scope

- Add the variable DM Sans package as a self-hosted client dependency.
- Load its Latin optical-size/weight variable font locally.
- Apply it site-wide with font smoothing.
- Inspect homepage, post, About, navigation, forms, and ThoughtForm at desktop
  and mobile widths.
- Record generated font-asset impact.

## Out of scope

- Changing type scale, spacing, colours, or copy.
- Committing permanently to DM Sans if the mounted result is unconvincing.
- Loading fonts from Google or another runtime third party.

## Expected files to create or modify

- `apps/client/package.json`
- `pnpm-lock.yaml`
- `apps/client/src/styles.css`
- `progress.md`
- this task record

## Definition of done

- Browser inspection proves DM Sans is loaded rather than falling back.
- Public and product surfaces have no new wrapping, overflow, or control issue.
- Font asset and build impact are recorded.
- Focused tests, client build, mounted inspection, frozen install, and diff
  checks pass.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/pages/WritingPages.test.tsx apps/client/src/website/pages/AboutPage.test.tsx
pnpm --filter @adambelton/client build
pnpm install --frozen-lockfile
git diff --check
```

## Risks / questions

- The variable font adds an asset request and changes text metrics throughout
  the host and mounted product.

## Approval record

Approved by Adam on 6 August 2026.

- **Intentional boundaries:** test a locally bundled DM Sans variable font
  without changing the newly settled typography scale, contrast, measure, or
  spacing.
- **Important deferrals:** a permanent font decision and any more editorial
  alternative.
- **Implementation decision:** use the optical-size variable build to match
  Blackout's configuration and avoid runtime Google requests.
- **Do not reopen without new evidence:** the preceding hierarchy and reading
  refinements remain the comparison baseline.

## Status

Complete and retained on `codex/public-markdown-and-private-thoughtform`; not yet
committed or published. Adam accepted DM Sans after mounted visual review.

## Completion audit

- **Local variable font:** the client depends on
  `@fontsource-variable/dm-sans` and imports its optical-size/weight build. Global
  styles apply `DM Sans Variable` with local fallbacks and font smoothing; no
  runtime Google request exists.
- **Loaded-font evidence:** the mounted browser computed `DM Sans Variable` on
  the body, reported the font available, and its page-asset inventory observed
  `dm-sans-latin-opsz-normal.woff2` as the rendered CSS font resource.
- **Surface coverage:** mounted 390px inspection covered homepage, writing post,
  About, product catalogue, ThoughtForm overview, and login. Every surface
  computed DM Sans and remained at or below the viewport width; the login input
  and button retained inherited typography.
- **Build impact:** the production build emits a 62.72KB Latin font and 31.29KB
  extended-Latin font. Only the Latin resource was observed for current English
  content. CSS increased from 19.46KB / 4.80KB gzip to 20.19KB / 5.12KB gzip;
  JavaScript remained effectively unchanged.
- **Validation:** four focused tests passed, the client TypeScript check and Vite
  production build passed, the frozen workspace install passed with external
  network access, and `git diff --check` passed.
- **Branch audit:** the experiment changes only the client dependency, lockfile,
  and shared host typography. It does not change type scale, spacing, colour,
  copy, product behaviour, access, persistence, schema, or infrastructure. A
  concurrent user-owned edit to `packages/products/src/registry.ts` remains
  untouched and outside this completion claim.
