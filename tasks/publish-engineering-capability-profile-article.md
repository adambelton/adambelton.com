# Publish engineering capability profile article

## Goal

Prepare the new engineering capability profile article for publication with an
approved title, complete metadata, repository-owned inline images, and safe DEV
syndication of those images.

## Why this task is next

The completed draft currently has no metadata or stable filename, and its
Obsidian screenshot embeds cannot be rendered by the website or syndicated to
DEV. The existing syndication adapter also forwards root-relative inline-image
paths unchanged, which would resolve against DEV instead of the canonical
website.

## Scope

- Rename the draft around the approved canonical slug.
- Add the approved full title, short title, description, publication date,
  canonical slug, cover paths, alternative text, and reviewed DEV tags.
- Move the two unique screenshots beside the article's other writing images,
  give them descriptive filenames, and replace the Obsidian embeds with
  accessible standard Markdown images.
- Discard the byte-identical untracked screenshot duplicate.
- Rewrite root-relative inline-image URLs to absolute production URLs only in
  the outbound DEV Markdown payload.
- Require repository-hosted inline images to exist locally and verify their
  byte-identical deployment before a live DEV mutation.
- Document the inline-image syndication behaviour and record the outcome in
  `progress.md`.

## Out of scope

- Editing the article prose beyond its image embeds.
- Creating the article's cover illustration or cover renditions.
- Uploading separate DEV-owned image copies or performing a live DEV mutation.
- Redesigning the website's writing-image hierarchy.

## Expected files to create or modify

- `apps/client/src/content/posts/engineering-capability-profile-beyond-the-cv.md`
- `apps/client/public/images/writing/engineering-capability-profile-beyond-the-cv/capability-profile-overview.png`
- `apps/client/public/images/writing/engineering-capability-profile-beyond-the-cv/coherence-and-cognition-detail.png`
- `apps/client/src/website/content/syndication/dev-to-syndication.ts`
- `apps/client/src/website/content/syndication/dev-to-syndication.test.ts`
- `docs/content-authoring.md`
- `progress.md`
- this task record

## Definition of done

- The article has the approved title, compact title, metadata, filename, and
  canonical slug.
- Both unique screenshots are repository-owned, descriptively named, and
  rendered through root-relative standard Markdown with useful alternative
  text.
- DEV payloads use absolute production URLs for repository-hosted inline images
  while leaving existing absolute image URLs unchanged.
- Missing local inline images and unavailable or stale deployed inline images
  fail before a live DEV write.
- Focused tests, typecheck, build, dry-run syndication where possible, and diff
  checks pass; the missing cover artwork is recorded as a publication blocker
  if it prevents full validation.

## Validation commands

```txt
pnpm exec vitest run apps/client/src/website/content/content.test.ts apps/client/src/website/content/syndication/dev-to-syndication.test.ts
pnpm typecheck
pnpm build
pnpm syndicate:dev-to --dry-run
git diff --check
```

## Risks / questions

- DEV may proxy externally hosted images after publication. Matching remains
  based on the submitted absolute Markdown URL rather than a DEV-owned upload.

## Approval record

Approved by Adam on 2 September 2026.

- **Intentional boundaries:** retain the website Markdown as the content source;
  keep inline images beside the article's cover assets without another media
  subfolder; rewrite URLs only at the DEV delivery boundary; do not alter prose.
- **Important deferrals:** cover creation, copy-editing, live DEV publication,
  and a broader writing-image reorganisation.
- **Implementation decisions:** use the title `I built an engineering capability
  profile to show hiring managers what my CV can’t`, the short title `An
  engineering capability profile beyond the CV`, the slug
  `engineering-capability-profile-beyond-the-cv`, and production-hosted absolute
  inline-image URLs in DEV payloads.
- **Do not reopen without new evidence:** no separate DEV image copies and no
  dedicated inline-media subfolder are required for the current image volume.

## Status

Complete locally on `codex/publish-engineering-capability-profile`; approved for
commit, push, merge after CI, production verification, and live DEV
syndication.

## Completion audit

- **Article identity and metadata:**
  `engineering-capability-profile-beyond-the-cv.md` contains the approved full
  and compact titles, 2 September 2026 publication date, canonical slug,
  description, required cover metadata, and four reviewed DEV tags. The
  production build generated the corresponding writing route, title metadata,
  canonical structured data, and breadcrumb label.
- **Repository-owned screenshots:** the two unique PNG files now live directly
  under the article's `/images/writing/:slug` directory as
  `capability-profile-overview.png` and
  `coherence-and-cognition-detail.png`. Their former Obsidian embeds are
  standard root-relative Markdown images with distinct descriptive alternative
  text. SHA-256 inspection confirmed the discarded third source was an exact
  duplicate of the retained detail image.
- **Cover assets:** Adam supplied the final 1935 x 813 source illustration. It is
  retained unchanged beside Lanczos-resized JPEG renditions at the exact
  required 2000 x 840 and 1000 x 420 sizes. The final files are 425 KB and
  125 KB respectively and passed direct visual review.
- **DEV delivery:** focused tests prove root-relative repository images become
  absolute `https://adambelton.com/...` URLs in outbound Markdown, repeated
  paths are deduplicated for verification, and existing absolute URLs remain
  unchanged. The source Markdown is not rewritten.
- **Failure safety:** local loading now checks covers and every discovered
  repository inline image. A focused test proves a missing inline file fails,
  and another proves an unavailable or byte-mismatched deployed inline image
  fails before delivery. Live verification checks the cover and inline images
  concurrently only after the canonical page is reachable.
- **Mounted host verification:** the real Vite client host returned HTTP 200 for
  the article route and all repository images. The production prerender contains
  the approved metadata, heading, compact breadcrumb title, covers, inline image
  paths, alternative descriptions, final About link, and semantic capability
  headings. Adam completed iterative browser review and approved everything for
  publication. This was visual browser review, not human assistive-technology
  verification.
- **Automated validation:** the final full repository run passed 416 tests with
  16 intentionally skipped, repository typecheck, the sequential production
  build, the complete four-post DEV dry run, and `git diff --check`.
- **Validation incident:** typecheck and build were initially launched in
  parallel even though both invoke `prisma generate`, reproducing the known
  generated-client race. The incomplete generated directory was moved to the
  recoverable temporary path
  `/private/tmp/adambelton-prisma-partial-20260902-1250`, Prisma was regenerated
  once, and typecheck plus build were rerun sequentially and passed. No schema,
  migration, or persistent data changed.
- **Branch audit:** the complete working-tree diff keeps authored content and
  image meaning in the website content boundary and DEV-specific rewriting and
  deployment checks in the host-owned syndication adapter. It introduces no
  product behaviour, persistence, auth, AI, schema, migration, or duplicated
  production/test-host decision. Documentation records the actual checks and
  does not claim publication, live DEV verification, or assistive-technology
  testing before those operations occur.
