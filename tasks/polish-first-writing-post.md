# Polish the first public writing post

## Goal

Make the first real writing post responsive, readable, and correctly identified
by the browser.

## Why this task is next

Mounted inspection of the finished post exposed launch-facing presentation
defects that placeholder content could not reveal.

## Scope

- Prevent long breadcrumb labels from widening the mobile viewport.
- Restore visible ordered and unordered Markdown list markers and indentation.
- Set the writing post's document title and description from its metadata.
- Add focused regression coverage and repeat mounted desktop/mobile inspection.

## Out of scope

- Rewriting the post or redesigning the website.
- Canonical URLs, social cards, feeds, or broader SEO work.
- Changes to the Markdown authoring contract.

## Expected files to create or modify

- `apps/client/src/ui/components/Breadcrumbs.tsx`
- `apps/client/src/ui/components/Breadcrumbs.test.tsx`
- `apps/client/src/styles.css`
- `apps/client/src/website/pages/WritingPostPage.tsx`
- `apps/client/src/website/pages/WritingPages.test.tsx`
- `progress.md`
- this task record

## Definition of done

- The post has no horizontal overflow at a 390px viewport.
- Markdown ordered and unordered lists show the expected markers.
- The document title and description match the current post.
- Desktop presentation remains intact.
- Focused tests, client build, mounted inspection, and diff checks pass.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/ui/components/Breadcrumbs.test.tsx apps/client/src/website/pages/WritingPages.test.tsx apps/client/src/website/content/content.test.ts
pnpm --filter @adambelton/client build
git diff --check
```

## Risks / questions

- Long current-page labels must wrap without degrading shorter product
  breadcrumbs.

## Approval record

Approved by Adam on 6 August 2026.

- **Intentional boundaries:** correct the observed post presentation and route
  metadata without redesigning the site or editing the post.
- **Important deferrals:** canonical URLs, social metadata, feeds, and broader
  SEO work.
- **Implementation decision:** keep the responsive correction in the shared
  breadcrumb because the defect belongs to that shared component.
- **Do not reopen without new evidence:** the repository-backed Markdown
  authoring and build-time compilation contracts remain unchanged.

## Status

Complete on `codex/public-markdown-and-private-thoughtform`; not yet committed or
published.

## Completion audit

- **Responsive breadcrumb and article:** the current breadcrumb item and its
  flex container can shrink and wrap, while the post article explicitly opts
  out of the grid item's intrinsic minimum width. Mounted measurement at 390px
  reported a 375px document width and a 335px article ending at x=355, with no
  horizontal overflow.
- **Markdown lists:** the shared Markdown presentation restores decimal and disc
  markers, indentation, and adjacent-item spacing. Mounted inspection confirmed
  `decimal` and 24px left padding for the post's ordered lists.
- **Post metadata:** the post route renders a title and description from the
  validated post metadata. Mounted inspection confirmed both exact values.
- **Desktop preservation:** fresh desktop inspection at 1280px confirmed the
  article remains within the 1265px document and retains its intended heading,
  summary, divider, body width, and visible list presentation.
- **Regression coverage:** focused breadcrumb and writing-page tests cover the
  shrink/wrap contract, article grid boundary, title, description, content, and
  route; the content compiler suite remains green.
- **Validation:** 14 focused tests passed, the client TypeScript check and Vite
  production build passed, and `git diff --check` passed.
- **Branch audit:** changes remain in the host website's shared UI, presentation,
  and writing route boundaries. They do not alter product behaviour, the
  Markdown authoring/compiler contract, persistence, access, or schema, and make
  no unsupported assistive-technology verification claim.
