# Task 018 — Port Auth UX To Vite Client

## Status

Complete.

## Goal

Move the existing magic-link login/logout UX from the Next app into the Vite client app, while keeping server/API authorization authoritative.

## Why This Task Is Next

The Vite client now has the real public shell. The next missing host capability is auth UX: `/login`, `/login/verify`, `/logout`, session-aware header state, and client-side product route gating.

## Scope

- Run the Vite client on port `3000`.
- Add client auth utilities using Better Auth's client package.
- Port magic-link request UI to `apps/client`.
- Port `/login/verify` completion behaviour.
- Port `/logout` behaviour.
- Add session bootstrap/loading state.
- Update header to show `Log in` or `Log out`.
- Add a protected route wrapper for `/products`.
- Keep `/products` behaviour aligned with the current auth decision.
- Update docs/progress/task files.

## Out Of Scope

- Do not remove `apps/web`.
- Do not mount ThoughtForm product routes yet.
- Do not change Better Auth server config unless Vite client compatibility requires a tiny env/origin adjustment.
- Do not change Prisma schema.
- Do not add roles/permissions beyond existing `isOwner`.
- Do not implement product persistence, publishing, or usage limits.
- Do not commit until reviewed and explicitly approved.

## Expected Files To Create Or Modify

- `apps/client/package.json`
- `apps/client/vite.config.ts`
- `apps/client/src/App.tsx`
- `apps/client/src/auth/*`
- `apps/client/src/components/*`
- `apps/client/src/layout/SiteHeader.tsx`
- `apps/client/src/pages/LoginPage.tsx`
- `apps/client/src/pages/LoginVerifyPage.tsx`
- `apps/client/src/pages/LogoutPage.tsx`
- `docs/local-development.md`
- `progress.md`
- `tasks/README.md`
- `tasks/018-port-auth-ux-to-vite-client.md`
- `pnpm-lock.yaml`

## Definition Of Done

- Vite client runs on `http://localhost:3000`.
- `/login` can request a real magic link.
- `/login/verify` can complete sign-in from the emailed link.
- Header reflects signed-in vs signed-out state.
- `/logout` signs out and returns to public UI.
- `/products` gates signed-out users in the client.
- API/server auth remains the real security boundary.
- Existing Next app remains functionally untouched.

## Validation Commands

```txt
pnpm install
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
pnpm test
git diff --check
```

Browser validation:

```txt
pnpm dev:api
pnpm dev:client
```

Verify:

```txt
/login
magic-link request
/login/verify from email
/products signed-out gate
/products signed-in access
/logout
```

## Risks / Questions

- Keep `BETTER_AUTH_URL` and `BETTER_AUTH_TRUSTED_ORIGINS` on `http://localhost:3000`.
- The email callback URL should point to the Vite client during this migration task.
- Avoid sending repeated real emails while debugging; test invalid-token behaviour first, then one real end-to-end magic link.

## Completed Notes

- The Vite client now runs on `http://localhost:3000`.
- Better Auth magic-link login, verification, logout, session-aware header state, and `/products` client-side route gating are ported into `apps/client`.
- The API/server auth boundary remains authoritative; client gating is user experience only.
- The user verified the real magic-link login flow in the browser.

## Validation Results

```txt
pnpm install
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
pnpm test
git diff --check
```

All validation commands passed.
