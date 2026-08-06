# Add the Railway deployment foundation

## Goal

Make the repository deployable as one persistent Railway service serving the Vite client, Hono API, authentication, and SSE from the same origin.

## Why this task is next

The public site is ready for hosting, but the API currently starts through a development-oriented TypeScript entry point and does not serve the built client or its client-side routes.

## Scope

- Add a production server that mounts `/api`, `/auth`, and `/health` before static client delivery.
- Serve the built Vite assets and return the SPA document for client-side routes.
- Return 404 for missing static assets rather than returning the SPA document.
- Add deterministic production build, start, migration, health-check, and restart configuration for Railway.
- Document the production variables and temporary-domain verification sequence.
- Explicitly require Railway Serverless/App Sleeping to remain disabled.
- Verify the complete built application locally through its production server.

## Out of scope

- Creating or changing Railway services, variables, or secrets.
- Running migrations against the production Neon branch.
- Configuring DNS or activating `adambelton.com`.
- Making ThoughtForm public.
- CDN, multi-region, sitemap, canonical-origin, or social-card work.

## Expected files

- API production bootstrap and tests.
- Root and API package scripts.
- `railway.toml`.
- Deployment documentation.
- `progress.md` and this task record.

## Definition of done

- One production command starts the complete built application.
- Public pages and direct deep links return the SPA application.
- Static assets, API, auth, health, and SSE paths retain their correct boundaries.
- Missing assets return 404.
- Production configuration fails closed when required auth/database variables are missing.
- Railway build and deploy behavior is expressed in repository configuration.
- Tests, typecheck, build, production smoke testing, browser verification, and diff checks pass.

## Validation commands

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `NODE_ENV=production ... pnpm start`
- `pnpm db:migrate:deploy` only against an explicitly selected non-production verification database.
- `git diff --check`

## Risks / questions

- Railway Serverless is a dashboard setting rather than a supported config-as-code field and must be checked during service setup.
- The temporary Railway domain must be known before production auth origin variables can be populated.
- Migration verification must not accidentally target the production Neon branch during this repository-only task.

## Approval record

Approved by Adam on 6 August 2026.

- Use one Railway service and one public origin.
- Verify first through a temporary `*.up.railway.app` domain.
- Keep Serverless/App Sleeping disabled to avoid idle cold starts.
- Keep Neon as the database provider and migrations as a Railway pre-deploy step.
- Do not create Railway resources, transmit secrets, run production migrations, or change DNS in this task.
- ThoughtForm remains owner-only.

## Completion audit

- **Single production command:** complete. `pnpm start` launches the Hono production bootstrap from the API workspace and listens on Railway's supplied `PORT` at `0.0.0.0` by default.
- **Same-origin boundaries:** complete. The production composition mounts product operations at `/api`, Better Auth at `/auth`, deployment readiness at `/health`, and only then resolves client files and SPA routes. Focused tests and live HTTP requests verified each boundary.
- **Static and SPA behavior:** complete. Built Vite files are served directly, hashed assets receive immutable caching, SPA documents receive `no-cache`, direct article and product routes load, and missing file-like paths return 404. Unit tests, curl checks, and mounted production-browser inspection provide evidence.
- **Production configuration:** complete. `railway.toml` defines Railpack build, pre-deploy Prisma migration, start, health-check, and restart behavior. `docs/deployment.md` records variables, temporary-domain verification, and the dashboard-only requirement to disable Serverless.
- **Auth deployment safety:** complete. Existing production checks still fail closed without `BETTER_AUTH_SECRET` or `DATABASE_URL`. Railway's `X-Real-IP` is explicitly selected through `AUTH_CLIENT_IP_HEADERS`; a local auth request with that header returned 200 without the shared-rate-limit warning.
- **ThoughtForm boundary:** complete. No access rules or product behavior changed; the existing public overview/private workspace boundary remains intact.
- **Validation:** complete. All 297 unit/integration tests passed with five intentional skips; repository typecheck, production build, frozen install, three Playwright journeys, diff checks, direct production HTTP smoke checks, and mounted production route inspection passed.
- **Branch-diff audit:** complete. The branch adds only host deployment/bootstrap behavior, generic auth proxy configuration, repository deployment configuration/documentation, and colocated tests. No product presentation or behavior moved into a host, no persistence mechanism changed, no migration was added or edited, and documentation distinguishes local, automated, mounted, and future Railway verification.
