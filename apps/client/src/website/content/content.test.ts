import { describe, expect, it } from "vitest";
import {
  approvedInternalProductTags,
  compileContentCollection,
  compileContentDocument,
} from "apps/client/src/website/content/build/compile-content";
import { productOverviewCatalogue } from "apps/client/src/products/catalogue/product-overview-catalogue";

const post = (slug: string, createdAt: string, extra = "") => `---
title: ${slug}
shortTitle: Short ${slug}
description: A description
createdAt: ${createdAt}
slug: ${slug}
coverImage: /images/writing/${slug}/cover-2000x840.jpg
coverImageAlt: An illustration for ${slug}.
coverImageSmall: /images/writing/${slug}/cover-1000x420.jpg
internalTags: []
externalTags:
  - webdev
aliases:
  - An allowed Obsidian property
---

## Heading

Body text.

${extra}`;

describe("repository Markdown content", () => {
  it("keeps the host internal-tag policy aligned with public product overviews", () => {
    expect(approvedInternalProductTags).toEqual(
      productOverviewCatalogue.map(({ slug }) => slug),
    );
  });
  it("accepts Obsidian YAML properties and CRLF documents", () => {
    const page = compileContentDocument(
      "---\r\ntitle: About\r\ndescription: About Adam\r\ncssclasses:\r\n  - wide\r\n---\r\n\r\nAbout body.",
      "about.md",
      "page",
    );
    expect(page).toMatchObject({
      description: "About Adam",
      source: "about.md",
      title: "About",
    });
    expect(page.bodyHtml).toBe("<p>About body.</p>");
  });

  it("orders posts newest-first with a stable slug tie-break", () => {
    expect(
      compileContentCollection({}, {
        "z.md": post("z-post", "2026-08-05"),
        "b.md": post("b-post", "2026-08-06"),
        "a.md": post("a-post", "2026-08-06"),
      }).posts.map(({ slug }) => slug),
    ).toEqual(["a-post", "b-post", "z-post"]);
  });

  it("combines product-only internal tags with reviewed external DEV tags", () => {
    const compiled = compileContentDocument(
      post("tagged", "2026-08-06").replace(
        "internalTags: []",
        "internalTags:\n  - thoughtform",
      ),
      "tagged.md",
      "post",
    );
    expect(compiled).toMatchObject({
      externalTags: ["webdev"],
      internalTags: ["thoughtform"],
      tags: ["thoughtform", "webdev"],
    });
  });

  it("allows posts without a product-specific internal tag", () => {
    const compiled = compileContentDocument(
      post("external-only", "2026-08-06").replace("internalTags: []\n", ""),
      "external-only.md",
      "post",
    );
    expect(compiled.internalTags).toEqual([]);
    expect(compiled.tags).toEqual(["webdev"]);
  });

  it("rejects unknown product tags and unreviewed or excessive DEV tags", () => {
    expect(() =>
      compileContentDocument(
        post("unknown-product", "2026-08-06").replace(
          "internalTags: []",
          "internalTags:\n  - portfolio",
        ),
        "unknown-product.md",
        "post",
      ),
    ).toThrow('internal tag "portfolio" is not a registered product slug');
    expect(() =>
      compileContentDocument(
        post("unknown-dev", "2026-08-06").replace("  - webdev", "  - invented"),
        "unknown-dev.md",
        "post",
      ),
    ).toThrow('external tag "invented" has not been reviewed and approved for DEV');
    expect(() =>
      compileContentDocument(
        post("too-many", "2026-08-06").replace(
          "  - webdev",
          "  - webdev\n  - architecture\n  - softwareengineering\n  - product\n  - ai",
        ),
        "too-many.md",
        "post",
      ),
    ).toThrow('"externalTags" must contain between one and four DEV tags');
  });

  it("rejects duplicate slugs and invalid creation metadata", () => {
    expect(() =>
      compileContentCollection({}, {
        "one.md": post("same", "2026-08-06"),
        "two.md": post("same", "2026-08-05"),
      }),
    ).toThrow('Duplicate writing post slug or legacy slug: "same"');
    expect(() => compileContentDocument(post("bad", "06/08/2026"), "bad.md", "post")).toThrow(
      '"createdAt" must be a valid YYYY-MM-DD date',
    );
    expect(() => compileContentDocument(post("bad", "2026-02-31"), "bad.md", "post")).toThrow(
      '"createdAt" must be a valid YYYY-MM-DD date',
    );
  });

  it("rejects legacy slugs that collide with current or legacy routes", () => {
    expect(() =>
      compileContentCollection({}, {
        "one.md": post("one", "2026-08-06").replace(
          "internalTags: []",
          "legacySlugs:\n  - old-route\ninternalTags: []",
        ),
        "two.md": post("old-route", "2026-08-05"),
      }),
    ).toThrow('Duplicate writing post slug or legacy slug: "old-route"');
  });

  it.each([
    ["[[Another note]]", "wikilinks"],
    ["> [!note] Callout", "callouts"],
    ["Paragraph ^block-id", "block references"],
    ["Paragraph #private-tag", "Obsidian tags"],
    ["![](relative/image.png)", "image paths must be root-relative"],
  ])("rejects unsupported Obsidian syntax: %s", (syntax, message) => {
    expect(() => compileContentDocument(post("syntax", "2026-08-06", syntax), "syntax.md", "post"))
      .toThrow(message);
  });

  it("does not reject Obsidian-like text inside code", () => {
    expect(() =>
      compileContentDocument(post("code", "2026-08-06", "`[[example]]`"), "code.md", "post"),
    ).not.toThrow();
  });

  it("renders GFM and removes raw or unsafe HTML", () => {
    const compiled = compileContentDocument(
      post(
        "safe",
        "2026-08-06",
        "~~Removed~~\n\n- [x] Done\n\n<script>alert('no')</script>\n\n[unsafe](javascript:alert('no'))",
      ),
      "safe.md",
      "post",
    );
    expect(compiled.bodyHtml).toContain("<del>Removed</del>");
    expect(compiled.bodyHtml).toContain('type="checkbox" checked disabled');
    expect(compiled.bodyHtml).not.toContain("<script");
    expect(compiled.bodyHtml).not.toContain("javascript:");
  });
});
