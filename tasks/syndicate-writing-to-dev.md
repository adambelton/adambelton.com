# Syndicate writing to DEV

## Goal

Publish every repository-backed writing post to DEV idempotently while retaining
the website post as the canonical source.

## Why this task is next

The website has stable Markdown ownership, production canonical URLs, and two
published posts ready for an initial syndication run. DEV supports full-post
cross-publishing with canonical URLs through its article API.

## Scope

- Add optional product-only internal tags and one-to-four approved external DEV
  tags to writing metadata.
- Expose the union of internal and external tags to the website while sending
  only external tags to DEV.
- Add the approved tags to both existing posts.
- Create missing DEV articles and update existing articles matched by canonical
  URL.
- Wait for canonical website URLs to be reachable before a live publication.
- Provide safe dry-run and manual workflow modes.
- Run automatically for writing changes on `main` once explicitly enabled.
- Document credentials, activation, recovery, and AI-disclosure requirements.

## Out of scope

- Website filtering or tag pages.
- Creating DEV tags, importing comments or analytics, or reverse synchronization.
- DEV profile changes and future health-tech writing.
- Applying health-tech or career tags to articles that are not about those topics.

## Expected files to create or modify

- `apps/client/src/content/posts/*.md`
- `apps/client/src/website/content/content-types.ts`
- `apps/client/src/website/content/build/compile-content.ts`
- host-owned DEV tag policy, syndication adapter, and focused tests
- `apps/client/package.json`
- `package.json`
- `.github/workflows/dev-to-syndication.yml`
- `docs/content-authoring.md`
- `docs/decisions.md`
- `progress.md`
- this task record

## Definition of done

- Tag metadata is validated and available to the website.
- DEV payloads contain only external tags and the production canonical URL.
- A first live execution creates both articles; repeated execution updates them
  without duplication.
- Missing credentials, invalid tags, API failures, and unavailable canonical
  pages fail safely.
- Tests, typecheck, build, dry run, diff checks, and the completion audit pass.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/content/content.test.ts apps/client/src/website/content/syndication/dev-to-syndication.test.ts
pnpm typecheck
pnpm build
pnpm syndicate:dev-to --dry-run
git diff --check
```

## Risks / questions

- Live activation requires a DEV API key and confirmation of whether either
  existing article needs DEV's mandatory AI-assistance disclosure.
- DEV API or tag-policy changes may require a reviewed adapter update.

## Approval record

Approved by Adam on 15 August 2026.

- **Intentional boundaries:** every writing post is syndicated; internal tags
  identify products only; website tags are the internal/external union; DEV
  receives external tags only; the website remains canonical.
- **Important deferrals:** website filtering, DEV profile work, engagement
  strategy, and a future health-tech writing series.
- **Implementation decisions:** match by canonical URL for idempotency, use
  `thoughtform` internally on both existing posts, and use the approved external
  tag sets recorded in their frontmatter.
- **Do not reopen without new evidence:** do not use `career`, `hiring`, or
  `healthtech` merely to pursue visibility; article tags must describe content.

## Status

Complete on `codex/dev-to-syndication`; not yet committed, pushed, or merged.

## Completion audit

- **Tag metadata:** both posts contain `thoughtform` as the product-only internal
  tag and their approved external tag sets. Compiler tests prove optional
  internal tags, registry-policy alignment, the website union, the DEV limit,
  and rejection of unregistered or unreviewed tags.
- **DEV payload boundary:** focused tests prove complete Markdown, description,
  title, publication state, external-only tags, and the production canonical
  URL. Internal tags cannot enter the adapter payload.
- **Idempotency:** focused tests prove canonical matching, duplicate-match
  rejection, create, update, and mutation-free unchanged outcomes.
- **Failure safety:** focused tests prove missing-secret, DEV API failure, and
  unavailable-canonical-page failures. The workflow has read-only repository
  permission, serial execution, a dry-run default, a secret-scoped live step,
  and a separate automatic-activation variable.
- **Initial live publication:** Adam confirmed that neither article was written
  or materially edited with AI. A credential loaded from ignored `.env.local`
  created DEV articles `4402230` and `4402231`. The first real rerun exposed
  that DEV ignored comma-separated tag input; the adapter was corrected to send
  an array, both live tag sets were repaired and read back exactly, and the next
  complete run returned `unchanged` for both canonical URLs.
- **Automated validation:** 380 tests passed with 16 intentionally skipped;
  full repository typecheck and production build passed; the final focused
  client typecheck/build, two-post dry run, workflow YAML parse, and
  `git diff --check` passed.
- **GitHub activation:** after Adam explicitly authorized the credential
  transfer, `DEV_TO_API_KEY` was stored as a repository Actions secret and
  `DEV_TO_SYNDICATION_ENABLED` was set to `true`. A names-and-timestamps-only
  readback verified both settings without exposing the secret. The workflow
  will become active when it reaches `main`; no commit or push has been made.
- **Branch audit:** the complete diff keeps writing meaning and outbound delivery
  in the client host boundary; GitHub Actions only invokes it. No product
  behaviour, persistence, auth, AI provider, schema, migration, prompt fallback,
  or mounted user flow changed. The approved tag-policy alignment decision is
  covered by a registry comparison test. Documentation does not claim live DEV
  publication.
