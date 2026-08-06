import { parse } from "yaml";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type {
  CompiledContentPage,
  CompiledWritingPost,
  SanitizedHtml,
} from "apps/client/src/website/content/content-types";

type ContentMetadata = Record<string, unknown>;
type ContentKind = "page" | "post";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function withoutCode(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "")
    .replace(/`[^`\n]*`/g, "");
}

function assertSupportedObsidianMarkdown(markdown: string, source: string) {
  const prose = withoutCode(markdown);
  const unsupported = [
    { pattern: /!?\[\[[\s\S]*?\]\]/, name: "wikilinks or embeds" },
    { pattern: /^>\s*\[![^\]]+\]/m, name: "callouts" },
    { pattern: /(?:^|\s)\^[a-z0-9-]+\s*$/im, name: "block references" },
    { pattern: /(?:^|\s)#[\p{L}\p{N}_/-]+/u, name: "Obsidian tags" },
  ];
  const match = unsupported.find(({ pattern }) => pattern.test(prose));
  if (match) throw new Error(`${source}: unsupported Obsidian ${match.name}.`);
  if (/!\[[^\]]*\]\((?!https?:\/\/|\/|data:|#)[^)]+\)/.test(prose)) {
    throw new Error(
      `${source}: image paths must be root-relative (for example /content-assets/image.jpg) or absolute URLs.`,
    );
  }
}

function requiredString(metadata: ContentMetadata, field: string, source: string) {
  const value = metadata[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${source}: frontmatter field "${field}" must be a non-empty string.`);
  }
  return value.trim();
}

function parseDocument(sourceText: string, source: string) {
  const normalized = sourceText.replace(/\r\n?/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);
  if (!match) throw new Error(`${source}: expected YAML frontmatter enclosed by --- lines.`);
  const metadata = parse(match[1] ?? "");
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error(`${source}: frontmatter must be a YAML mapping.`);
  }
  const body = (match[2] ?? "").trim();
  if (!body) throw new Error(`${source}: Markdown body must not be empty.`);
  assertSupportedObsidianMarkdown(body, source);
  return { metadata: metadata as ContentMetadata, body };
}

function renderSanitizedMarkdown(markdown: string) {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .processSync(markdown),
  ) as SanitizedHtml;
}

export function compileContentDocument(
  sourceText: string,
  source: string,
  kind: "page",
): CompiledContentPage;
export function compileContentDocument(
  sourceText: string,
  source: string,
  kind: "post",
): CompiledWritingPost;
export function compileContentDocument(
  sourceText: string,
  source: string,
  kind: ContentKind,
): CompiledContentPage | CompiledWritingPost {
  const { body, metadata } = parseDocument(sourceText, source);
  const shared = {
    bodyHtml: renderSanitizedMarkdown(body),
    description: requiredString(metadata, "description", source),
    source,
    title: requiredString(metadata, "title", source),
  };
  if (kind === "page") return shared;

  const createdAt = requiredString(metadata, "createdAt", source);
  const slug = requiredString(metadata, "slug", source);
  const parsedCreatedAt = new Date(`${createdAt}T00:00:00Z`);
  if (
    !ISO_DATE.test(createdAt) ||
    Number.isNaN(parsedCreatedAt.valueOf()) ||
    parsedCreatedAt.toISOString().slice(0, 10) !== createdAt
  ) {
    throw new Error(`${source}: "createdAt" must be a valid YYYY-MM-DD date.`);
  }
  if (!SLUG.test(slug)) {
    throw new Error(`${source}: "slug" must contain lowercase words separated by hyphens.`);
  }
  return { ...shared, createdAt, slug };
}

export function compileContentCollection(
  pages: Record<string, string>,
  posts: Record<string, string>,
) {
  const compiledPages = Object.entries(pages).map(([source, text]) =>
    compileContentDocument(text, source, "page"),
  );
  const compiledPosts = Object.entries(posts).map(([source, text]) =>
    compileContentDocument(text, source, "post"),
  );
  const slugs = new Set<string>();
  for (const post of compiledPosts) {
    if (slugs.has(post.slug)) throw new Error(`Duplicate writing post slug: "${post.slug}".`);
    slugs.add(post.slug);
  }
  compiledPosts.sort(
    (left, right) =>
      right.createdAt.localeCompare(left.createdAt) || left.slug.localeCompare(right.slug),
  );
  return { pages: compiledPages, posts: compiledPosts };
}
