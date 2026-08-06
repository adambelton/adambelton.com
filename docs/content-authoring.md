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
in `YYYY-MM-DD` form and a lowercase hyphenated `slug`. The homepage orders posts
newest-first by `createdAt`; posts with the same date use slug order so builds do
not depend on filesystem timestamps or discovery order. The slug defines the
public `/writing/:slug` route, independently of the filename.

Raw HTML is removed by the build-time sanitizer. Obsidian wikilinks and embeds, callouts, tags, and block
references are currently unsupported and fail with a source-specific build
error. Use ordinary Markdown links. Images must use either an absolute web URL
or a root-relative public path such as `/content-assets/example.jpg`; relative
image paths are rejected because they resolve differently on nested routes.

Placeholder documents are deliberately committed for the initial scaffold.
They must be replaced with final content before production deployment.
