# Task 016 — Prepare Client App Scaffold

## Status

Complete.

## Goal

Add a minimal Vite and React Router client app alongside the existing Next.js `apps/web`, without replacing the current host yet.

## Why This Task Is Next

Task 015 documented the client-first host direction. The safest next step is to create the new client host in parallel, prove the tooling works, and keep the current Next app intact until the Vite app reaches functional parity.

## Scope

- Create `apps/client`.
- Configure Vite, React, React Router, TypeScript, and Tailwind using Tailwind's first-party Vite plugin.
- Add minimal placeholder routes:
  - `/`
  - `/about`
  - `/products`
  - `/login`
  - `/logout`
  - unknown route fallback
- Add simple route-level layout structure with semantic landmarks.
- Add Vite dev proxy for:
  - `/api/*` to the API host, removing the `/api` prefix
  - `/auth/*` to the API host
- Add package scripts:
  - `dev`
  - `typecheck`
  - `build`
- Add root script `dev:client`.
- Update local development docs, progress, and task index.

## Out Of Scope

- Do not remove or rename `apps/web`.
- Do not port the real shared website shell yet.
- Do not port auth behaviour yet.
- Do not mount ThoughtForm product routes yet.
- Do not change API behaviour.
- Do not add health-tech product code.
- Do not commit until reviewed and explicitly approved.

## Expected Files To Create Or Modify

- `apps/client/package.json`
- `apps/client/index.html`
- `apps/client/vite.config.ts`
- `apps/client/tsconfig.json`
- `apps/client/src/main.tsx`
- `apps/client/src/App.tsx`
- `apps/client/src/styles.css`
- root `package.json`
- `docs/local-development.md`
- `progress.md`
- `tasks/README.md`
- `tasks/016-prepare-client-app-scaffold.md`
- `pnpm-lock.yaml`

## Definition Of Done

- `apps/client` exists as a minimal Vite React app.
- React Router renders the scaffold routes.
- Direct browser navigation to each scaffold route works.
- Unknown routes render a not-found route.
- Tailwind styles load in the client app.
- Vite proxy config exists for future API/auth calls.
- Existing Next app remains functionally untouched.
- Task/progress docs reflect the scaffold.

## Validation Commands

```txt
pnpm install
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
/login
/logout
/not-a-real-route
```

## Risks / Questions

- Tailwind should use the first-party Vite plugin in the Vite client app. The existing Next app can keep its PostCSS integration while it still exists.
- Keep placeholder route UI deliberately sparse so Task 017 can port the real shell cleanly.
- Avoid duplicating too much of `apps/web`; this task proves the host scaffold, not parity.

## Completed Notes

- Added `apps/client` as a minimal Vite, React, React Router, TypeScript, and Tailwind app.
- Used Tailwind's first-party Vite plugin for the Vite client app.
- Added placeholder host routes for `/`, `/about`, `/products`, `/login`, `/logout`, and unknown routes.
- Added semantic route-level layout structure with skip link, header, nav, main, and footer.
- Added Vite proxy config for `/api/*` and `/auth/*`.
- Added Vite resolution for repo-root `apps/` and `packages/` imports so the client follows the project absolute-import rule.
- Added root `dev:client` script.
- Updated local development docs, progress, and the task index.
- Left `apps/web` functionally untouched.

## Validation Results

```txt
pnpm install
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
/login
/logout
/not-a-real-route
```
