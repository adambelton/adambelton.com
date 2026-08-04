# Task 004 — Static Site Routes With Empty Writing Collection

Status: Complete

## Goal

Set up the static public site structure with `/` as the writing collection entry point, while keeping writing empty for now.

## Scope

- Make `/` the writing collection page with an honest empty state.
- Add `/about`.
- Add `/products`.
- Add `/products/thoughtform`.
- Update header navigation to link only to implemented static pages.
- Render `/products` from the shared product registry.
- Keep `/products/thoughtform` minimal with `In Development` placeholder text.
- Update progress and task tracking.

## Out of Scope

- Writing posts.
- Individual writing routes.
- Placeholder article previews.
- CMS or markdown loading.
- ThoughtForm editor.
- Product demo links.
- Auth, API, database, AI, demo mode, or admin.
- Fake interactions.

## Definition of Done

- `/` is the writing collection entry point with an honest empty state.
- `/about` renders.
- `/products` renders from the shared registry.
- `/products/thoughtform` renders with `In Development` placeholder text.
- Header navigation only links to implemented pages.
- No writing posts or fake article previews are added.
- No product-specific app behaviour is added.
- `pnpm typecheck` passes.
- `pnpm --filter @adambelton/web build` passes.
- Progress/task files are updated.

## Completed Notes

- The root page now describes the writing collection and says there are no published pieces yet.
- Static about and products routes exist.
- ThoughtForm product page is static and intentionally minimal.
- No runtime product behaviour was added.
