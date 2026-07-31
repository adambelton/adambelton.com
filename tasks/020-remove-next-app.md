# Task 020 — Remove Next App

## Status

Complete.

## Goal

Remove the deprecated Next.js web app now that the Vite client owns the public shell, auth UX, and product mounting.

## Why This Task Is Next

`apps/web` now duplicates host responsibilities and can confuse future work. Removing it makes `apps/client` the single website host before more product behaviour is built.

## Scope

- Delete `apps/web`.
- Remove `@adambelton/web` package references and root `dev:web` script.
- Remove obsolete Next-specific local tooling references.
- Clean `pnpm-lock.yaml`.
- Update current docs, progress, and task records so `apps/client` is the website host.

## Out Of Scope

- Do not redesign UI.
- Do not change auth behaviour.
- Do not change API/server behaviour.
- Do not add deployment configuration.
- Do not rewrite historical task docs or old product planning documents unless they are current context.
- Do not commit until reviewed and explicitly approved.

## Expected Files To Create Or Modify

- `apps/web/**`
- `package.json`
- `pnpm-lock.yaml`
- `turbo.json`
- `README.md`
- `AGENTS.md`
- `docs/decisions.md`
- `docs/local-development.md`
- `progress.md`
- `tasks/README.md`
- `tasks/020-remove-next-app.md`

## Definition Of Done

- `apps/web` is removed.
- No active repo scripts point to `@adambelton/web` or `pnpm dev:web`.
- Current docs describe `apps/client` as the website host.
- The remaining workspace installs, typechecks, builds, and tests cleanly.

## Validation Commands

```txt
pnpm install
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
pnpm test
git diff --check
```

## Risks / Questions

- The repo does not appear to have deployment configured yet, so this task should not need deployment changes.
- Historical task and product planning docs may still mention `apps/web`; those references should remain as historical context unless they are active project instructions.

## Completed Notes

- Removed the deprecated `apps/web` Next.js host.
- Removed the root `dev:web` script.
- Updated current project context so `apps/client` is the website host.
- Removed `.next` from Turbo build outputs.
- Added a repo `.npmrc` with `auto-install-peers=false` so unused optional framework peers such as Next are not auto-installed into the lockfile.
- Refreshed `pnpm-lock.yaml`.

## Validation Results

```txt
pnpm install
pnpm --filter @adambelton/client typecheck
pnpm --filter @adambelton/client build
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

All validation commands passed.
