# Activate the production domain

## Status

Complete. Railway has verified the apex DNS and certificate, Cloudflare
redirects `www` to the apex with path and query preservation, and the production
authentication callback uses the apex. Repository metadata and discovery
changes pass the approved local validation and are ready for deployment from
`main`.

## Goal

Make `https://adambelton.com` the canonical production website, with
`https://www.adambelton.com` redirecting to the apex domain.

## Why this task is next

The Railway deployment, production migration, health check, public routes, and
owner authentication have passed on the temporary domain. Custom-domain
activation is the remaining public-launch step.

## Scope

- Attach `adambelton.com` and `www.adambelton.com` to the existing Railway
  `web` service.
- Configure the required records with the current DNS provider.
- Make the apex domain canonical and redirect `www` to it.
- Update the Better Auth production origin and trusted origins through a safe
  cutover.
- Add or correct canonical URLs, sitemap, and production robots behavior where
  currently missing.
- Verify HTTPS, redirects, public pages, deep links, assets, and owner login on
  the final domain.
- Confirm Railway remains one persistent Europe West replica with Serverless
  disabled.
- Record the deployment outcome and close the temporary-domain task accurately.

## Out of scope

- Making ThoughtForm public.
- Changing ThoughtForm AI behavior or model configuration.
- Removing Railway's temporary domain.
- Migrating email or DNS providers.
- Redesign or unrelated SEO work.

## Expected files

- This task record.
- `tasks/deploy-railway-temporary-domain.md`.
- `docs/deployment.md`.
- `progress.md`.
- Client metadata, sitemap, or robots files and relevant tests as required by
  inspection.

## Definition of done

- `https://adambelton.com` serves the production website with a valid
  certificate.
- `https://www.adambelton.com` redirects to the canonical apex URL.
- All public routes and direct links work.
- Canonical metadata and sitemap URLs use `https://adambelton.com`.
- Owner magic-link authentication works on the final origin.
- Temporary-domain traffic does not create an unsafe authentication origin.
- Railway health and runtime logs show no unresolved errors.

## Validation commands

- `pnpm test`.
- `pnpm typecheck`.
- `pnpm build`.
- `git diff --check`.
- Railway deployment and runtime inspection.
- DNS and TLS checks.
- Mounted browser verification of public routes, metadata, redirects, and owner
  login.

## Risks / questions

- DNS changes may take time to propagate.
- The exact records depend on the current DNS provider.
- Origin variables and DNS must be sequenced so owner login remains usable
  throughout the cutover.
- The Railway temporary domain remains available for diagnosis while
  `adambelton.com` becomes canonical.

## Approval record

Approved by Adam on 6 August 2026.

- The apex domain is canonical and `www` redirects to it.
- The private status of ThoughtForm remains unchanged.
- The Railway temporary domain is retained for diagnosis.
- ThoughtForm's deeper production conversation, Idea Map, and Braintrust checks
  remain a non-blocking follow-up and do not prevent the public-site launch.

## Completion audit

- **Canonical production origin:** `https://adambelton.com` serves the Railway
  application with a valid certificate, and Better Auth generates callbacks on
  the apex origin.
- **Canonical redirect:** Cloudflare permanently redirects `www` requests to the
  equivalent apex URL while preserving paths and query strings.
- **Public routes and direct links:** mounted production inspection covered the
  homepage, About, writing, products, privacy, assets, and direct route loading.
- **Discovery metadata:** public pages emit apex canonical links;
  `apps/client/public/robots.txt` points crawlers to the canonical sitemap; and
  `apps/client/public/sitemap.xml` lists the implemented public routes.
- **Owner authentication:** the production magic-link flow was completed on the
  apex origin. The Railway temporary domain remains a trusted diagnostic origin
  without changing the canonical callback origin.
- **Railway runtime:** the service remains one persistent Europe West replica
  with Serverless disabled, its health check succeeds, and no unresolved public
  launch error remains in the inspected runtime logs.
- **Validation:** `pnpm test` passed 298 tests with 5 skipped; `pnpm typecheck`,
  `pnpm build`, all 3 deterministic Playwright journeys, and `git diff --check`
  passed. Playwright required execution outside the filesystem sandbox so its
  local server could create an IPC socket.
- **Mounted verification classification:** the production route, redirect,
  metadata, asset, and login checks were browser inspection, not human
  assistive-technology verification. The deeper private ThoughtForm
  conversation, asynchronous Idea Map, and Braintrust production checks remain
  the explicitly approved non-blocking follow-up.
- **Branch audit:** the complete diff contains host-owned public metadata and
  deployment records only. It does not alter ThoughtForm behaviour, product
  access, database schema, provider configuration, or package dependency
  boundaries, and it introduces no migration.
