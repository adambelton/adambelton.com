# Content authoring

Public website content is owned by the Vite client and committed as Markdown:

```txt
apps/client/src/content/
├── pages/   Website pages such as About
└── posts/   Dated writing posts
```

The files are intended to be created and edited in Obsidian. Standard Markdown,
GitHub-flavoured tables, task lists and strikethrough, and YAML properties are
supported. Extra YAML properties created by Obsidian are ignored, while the
fields used by the website are validated at build time.

Vite compiles the complete page/post collection into sanitized HTML and metadata
during development and production builds. Markdown, YAML, and syntax-tree
parsers are build-only tools and are not delivered to site visitors. A content
error names its source file and prevents a successful build.

Pages require `title` and `description`. Posts also require a navigation-length
`shortTitle`, a `createdAt` value in `YYYY-MM-DD` form, a lowercase hyphenated `slug`, `coverImage`,
`coverImageAlt`, `coverImageSmall`, and an `externalTags` list.
The optional `internalTags` list may contain only slugs
from the product registry. `externalTags` must contain one to four tags from the
reviewed DEV tag policy. The website receives the stable union of both lists;
DEV receives only `externalTags`. Adding a new external tag therefore requires
reviewing its live DEV tag page and adding it to the repository policy.

The homepage orders posts newest-first by `createdAt`; posts with the same date
use slug order so builds do
not depend on filesystem timestamps or discovery order. The slug defines the
public `/writing/:slug` route, independently of the filename. `shortTitle` is
used in breadcrumbs while cards, metadata, DEV, and the article heading retain
the full `title`. Optional `legacySlugs` generate permanent redirects and let
DEV identify an existing article when its canonical URL changes.

Writing images are repository-owned. Each post has a 2000 x 840 DEV/website,
Open Graph, and LinkedIn cover plus a 1000 x 420 card rendition beneath
`/images/writing/:slug`. The bitmap communicates the article's
idea visually without embedding semantic text; every consuming
surface must render the semantic title alongside it. The original PNG source is
retained as `illustration.png`; optimized JPEG renditions are regenerated from
that source without adding typography to the image. `coverImageAlt` describes
the illustration on the standalone article hero. Card thumbnails use empty alt
text because the image and visible article title share one link; repeating the
description would make the link's accessible name unnecessarily verbose.
Inline article images live in the same `/images/writing/:slug` directory with
descriptive filenames. Author them with useful alternative text and a
root-relative path, for example
`![Capability profile overview](/images/writing/example/capability-profile-overview.png)`.

Production builds prerender the writing collection and every post. Raw article
responses therefore contain their complete semantic content plus canonical,
Open Graph, Twitter Card, and BlogPosting metadata before JavaScript runs.

Raw HTML is removed by the build-time sanitizer. Obsidian wikilinks and embeds, callouts, tags, and block
references are currently unsupported and fail with a source-specific build
error. Use ordinary Markdown links. Images must use either an absolute web URL
or a root-relative public path such as `/content-assets/example.jpg`; relative
image paths are rejected because they resolve differently on nested routes.

Placeholder documents are deliberately committed for the initial scaffold.
They must be replaced with final content before production deployment.

## DEV syndication

Writing is syndicated through the DEV article API as complete Markdown. Each
DEV article uses `https://adambelton.com/writing/:slug` as its canonical URL.
The syndicator loads all of the authenticated author's DEV articles, matches by
the current or a declared legacy normalized canonical URL, creates a missing article, updates a changed article,
and leaves identical articles untouched. More than one DEV article claiming the
same canonical URL is an error requiring manual resolution.
DEV-generated article slugs are not mutable through the article API and remain
independent of the authoritative website canonical URL.

Run a local payload check without credentials or network mutations:

```sh
pnpm syndicate:dev-to --dry-run
```

GitHub Actions also exposes this dry run through the **Syndicate writing to
DEV** manual workflow. Live runs require the repository secret
`DEV_TO_API_KEY`. Automatic runs after writing changes reach `main` additionally
require the repository variable `DEV_TO_SYNDICATION_ENABLED` to equal `true`.
Keep that variable disabled until the API key is configured, both initial
articles have been reviewed under DEV's current submission rules, and any
material generative-AI assistance has been disclosed in the article as DEV
requires.

A live run waits for every canonical website page and all byte-identical
repository images to be live before calling DEV. The cover is sent as
`main_image` and is never inserted into article Markdown. Root-relative inline
image paths are converted to absolute `https://adambelton.com/...` URLs only in
the outbound DEV payload; the repository Markdown remains the website-oriented
source of truth. Missing local images or stale deployed bytes stop the live run
before any DEV mutation. If the workflow fails, correct the configuration or
content and rerun it manually; canonical matching makes recovery idempotent.
