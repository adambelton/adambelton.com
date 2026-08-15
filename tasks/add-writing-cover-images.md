# Add writing cover images

## Goal

Add repository-owned writing imagery that remains sharp and correctly composed
across website cards and heroes, DEV covers, and LinkedIn link previews, while
making public writing metadata and content available without client-side
JavaScript.

## Why this task is next

DEV syndication is live, but cover images are manually owned by DEV and the
client-only website response does not expose article-specific Open Graph data to
social crawlers. The two existing articles need one authoritative image and
metadata workflow before additional distribution is added.

## Scope

- Add validated DEV/website cover and LinkedIn social-image metadata to writing
  posts.
- Integrate new coordinated, title- and subtitle-free artwork for both existing
  posts from 2000 x 840 sources, using the supplied images as visual references
  rather than resize targets.
- Keep editable sources and optimized public renditions in the repository.
- Render the writing collection as responsive one-, two-, and three-column cards
  with image above and semantic title below.
- Render the cover as a responsive article hero with the semantic article title
  alongside it.
- Prerender the writing collection and every writing article at build time so
  their complete content and metadata exist in the initial HTML response.
- Emit canonical, Open Graph, Twitter Card, and BlogPosting metadata with a
  purpose-built 1200 x 627 social image.
- Send the absolute deployed DEV-ratio image as DEV `main_image` without
  inlining it in article Markdown.
- Verify the deployed image before live DEV mutation, update both live articles,
  and prove the final synchronization is idempotent.
- Document image authoring, export, deployment, and social-preview requirements.

## Out of scope

- LinkedIn authentication, API integration, automatic posting, or a live
  LinkedIn test post.
- Runtime server-side rendering or a general-purpose image-generation service.
- Website tag filtering or social imagery for non-writing pages.

## Expected files to create or modify

- `apps/client/src/content/posts/*.md`
- repository-owned writing image sources and public renditions
- writing content types, compiler, metadata, pages, and tests
- client build/prerender entry and production static delivery where required
- DEV syndication adapter, workflow, and tests
- `docs/content-authoring.md`
- `docs/architecture.md`
- `docs/decisions.md`
- `progress.md`
- this task record

## Definition of done

- Both posts have repository-owned DEV/website and LinkedIn-compatible image
  renditions with important content visible at hero and thumbnail sizes.
- Every image surface displays the semantic article title alongside the image:
  website card, website article, DEV article, and LinkedIn/Open Graph preview.
- The collection forms an accessible responsive one/two/three-column card grid.
- Article routes display accessible responsive heroes without inlining the image
  into Markdown.
- Raw built article HTML contains complete article content, canonical metadata,
  Open Graph fields, Twitter Card fields, and BlogPosting structured data.
- DEV payloads contain `main_image`, external-only tags, canonical URLs, and
  title-bearing article metadata while body Markdown remains image-free.
- Production image reachability/currentness is checked before live DEV updates.
- Tests, typecheck, build, responsive browser inspection, live DEV update,
  final unchanged run, and complete diff audit pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
pnpm syndicate:dev-to --dry-run
pnpm syndicate:dev-to
pnpm syndicate:dev-to
git diff --check
```

## Risks / questions

- DEV uses a 1000 x 420 (2.38:1) cover while LinkedIn recommends 1200 x 627
  (1.91:1), so the two outputs require deliberate compositions rather than
  platform cropping.
- Social crawlers cache previews; post-deployment LinkedIn inspection belongs to
  the later LinkedIn publishing task.
- Deployment and syndication must be ordered so DEV cannot fetch a missing or
  stale cover URL.

## Approval record

Approved by Adam on 15 August 2026.

- **Intentional boundaries:** build-time prerendering, not runtime SSR; two
  destination-specific image ratios; repository-owned sources and outputs.
- **Important deferrals:** LinkedIn posting/integration and live LinkedIn preview
  inspection remain separate work.
- **Implementation decisions:** require every consuming surface to render the
  semantic title alongside the image. The bitmaps contain neither titles nor
  subtitles; their illustrations must communicate each article's idea visually.
  Source artwork is 2000 x 840. Adam is preparing the final illustrations in a
  separate conversation after declining the generated architecture concepts.
- **Do not reopen without new evidence:** one bitmap must not be stretched or
  automatically cropped across incompatible DEV and LinkedIn ratios.

### Refinement approval record

Approved by Adam on 15 August 2026.

- **Goal:** remove the poor dedicated social renditions and experimentally refine
  image framing and spacing without redesigning Writing.
- **Intentional boundaries:** full expressive titles;
  breadcrumb → illustration → title; no captions, overlays, badges, shadows,
  gradients, card backgrounds, or changes to Products.
- **Implementation decision:** compare the current treatment with restrained
  border/rule/spacing alternatives and retain only a clear improvement.
- **Important deferral:** Adam will evaluate the result after implementation and
  may keep or amend the presentation.
- **Known risk:** LinkedIn may crop the normal 50:21 cover; this is accepted for
  the experiment rather than retaining visibly poor padded social images.
- **Post-implementation amendment:** after evaluating the two-column result,
  Adam restored three columns at the wide desktop breakpoint because half-width
  cards stretched the illustrations too far. Two columns remain at intermediate
  widths.

### Collection-spacing approval record

Approved by Adam on 15 August 2026.

- **Scope:** reduce only the gap between the `COLLECTION` heading and writing
  grid from 20px to 16px, retaining the change only if direct browser comparison
  improves cohesion without compression.
- **Intentional boundary:** preserve the current responsive grid—three columns
  at the wide breakpoint and two at intermediate widths—and every other Writing
  presentation choice.

### Idempotency and alternative-text approval record

Approved by Adam on 15 August 2026.

- **Scope:** normalize DEV's returned cover CDN URL for idempotency and add
  required descriptive alternative text to article heroes.
- **Intentional boundaries:** keep thumbnail image alt text empty because each
  thumbnail shares a link with its visible article title; preserve the existing
  DEV article identities and generated slugs.
- **Important deferral:** DEV slug changes are not pursued. The website URLs in
  `canonical_url` remain authoritative.
- **Definition of done:** local validation passes and a live post-deployment
  synchronization reports both existing DEV articles unchanged.

## Status

Complete on `main` via PRs #46 and #47.

Implemented and locally validated: responsive cards, hero-before-title layout,
build-time prerendering for `/` and article routes, social/structured metadata,
new titles and canonical slugs, generated permanent redirects for former slugs,
and legacy-aware idempotent DEV updates.

Adam supplied final 1935 x 813 source illustrations. They are retained unchanged
and exported as 2000 x 840 heroes, 1000 x 420 cards, and uncropped 1200 x 627
social compositions. Desktop browser inspection confirms that the sources remain
legible on cards and heroes without edge loss.

The site and both existing DEV articles are deployed without duplication. A
post-deployment audit found that DEV returns `main_image` as a transformed
`cover_image` CDN URL, causing redundant updates. The approved follow-up fixes
that comparison and the article-hero alternative text before the final
unchanged synchronization audit.

Follow-up validation is complete: 384 tests pass with 16 skipped, typecheck and
build pass, and CI passes. Local and deployed prerendered HTML contain
descriptive hero alt text and empty linked-thumbnail alt text. The
merge-triggered workflow and a separate post-deployment live audit both report
the two existing DEV articles unchanged.

## Completion audit

- **Repository-owned imagery:** both posts retain source PNGs and optimized
  2000 x 840 and 1000 x 420 JPEGs under their slug-owned public directories.
- **Collection and hero presentation:** mounted browser review approved the
  responsive one/two/three-column collection, bordered images, hero-before-title
  order, and final spacing. Production raw HTML exposes the same structure.
- **Accessibility:** `coverImageAlt` is a required compiled field. Each
  standalone hero exposes its authored description; linked thumbnails use empty
  alt text alongside their visible semantic titles. Unit tests and raw built and
  production HTML inspections verify both contexts.
- **Prerendering and metadata:** production builds emit complete Writing index
  and article documents with canonical, Open Graph, Twitter, and BlogPosting
  metadata; the API host serves route documents and permanent legacy redirects.
- **DEV payload and identity:** payload tests verify external-only tags,
  canonical website URLs, `main_image`, and image-free Markdown. Existing
  articles were found through their legacy canonicals and updated in place;
  DEV-generated slugs intentionally remain unchanged.
- **Deployment and idempotency:** canonical pages and byte-identical covers were
  verified before the initial live updates. DEV's returned CDN `cover_image` is
  normalized back to the submitted source URL. The merge-triggered workflow and
  a later post-deployment run each reported both articles `unchanged`.
- **Validation:** `pnpm test` (384 passed, 16 skipped), `pnpm typecheck`,
  `pnpm build`, `pnpm syndicate:dev-to --dry-run`, `git diff --check`, PR #47
  `validate` CI, responsive browser inspection, prerendered-HTML inspection,
  production raw-HTML inspection, and live DEV audits pass.
- **Branch-diff audit:** the complete changes remain inside the client-owned
  public-Writing content, presentation, prerendering, host delivery, and
  syndication boundaries. No product logic, persistence, migration, prompt,
  authentication, AI-provider, or unrelated user changes were introduced.
