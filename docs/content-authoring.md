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

Pages require `title` and `description`. Posts also require a `createdAt` value
in `YYYY-MM-DD` form, a lowercase hyphenated `slug`, and an `externalTags` list.
The optional `internalTags` list may contain only slugs
from the product registry. `externalTags` must contain one to four tags from the
reviewed DEV tag policy. The website receives the stable union of both lists;
DEV receives only `externalTags`. Adding a new external tag therefore requires
reviewing its live DEV tag page and adding it to the repository policy.

The homepage orders posts newest-first by `createdAt`; posts with the same date
use slug order so builds do
not depend on filesystem timestamps or discovery order. The slug defines the
public `/writing/:slug` route, independently of the filename.

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
normalized canonical URL, creates a missing article, updates a changed article,
and leaves identical articles untouched. More than one DEV article claiming the
same canonical URL is an error requiring manual resolution.

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

A live run waits for every canonical website page to return successfully before
calling DEV. If the workflow fails, correct the configuration or content and
rerun it manually; canonical matching makes recovery idempotent.
