# Prerender the About page

## Goal

Generate the complete About page during the existing client build so its public
content and metadata are available before JavaScript runs.

## Why this task is next

The build already prerenders the other primary public content routes, while the
About page and its capability profile are currently omitted.

## Scope

- Add `/about` to the existing build-time prerender route catalogue.
- Add regression coverage for the route catalogue.
- Verify the generated document contains About metadata, biography copy, and
  capability-profile markup.
- Verify the built page hydrates without browser errors.

## Out of scope

- Prerendering privacy or authenticated routes.
- Changing About content, presentation, or capability-profile behaviour.
- Refactoring the wider prerender architecture.

## Expected files to create or modify

- `apps/client/src/website/prerender/prerender.tsx`
- prerender route catalogue and its focused test
- `progress.md`
- this task record

## Definition of done

- The production build emits `dist/about/index.html` with canonical metadata,
  biography copy, and capability-profile markup.
- The built About route hydrates without browser errors.
- Tests, typecheck, build, and the complete branch-diff audit pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- Server and client markup must remain identical when the interactive capability
  profile hydrates.

## Approval record

Approved by Adam on 1 September 2026.

- **Intentional boundary:** extend the existing build-time prerendering path;
  do not introduce runtime server rendering.
- **Important deferrals:** privacy and authenticated routes remain unchanged.
- **Implementation decision:** keep the route catalogue independently testable
  without changing how the prerender entry writes documents.
- **Do not reopen without new evidence:** About content, design, and widget
  behaviour are outside this task.

### Hydration-boundary amendment

Approved by Adam on 1 September 2026 after mounted production-preview testing
showed React hydration errors on both the newly prerendered About page and the
existing prerendered Products page.

- **Goal:** diagnose and correct the shared prerender/client hydration mismatch
  before publishing the About route.
- **Scope:** the smallest shared-rendering correction needed for identical
  initial server and browser markup, with regression coverage across an existing
  prerendered route and About.
- **Out of scope:** unrelated authentication, navigation, metadata, or page
  redesign work.
- **Definition of done amendment:** mounted production-preview verification must
  show no React hydration warning on either About or an existing prerendered
  route, while metadata and hydrated interactions continue to work.
- **Diagnostic outcome:** Vite preview serves its SPA fallback for extensionless
  paths and therefore paired `/about` with the wrong prerendered document. Direct
  generated documents at `/about/` and `/products/` hydrate without warnings.
  The production host maps extensionless paths to their generated
  `route/index.html`; focused host coverage now protects that behavior.

## Status

Complete on `codex/prerender-about-page`; not yet committed or published.

## Completion audit

- **About route catalogue:** `/about` is part of the independently testable
  prerender route catalogue consumed by the build entry.
- **Generated document:** the production build emits `dist/about/index.html`
  containing the About title, canonical URL, description, biography through
  `Up the Reds.`, capability-profile heading, cards, tabs, and classifications.
- **Production delivery:** focused host coverage proves an extensionless
  `/about` request receives `about/index.html` before the SPA fallback.
- **Hydration:** mounted production-artifact inspection found no browser warnings
  or errors on `/about/` or the existing `/products/` control route. Opening the
  Full-stack engineering dialog proved the capability profile hydrated and
  remained interactive. This was browser inspection, not human assistive-
  technology verification.
- **Validation:** 414 tests passed with 16 skipped; repository typecheck and
  production build passed sequentially. A deliberately concurrent first attempt
  exposed a Prisma client-generation race and was discarded before the clean
  sequential runs.
- **Branch audit:** the complete diff remains within public prerender route
  ownership, production-host delivery coverage, and task records. It introduces
  no product behavior, persistence, schema, migration, auth, API contract,
  managed prompt, or new architectural role.
