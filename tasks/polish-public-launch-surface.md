# Polish the public launch surface

## Goal

Make the provider-independent public website feel complete and accurate before deployment, while leaving the private ThoughtForm workspace unchanged.

## Why this task is next

The final production-readiness pass found a small set of visible launch issues: generic page metadata, machine-formatted dates, misleading public login affordances, duplicated email exposure, provisional Products copy, and no favicon.

## Scope

- Give public and authentication routes specific titles and descriptions, with private/error routes excluded from indexing.
- Present published dates in a human-readable British format while preserving machine-readable dates.
- Remove anonymous login from the public navigation while retaining the direct owner login route.
- Describe login as private owner access.
- Route privacy contact requests through the About page instead of exposing the email address twice.
- Replace provisional Products-page copy and align its heading hierarchy with the public site.
- Add a minimal favicon based on the existing teal asterisk motif.

## Out of scope

- Hosting, DNS, production secrets, canonical origins, sitemaps, or social-card prerendering.
- The private ThoughtForm workspace or product behaviour.
- Rewriting the independently edited ThoughtForm registry summary.

## Expected files

- Public and authentication page components and tests.
- Shared header presentation and tests.
- A public-date formatter and tests.
- `apps/client/index.html` and one static favicon asset.
- `progress.md` and this task record.

## Definition of done

- Public copy is no longer provisional or misleading.
- Every mounted route has appropriate specific metadata.
- The public navigation and privacy contact path match the intended exposure.
- Published dates are readable and retain valid `dateTime` values.
- The favicon and responsive presentation work in the mounted client.
- Relevant tests, typecheck, build, browser verification, and diff checks pass.

## Validation commands

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `git diff --check`
- Mounted desktop and mobile route, link, metadata, and favicon inspection.

## Risks / questions

- Route metadata remains client-rendered until a deployment strategy is selected.
- Canonical and social metadata require a production origin and are deliberately deferred.

## Approval record

Approved by Adam on 6 August 2026.

- Use the existing teal asterisk motif for the favicon.
- Tighten the Products copy without changing ThoughtForm's product meaning.
- Retain direct owner login but remove anonymous login from public navigation.
- Do not reopen deployment-specific metadata, hosting, or the private ThoughtForm workspace in this task.
- Preserve the concurrent ThoughtForm registry summary edit.

## Completion audit

- **Specific route metadata:** complete. Public pages provide route-specific titles and descriptions; authentication, private workspace, and not-found routes provide `noindex` metadata. Verified in component tests and the mounted client, including lazy ThoughtForm routes.
- **Readable published dates:** complete. `formatPublicDate` renders `6 August 2026` while both writing surfaces retain `dateTime="2026-08-06"`; covered by formatter and page tests.
- **Private login framing:** complete. Anonymous navigation omits login, authenticated navigation retains logout, and the direct login route identifies private product access; covered by header and login tests and mounted inspection.
- **About-based privacy contact:** complete. The About contact section has the `contact` fragment target and site privacy links there without rendering a mail address; covered by About and Privacy tests and mounted inspection.
- **Products presentation:** complete. The provisional heading and future-tense copy are replaced and the public heading scale is aligned; covered by a page test and desktop/mobile inspection. The concurrent ThoughtForm registry summary was not changed.
- **Favicon:** complete. The teal asterisk SVG is linked from the document and observed on every mounted route.
- **Responsive and build integrity:** complete. All audited routes had one visible heading and no horizontal overflow at the default desktop viewport or 390 × 844; the browser reported no warnings or errors. Full tests, typecheck, build, and diff checks passed.
- **Branch-diff boundary audit:** complete. Changes remain within public/auth presentation, content, tests, and static assets. No product behavior, persistence, architectural role, migration, or deployment claim was introduced. The unrelated concurrent registry edit remains preserved and outside this task's claims.
