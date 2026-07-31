# Task 017 — Port Shared Website Shell

## Status

Complete.

## Goal

Move the reusable public website shell from the Next app into the Vite client app, preserving the current sparse editorial style and accessibility baseline.

## Why This Task Is Next

The Vite scaffold works. The next step is to replace placeholder scaffold UI with the real shared site shell while still avoiding auth and product mounting complexity.

## Scope

- Port shared site structure into `apps/client`.
- Recreate or port:
  - skip link
  - header/nav
  - footer
  - text link styling
  - prose/layout primitives where useful
  - current public route content for `/`, `/about`, and `/products`
- Preserve semantic landmarks.
- Preserve visible focus styles.
- Keep Tailwind via `@tailwindcss/vite`.
- Keep route definitions explicit in React Router.
- Update task/progress docs.

## Out Of Scope

- Do not remove `apps/web`.
- Do not port magic-link auth behaviour.
- Do not mount Socratic Draft product routes yet.
- Do not implement published writing.
- Do not add new product UI.
- Do not change API behaviour.
- Do not commit until reviewed and explicitly approved.

## Expected Files To Create Or Modify

- `apps/client/src/App.tsx`
- `apps/client/src/styles.css`
- `apps/client/src/components/*`
- `apps/client/src/layout/*`
- `apps/client/src/pages/*`
- `progress.md`
- `tasks/README.md`
- `tasks/017-port-shared-website-shell.md`

## Definition Of Done

- Vite client has the real public shell, not scaffold placeholder chrome.
- `/`, `/about`, and `/products` match the current Next app's public content closely enough for migration parity.
- Header, footer, skip link, and focus states work.
- UI remains sparse and restrained.
- Existing Next app remains functionally untouched.

## Validation Commands

```txt
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
git diff --check
```

Browser smoke test:

```txt
pnpm dev:client
```

Verify:

```txt
/
/about
/products
/not-a-real-route
```

## Risks / Questions

- Avoid over-componentizing too early, but split obvious shell pieces into separate files so `App.tsx` stays declarative.
- This should be visual parity, not a redesign.
- Product cards/previews should stay minimal because product mounting comes later.

## Completed Notes

- Added client-owned site shell components for container, prose, text links, skip link, header, and footer.
- Split reusable content primitives into `components` and app-frame pieces into `layout`, each with a barrel export.
- Split public route content into client page files for home, about, products, login placeholder, logout placeholder, and not-found.
- Added a page barrel export so `App.tsx` can import page components from one location.
- Ported the current public content for `/`, `/about`, and `/products`.
- Kept `App.tsx` as the React Router composition layer.
- Preserved semantic landmarks, skip link, visible focus styling, and sparse editorial visual direction.
- Left `apps/web` functionally untouched.

## Validation Results

```txt
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
git diff --check
pnpm dev:client
```

All validation passed.

Browser smoke test passed for:

```txt
/
/about
/products
/not-a-real-route
```
