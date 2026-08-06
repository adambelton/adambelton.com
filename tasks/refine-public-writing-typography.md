# Refine public-writing typography

## Goal

Make the public writing surface feel crisper, more confident, and more
writing-led without changing its font family.

## Why this task is next

The final post and About copy exposed an unresolved launch-facing hierarchy:
the homepage introduction dominates the collection, while long-form prose is
wider and more muted than the intended reading experience.

## Scope

- Replace the homepage heading with `Writing` and the approved supporting line.
- Reduce the homepage heading scale and space before the collection.
- Use foreground colour for compiled long-form prose.
- Narrow long-form prose to approximately 640–680px.
- Verify the homepage, first post, and About page at desktop and mobile widths.

## Out of scope

- Changing the font family or editing authored page/post copy.
- Redesigning navigation or introducing a separate editorial theme.
- Broader metadata or SEO work.

## Expected files to create or modify

- `apps/client/src/website/pages/HomePage.tsx`
- `apps/client/src/website/content/RenderedMarkdown.tsx`
- focused public-writing tests
- `progress.md`
- this task record

## Definition of done

- The first post sits higher in the initial homepage viewport.
- Long-form prose has stronger contrast and a 640–680px desktop measure.
- Homepage, About, and post pages remain responsive without overflow.
- Dates, descriptions, and navigation retain their supporting hierarchy.
- Focused tests, client build, mounted inspection, and diff checks pass.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/pages/WritingPages.test.tsx apps/client/src/website/pages/AboutPage.test.tsx
pnpm --filter @adambelton/client build
git diff --check
```

## Risks / questions

- Stronger body contrast must not flatten the hierarchy between prose and
  supporting metadata.

## Approval record

Approved by Adam on 6 August 2026.

- **Intentional boundaries:** create crispness through scale, contrast, measure,
  and spacing while deferring the font decision.
- **Important deferrals:** font family, authored-copy changes, navigation
  redesign, editorial theming, and broader SEO work.
- **Implementation decision:** contain the homepage spacing change inside the
  homepage rather than changing the shared host layout.
- **Do not reopen without new evidence:** the existing sans-serif direction is
  retained for this task.

## Status

Complete on `codex/public-markdown-and-private-thoughtform`; not yet committed or
published.

## Completion audit

- **Homepage hierarchy:** the H1 is now `Writing` at 72px desktop and 48px
  mobile, followed by the approved supporting line. Homepage-owned grid spacing
  places the first post between y=424 and y=573 in a 720px desktop viewport and
  between y=386 and y=595 in an 844px mobile viewport.
- **Long-form contrast and measure:** `RenderedMarkdown` now uses foreground
  colour and a 672px maximum width. Mounted post inspection confirmed 18px type,
  32px line height, `rgb(21, 21, 21)` prose, and the exact 672px desktop measure.
- **Supporting hierarchy:** mounted post and About inspection confirmed their
  descriptions remain muted at `rgb(100, 102, 97)` while authored prose uses
  foreground contrast.
- **Responsive preservation:** the homepage remained exactly 390px wide in the
  390px viewport. The post and About documents remained 375px wide with 335px
  prose between 20px edges and no horizontal overflow.
- **Regression coverage:** focused writing-page tests cover the revised heading,
  supporting line, removed former heading, post route, and long-form presentation
  contract; the existing About test remains green.
- **Validation:** four focused tests passed, the client TypeScript check and Vite
  production build passed, and `git diff --check` passed.
- **Branch audit:** typography changes remain in the host website's homepage and
  shared compiled-Markdown presentation. They do not change authored copy, font
  family, product behaviour, access, persistence, schema, or infrastructure, and
  make no unsupported assistive-technology verification claim. A concurrent
  user-owned edit to `packages/products/src/registry.ts` is unrelated, untouched,
  and excluded from this task's completion claim.
