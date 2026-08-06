# Task 048 — Compile repository Markdown at build time

## Goal

Remove Markdown, YAML, and syntax-tree parsers from the browser bundle by
compiling repository content during Vite development and production builds.

## Why this task is next

Task 047 reduced the initial client chunk to 532.74 KB / 167.80 KB gzip, but
public visitors still download the complete authoring parser toolchain even
though deployed repository content is immutable.

## Scope

- Add a host-owned Vite content compiler beneath the website content capability.
- Parse and validate all page/post YAML and Markdown as one build-time collection.
- Generate sanitized HTML and browser-safe metadata.
- Preserve ordering, duplicate-slug, date, Obsidian compatibility, GFM, and
  source-specific validation behaviour.
- Render only compiler-produced sanitized HTML in the client.
- Remove parser packages from browser runtime dependencies and verify their
  absence from generated browser chunks.
- Preserve Markdown hot reload in local development.
- Update tests, authoring guidance, task records, and progress.

## Out of scope

- Authoring-contract changes, new Obsidian extensions, remote content, CMS
  behaviour, application-wide static HTML generation, further route splitting,
  or visual redesign.

## Expected files to create or modify

- `apps/client/vite.config.ts`
- `apps/client/src/website/content/build/`
- browser-safe compiled-content contracts, collection, and renderer
- content/page tests, dependencies, authoring docs, task index, and progress

## Definition of done

- Vite development/build compiles and validates the complete content collection.
- Invalid content fails with an actionable source filename.
- Existing content renders through sanitized compiled HTML.
- Runtime chunks contain no authoring parser modules.
- Bundle reduction is measured and recorded.
- Tests, typecheck, build, frozen install, Playwright, mounted inspection, and
  diff checks pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm exec playwright test
pnpm install --frozen-lockfile
git diff --check
```

## Risks / questions

- Only the sanitizer-produced branded HTML contract may reach the renderer.
- The generated module and file watcher remain a narrow host-build mechanism,
  not a reusable product or repository-wide content architecture.

## Approval record

Approved by Adam on 2026-08-06.

- **Intentional boundary:** preserve the Task 046 authoring contract while
  moving its parser execution from browser runtime to the Vite host build.
- **Important deferrals:** new Markdown syntax, remote content, static site
  generation, route splitting, and redesign.
- **Implementation decisions:** use one generated virtual collection so
  cross-file validation occurs during build; expose only sanitized branded HTML.
- **Decision not to reopen:** content remains repository-backed, host-owned, and
  independent of ThoughtForm.

## Status

Complete.

## Completion audit

- **Build-time collection:** the host Vite/Vitest plugin reads every page and
  post, compiles them as one collection, watches the source files, and exposes a
  browser-safe generated module. Duplicate slugs fail collection compilation.
- **Validation and Obsidian contract:** focused compiler tests cover CRLF/YAML
  properties, calendar dates, deterministic ordering, duplicates, supported GFM,
  unsupported Obsidian extensions, and root-relative image policy.
- **Sanitization boundary:** Remark/Rehype compilation removes raw script HTML
  and unsafe URL protocols before branding the result as `SanitizedHtml`; the
  browser renderer accepts only that branded contract.
- **Runtime dependency boundary:** Markdown, YAML, Unified, Remark, Rehype,
  Micromark, and GFM parser sources are absent from production source maps and
  parser packages are client development dependencies only.
- **Measured output:** the Task 047 initial chunk fell from 532.74 KB / 167.80 KB
  gzip to 275.31 KB / 88.67 KB gzip. The lazy ThoughtForm chunk remains 103.32
  KB / 32.67 KB gzip.
- **Validation:** 285 unit tests passed with five hosted tests skipped;
  repository typecheck and build passed; the frozen dependency installation
  passed; all three Chromium product journeys passed; `git diff --check` passed.
- **Mounted verification:** the real client/API hosts started with no pending
  migrations. Homepage, About, and complete post content rendered, and a
  temporary Markdown edit plus restoration triggered browser-visible Vite
  recompilation both times. This was browser inspection, not human
  assistive-technology verification.
- **Branch audit:** compilation and validation remain host website concerns;
  browser code receives only data and sanitized HTML; no product behaviour,
  access, API, persistence, or schema boundary changed.
