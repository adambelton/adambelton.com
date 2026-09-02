import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { CompiledWritingPost } from "apps/client/src/website/content/content-types";
import {
  articleNeedsUpdate,
  assertWritingImagesExist,
  canonicalUrlFor,
  devArticlePayload,
  findArticleByCanonicalUrl,
  findArticleForPost,
  markdownForDev,
  repositoryImagePaths,
  syndicateWriting,
  waitForCanonicalPage,
  waitForDeployedWritingImage,
  type DevArticle,
  type SyndicationPost,
} from "apps/client/src/website/content/syndication/dev-to-syndication";

const post: SyndicationPost = {
  bodyHtml: "<p>Body</p>" as CompiledWritingPost["bodyHtml"],
  bodyMarkdown: "Body",
  coverImage: "/images/writing/a-post/cover-2000x840.jpg",
  coverImageAlt: "An illustration for the post.",
  coverImageSmall: "/images/writing/a-post/cover-1000x420.jpg",
  createdAt: "2026-08-15",
  description: "Description",
  externalTags: ["productengineering", "ai"],
  internalTags: ["thoughtform"],
  legacySlugs: [],
  shortTitle: "A post",
  slug: "a-post",
  source: "a-post.md",
  tags: ["thoughtform", "productengineering", "ai"],
  title: "A post",
};

const article = (overrides: Partial<DevArticle> = {}): DevArticle => ({
  body_markdown: "Body",
  canonical_url: canonicalUrlFor(post.slug),
  description: "Description",
  id: 42,
  cover_image: "https://adambelton.com/images/writing/a-post/cover-2000x840.jpg",
  published: true,
  tag_list: ["productengineering", "ai"],
  title: "A post",
  ...overrides,
});

describe("DEV writing syndication", () => {
  it("builds a full Markdown payload with external tags and the website canonical URL", () => {
    expect(devArticlePayload(post)).toEqual({
      article: {
        body_markdown: "Body",
        canonical_url: "https://adambelton.com/writing/a-post",
        description: "Description",
        main_image: "https://adambelton.com/images/writing/a-post/cover-2000x840.jpg",
        published: true,
        tags: ["productengineering", "ai"],
        title: "A post",
      },
    });
    expect(devArticlePayload(post).article.body_markdown).not.toContain(post.coverImage);
  });

  it("rewrites root-relative links and inline images without changing other destinations", () => {
    const markdown = [
      "![Profile](/images/writing/a-post/profile.png)",
      "![External](https://images.example.com/example.png)",
      "![Profile again](/images/writing/a-post/profile.png \"Profile title\")",
      "[About](/about)",
      "[Section](#section)",
      "[External article](https://example.com/article)",
    ].join("\n\n");

    expect(repositoryImagePaths(markdown)).toEqual(["/images/writing/a-post/profile.png"]);
    expect(markdownForDev(markdown)).toBe(
      [
        "![Profile](https://adambelton.com/images/writing/a-post/profile.png)",
        "![External](https://images.example.com/example.png)",
        "![Profile again](https://adambelton.com/images/writing/a-post/profile.png \"Profile title\")",
        "[About](https://adambelton.com/about)",
        "[Section](#section)",
        "[External article](https://example.com/article)",
      ].join("\n\n"),
    );
  });

  it("fails when a referenced repository writing image is missing", () => {
    const directory = mkdtempSync(join(tmpdir(), "writing-images-"));
    try {
      mkdirSync(join(directory, "images", "writing", "a-post"), { recursive: true });
      writeFileSync(join(directory, "images", "writing", "a-post", "present.png"), "image");
      expect(() =>
        assertWritingImagesExist(
          ["/images/writing/a-post/present.png", "/images/writing/a-post/missing.png"],
          "a-post.md",
          directory,
        ),
      ).toThrow("a-post.md: referenced writing image does not exist: /images/writing/a-post/missing.png");
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  it("fails when a deployed inline image does not match its repository file", async () => {
    const unavailable = vi.fn(async () => new Response("missing", { status: 404 })) as typeof fetch;
    await expect(
      waitForDeployedWritingImage(
        "/images/writing/engineering-capability-profile-beyond-the-cv/capability-profile-overview.png",
        "inline image",
        unavailable,
        1,
        0,
      ),
    ).rejects.toThrow("Deployed inline image did not match the repository image");
  });

  it("matches by normalized canonical URL and rejects duplicate ownership", () => {
    expect(
      findArticleByCanonicalUrl([article({ canonical_url: `${canonicalUrlFor(post.slug)}/` })], canonicalUrlFor(post.slug))?.id,
    ).toBe(42);
    expect(() =>
      findArticleByCanonicalUrl([article(), article({ id: 43 })], canonicalUrlFor(post.slug)),
    ).toThrow("multiple articles");
  });

  it("finds an existing DEV article through a legacy canonical URL", () => {
    const migratedPost = { ...post, legacySlugs: ["the-old-post"] };
    expect(
      findArticleForPost(
        [article({ canonical_url: canonicalUrlFor("the-old-post") })],
        migratedPost,
      )?.id,
    ).toBe(42);
    expect(() =>
      findArticleForPost(
        [article(), article({ id: 43, canonical_url: canonicalUrlFor("the-old-post") })],
        migratedPost,
      ),
    ).toThrow("multiple articles");
  });

  it("detects content changes but skips an identical published article", () => {
    expect(articleNeedsUpdate(article(), post)).toBe(false);
    expect(articleNeedsUpdate(article({ body_markdown: "Old body" }), post)).toBe(true);
    expect(articleNeedsUpdate(article({ tag_list: ["ai"] }), post)).toBe(true);
  });

  it("accepts DEV's transformed cover URL as the submitted source image", () => {
    expect(
      articleNeedsUpdate(
        article({
          cover_image:
            "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fadambelton.com%2Fimages%2Fwriting%2Fa-post%2Fcover-2000x840.jpg",
        }),
        post,
      ),
    ).toBe(false);
    expect(articleNeedsUpdate(article({ cover_image: "https://example.com/other.jpg" }), post)).toBe(true);
  });

  it("creates a missing article and updates it on a later changed run", async () => {
    const existing: DevArticle[] = [];
    const requests: Array<{ method: string; url: string }> = [];
    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      requests.push({ method, url });
      if (url === canonicalUrlFor(post.slug)) return new Response("ok", { status: 200 });
      if (url.includes("/articles/me/all")) return Response.json(existing);
      if (url.endsWith("/api/articles") && method === "POST") {
        const created = article();
        existing.push(created);
        return Response.json(created, { status: 201 });
      }
      if (url.endsWith("/api/articles/42") && method === "PUT") {
        return Response.json(article({ body_markdown: "Changed" }));
      }
      return new Response("unexpected", { status: 500 });
    }) as typeof fetch;

    await expect(syndicateWriting({ apiKey: "secret", fetchImpl, posts: [post], verifyDeployedAssets: false })).resolves.toEqual([
      expect.objectContaining({ action: "created" }),
    ]);
    await expect(
      syndicateWriting({
        apiKey: "secret",
        fetchImpl,
        posts: [{ ...post, bodyMarkdown: "Changed" }],
        verifyDeployedAssets: false,
      }),
    ).resolves.toEqual([expect.objectContaining({ action: "updated" })]);
    expect(requests).toEqual(expect.arrayContaining([
      expect.objectContaining({ method: "POST" }),
      expect.objectContaining({ method: "PUT" }),
    ]));
  });

  it("requires no secret or network access for dry runs", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(syndicateWriting({ dryRun: true, fetchImpl, posts: [post] })).resolves.toEqual([
      {
        action: "create-or-update",
        canonicalUrl: canonicalUrlFor(post.slug),
        externalTags: post.externalTags,
        slug: post.slug,
      },
    ]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("leaves an identical article unchanged without a write request", async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url === canonicalUrlFor(post.slug)) return new Response("ok", { status: 200 });
      if (url.includes("/articles/me/all")) return Response.json([article()]);
      return new Response("unexpected", { status: 500 });
    }) as typeof fetch;

    await expect(syndicateWriting({ apiKey: "secret", fetchImpl, posts: [post], verifyDeployedAssets: false })).resolves.toEqual([
      expect.objectContaining({ action: "unchanged" }),
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("fails safely for missing credentials, DEV errors, and unavailable canonical pages", async () => {
    await expect(syndicateWriting({ posts: [post] })).rejects.toThrow("DEV_TO_API_KEY is required");
    const rejectedApi = vi.fn(async () => new Response("unauthorized", { status: 401 })) as typeof fetch;
    await expect(
      syndicateWriting({ apiKey: "secret", fetchImpl: rejectedApi, posts: [post], verifyDeployedAssets: false }),
    ).rejects.toThrow("DEV API GET /articles/me/all");
    const unavailable = vi.fn(async () => new Response("missing", { status: 404 })) as typeof fetch;
    await expect(waitForCanonicalPage(canonicalUrlFor(post.slug), unavailable, 1, 0)).rejects.toThrow(
      "Canonical page did not become reachable",
    );
  });
});
