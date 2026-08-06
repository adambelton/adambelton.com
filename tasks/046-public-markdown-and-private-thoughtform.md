# Task 046 — Establish public Markdown content and private ThoughtForm access

## Goal

Establish the host client's repository-backed Markdown content system, seed it
with placeholder page and post documents, make product information public, and
restrict the ThoughtForm application itself to the owner.

## Why this task is next

The public website needs a dependable content foundation before final copy and
production deployment. At the same time, the current catalogue is unnecessarily
authenticated while the incomplete ThoughtForm workspace remains available to
signed-in demo users. This task establishes the intended launch boundary.

## Scope

- Add host-owned `content/pages` and `content/posts` folders containing Markdown.
- Render the About page from a placeholder page document.
- List repository-backed posts on the homepage newest-first by explicit creation
  metadata and render each complete post at `/writing/:slug`.
- Fail clearly for invalid metadata, duplicate slugs, and unsupported
  Obsidian-only syntax rather than silently producing broken public output.
- Support standard Obsidian-authored Markdown and YAML properties, tolerate
  harmless extra properties, and document the asset/link convention.
- Make the product catalogue, ThoughtForm overview, and product privacy page
  public.
- Make every ThoughtForm workspace route and API operation owner-only.
- Remove public copy implying that a generally available demo exists.
- Update relevant tests, architecture/authoring documentation, task status, and
  `progress.md`.

## Out of scope

- Final About or first-post copy.
- Production hosting, DNS, secrets, or deployment configuration.
- A CMS, database-backed writing, browser editor, draft/scheduling states,
  tags, feeds, pagination, search, or rich embeds.
- ThoughtForm publishing/export, demo-user access, or domain-behaviour changes.

## Expected files to create or modify

- `apps/client/src/content/pages/*.md`
- `apps/client/src/content/posts/*.md`
- host-owned content loading, validation, rendering, pages, routes, and tests
- client product mounting and product-owned route presentation/tests
- API ThoughtForm host access resolution and tests
- product registry, architecture/authoring documentation, task index, and
  `progress.md`
- client dependencies required for safe Markdown and YAML parsing

## Definition of done

- About renders from placeholder Markdown.
- The homepage lists posts newest-first by `createdAt`, and each links to its
  complete `/writing/:slug` route.
- Unknown post slugs use the host not-found experience.
- Invalid metadata, duplicate slugs, and unsupported Obsidian-only syntax fail
  deterministically.
- Anonymous visitors can see public product information and privacy pages.
- Anonymous and signed-in non-owner visitors cannot access ThoughtForm workspace
  routes or operations; the owner flow still works.
- Focused tests, full tests, typecheck, build, Playwright, and diff checks pass.
- Mounted host verification and the completion/diff audit are recorded.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm exec playwright test
git diff --check
```

## Risks / questions

- Raw HTML remains disabled. Obsidian wikilinks, embeds, callouts, tags, and block
  references are not silently approximated; unsupported constructs fail with a
  source-specific message until deliberately supported.
- Public assets use an explicit root-relative convention so nested writing routes
  do not change their resolution.
- `createdAt` is the canonical creation order. Equal dates use a documented
  stable slug tie-break rather than file discovery order.

## Approval record

Approved by Adam on 2026-08-06.

- **Intentional boundaries:** repository-backed Markdown is host-owned; page and
  post documents live separately; final content and deployment remain later
  tasks; ThoughtForm information is public while the workspace is owner-only.
- **Important deferrals:** final copy, production deployment, CMS behaviour,
  advanced publishing features, and Obsidian-specific extensions.
- **Implementation decisions left open:** the smallest compatible Markdown/YAML
  libraries, internal loader/component shape, and stable same-date ordering.
- **Decisions not to reopen:** ordering uses explicit creation metadata rather
  than filesystem timestamps; content remains independent of ThoughtForm; the
  existing uncommitted status-reconciliation changes are absorbed into the new
  dedicated branch.

## Status

Complete.

## Completion audit

- **Content folders and placeholders:** `apps/client/src/content/pages/about.md`
  and `apps/client/src/content/posts/first-post.md` establish the approved
  repository shape with explicit placeholder copy.
- **Page and post rendering:** the content loader validates YAML and Markdown;
  About consumes page content; the homepage orders the post collection; and
  `/writing/:slug` renders the complete post or host not-found page.
- **Obsidian boundary:** standard and GitHub-flavoured Markdown plus extra YAML
  properties are supported. Focused fixtures verify CRLF documents and clear
  rejection of unsupported wikilinks, embeds, callouts, tags, block references,
  and relative images.
- **Public product information:** `/products`, the ThoughtForm overview, and its
  privacy route declare public access. Public overview presentation contains no
  workspace call to action.
- **Owner-only workspace:** every ThoughtForm workspace client route declares
  owner access, and both temporary and persistent API store resolution reject
  non-owner sessions. Focused route, overview, registry, and API tests pass.
- **Validation:** 283 unit tests passed with five hosted tests skipped; repository
  typecheck and build passed; all three deterministic Chromium journeys passed;
  `git diff --check` passed.
- **Mounted verification:** the real client/API hosts started successfully,
  applied the development migration check with no pending migrations, rendered
  the homepage, About, complete post, catalogue, and public ThoughtForm overview,
  and retained owner editor access. This was browser inspection, not human
  assistive-technology verification.
- **Branch audit:** the complete working-tree diff was inspected for ownership,
  product/host duplication, access-boundary, documentation, and migration
  violations. Content stays host-owned, access enforcement stays host-owned,
  product presentation stays product-owned, no schema change exists, and the
  previously uncommitted task-status reconciliation changes remain preserved.
