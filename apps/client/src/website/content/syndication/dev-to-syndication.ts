import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  compileContentDocument,
  parseContentDocument,
} from "apps/client/src/website/content/build/compile-content";

const productionOrigin = "https://adambelton.com";
const devApiOrigin = "https://dev.to/api";
const postsDirectory = fileURLToPath(
  new URL("../../../content/posts", import.meta.url),
);

type Fetch = typeof fetch;

export type SyndicationPost = ReturnType<typeof loadWritingPosts>[number];

export type DevArticle = {
  body_markdown: string;
  canonical_url: string;
  description: string;
  id: number;
  published: boolean;
  tag_list: string[];
  title: string;
};

export function loadWritingPosts(directory = postsDirectory) {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => {
      const source = join(directory, entry.name);
      const sourceText = readFileSync(source, "utf8");
      const compiled = compileContentDocument(sourceText, source, "post");
      const { body } = parseContentDocument(sourceText, source);
      return { ...compiled, bodyMarkdown: body };
    });
}

export function canonicalUrlFor(slug: string) {
  return new URL(`/writing/${slug}`, productionOrigin).toString();
}

export function devArticlePayload(post: SyndicationPost) {
  return {
    article: {
      body_markdown: post.bodyMarkdown,
      canonical_url: canonicalUrlFor(post.slug),
      description: post.description,
      published: true,
      tags: post.externalTags,
      title: post.title,
    },
  };
}

function normalizedUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

export function findArticleByCanonicalUrl(articles: DevArticle[], canonicalUrl: string) {
  const matches = articles.filter(
    (article) =>
      article.canonical_url && normalizedUrl(article.canonical_url) === normalizedUrl(canonicalUrl),
  );
  if (matches.length > 1) {
    throw new Error(`DEV contains multiple articles for canonical URL ${canonicalUrl}.`);
  }
  return matches[0];
}

export function articleNeedsUpdate(article: DevArticle, post: SyndicationPost) {
  const payload = devArticlePayload(post).article;
  return (
    article.title !== payload.title ||
    article.description !== payload.description ||
    article.body_markdown.trim() !== payload.body_markdown.trim() ||
    normalizedUrl(article.canonical_url) !== normalizedUrl(payload.canonical_url) ||
    !article.published ||
    article.tag_list.join(",") !== post.externalTags.join(",")
  );
}

async function apiRequest<T>(
  path: string,
  apiKey: string,
  fetchImpl: Fetch,
  init?: RequestInit,
) {
  const response = await fetchImpl(`${devApiOrigin}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.forem.api-v1+json",
      "Content-Type": "application/json",
      "User-Agent": "adambelton.com writing syndication",
      "api-key": apiKey,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.text()).slice(0, 500);
    throw new Error(`DEV API ${init?.method ?? "GET"} ${path} failed (${response.status}): ${body}`);
  }
  return (await response.json()) as T;
}

export async function loadAllDevArticles(apiKey: string, fetchImpl: Fetch = fetch) {
  const articles: DevArticle[] = [];
  for (let page = 1; ; page += 1) {
    const batch = await apiRequest<DevArticle[]>(
      `/articles/me/all?per_page=1000&page=${page}`,
      apiKey,
      fetchImpl,
    );
    articles.push(...batch);
    if (batch.length < 1000) return articles;
  }
}

export async function waitForCanonicalPage(
  canonicalUrl: string,
  fetchImpl: Fetch = fetch,
  attempts = 30,
  delayMilliseconds = 10_000,
) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchImpl(canonicalUrl, {
        headers: { "User-Agent": "adambelton.com writing syndication" },
      });
      if (response.ok) return;
    } catch {
      // A deployment or DNS transition can temporarily make the page unreachable.
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMilliseconds));
    }
  }
  throw new Error(`Canonical page did not become reachable: ${canonicalUrl}`);
}

export async function syndicateWriting({
  apiKey,
  dryRun = false,
  fetchImpl = fetch,
  posts = loadWritingPosts(),
}: {
  apiKey?: string;
  dryRun?: boolean;
  fetchImpl?: Fetch;
  posts?: SyndicationPost[];
}) {
  if (dryRun) {
    return posts.map((post) => ({
      action: "create-or-update" as const,
      canonicalUrl: canonicalUrlFor(post.slug),
      externalTags: post.externalTags,
      slug: post.slug,
    }));
  }
  if (!apiKey) throw new Error("DEV_TO_API_KEY is required for live syndication.");

  const articles = await loadAllDevArticles(apiKey, fetchImpl);
  const results = [];
  for (const post of posts) {
    const canonicalUrl = canonicalUrlFor(post.slug);
    await waitForCanonicalPage(canonicalUrl, fetchImpl);
    const existing = findArticleByCanonicalUrl(articles, canonicalUrl);
    if (existing && !articleNeedsUpdate(existing, post)) {
      results.push({ action: "unchanged" as const, canonicalUrl, slug: post.slug });
      continue;
    }
    const path = existing ? `/articles/${existing.id}` : "/articles";
    const method = existing ? "PUT" : "POST";
    const article = await apiRequest<DevArticle>(path, apiKey, fetchImpl, {
      body: JSON.stringify(devArticlePayload(post)),
      method,
    });
    if (!existing) articles.push(article);
    results.push({
      action: existing ? ("updated" as const) : ("created" as const),
      canonicalUrl,
      slug: post.slug,
    });
  }
  return results;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const results = await syndicateWriting({ apiKey: process.env.DEV_TO_API_KEY, dryRun });
  for (const result of results) process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
