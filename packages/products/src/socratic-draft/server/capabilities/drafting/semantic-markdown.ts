import { directiveFromMarkdown, directiveToMarkdown } from "mdast-util-directive";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { directive } from "micromark-extension-directive";
import {
  DRAFT_CONTENT_FORMATS,
  legacyPlainTextToSemanticMarkdown,
  type DraftContentFormat,
} from "packages/products/src/socratic-draft/shared";
export const IMAGE_PLACEHOLDER_DIRECTIVE = "image-placeholder";

const ALLOWED_NODE_TYPES = new Set([
  "root",
  "paragraph",
  "heading",
  "strong",
  "emphasis",
  "list",
  "listItem",
  "blockquote",
  "link",
  "thematicBreak",
  "code",
  "inlineCode",
  "text",
  "break",
  "containerDirective",
]);
const PLACEHOLDER_ATTRIBUTES = new Set(["description", "purpose", "alt", "caption"]);

export class InvalidSemanticMarkdownError extends Error {}

export type SemanticMarkdownNode = {
  type: string;
  children?: SemanticMarkdownNode[];
  depth?: number;
  url?: string;
  name?: string;
  attributes?: Record<string, string | null> | null;
  value?: string;
  position?: unknown;
  [key: string]: unknown;
};

export function normalizeSemanticMarkdown(source: string) {
  if (!source.trim()) {
    throw new InvalidSemanticMarkdownError("Draft content cannot be empty.");
  }
  const document = parseSemanticMarkdown(source);
  return toMarkdown(document as never, {
    bullet: "-",
    emphasis: "*",
    strong: "*",
    rule: "-",
    extensions: [directiveToMarkdown()],
  });
}

export function parseSemanticMarkdown(source: string): SemanticMarkdownNode {
  let document: SemanticMarkdownNode;
  try {
    document = fromMarkdown(source, {
      extensions: [directive()],
      mdastExtensions: [directiveFromMarkdown()],
    }) as SemanticMarkdownNode;
  } catch {
    throw new InvalidSemanticMarkdownError("Draft content is not valid Markdown.");
  }
  validateNode(document);
  return document;
}

export function plainTextToSemanticMarkdown(source: string) {
  if (!source.trim()) {
    throw new InvalidSemanticMarkdownError("Draft content cannot be empty.");
  }
  return legacyPlainTextToSemanticMarkdown(source);
}

export function canonicalDraftMarkdown(body: string, format?: DraftContentFormat) {
  return format === DRAFT_CONTENT_FORMATS.semanticMarkdown
    ? normalizeSemanticMarkdown(body)
    : plainTextToSemanticMarkdown(body);
}

export function semanticMarkdownText(source: string) {
  const document = parseSemanticMarkdown(source);
  return (document.children ?? [])
    .map((node) => nodeText(node))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function validateNode(node: SemanticMarkdownNode) {
  if (!ALLOWED_NODE_TYPES.has(node.type)) {
    throw new InvalidSemanticMarkdownError(
      `Unsupported Markdown structure: ${node.type}.`,
    );
  }
  if (node.type === "heading" && (!node.depth || node.depth < 1 || node.depth > 4)) {
    throw new InvalidSemanticMarkdownError("Draft headings must use levels one through four.");
  }
  if (node.type === "link") validateLink(node.url);
  if (node.type === "containerDirective") validatePlaceholder(node);
  for (const child of node.children ?? []) validateNode(child);
}

function validateLink(url: string | undefined) {
  if (!url) throw new InvalidSemanticMarkdownError("Draft links require a destination.");
  if (url.startsWith("/") || url.startsWith("#")) return;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new InvalidSemanticMarkdownError("Draft links must use a safe URL.");
  }
  if (!["http:", "https:", "mailto:"].includes(parsed.protocol)) {
    throw new InvalidSemanticMarkdownError("Draft links must use a safe URL scheme.");
  }
}

function validatePlaceholder(node: SemanticMarkdownNode) {
  if (node.name !== IMAGE_PLACEHOLDER_DIRECTIVE) {
    throw new InvalidSemanticMarkdownError(`Unsupported Markdown directive: ${node.name ?? "unknown"}.`);
  }
  if ((node.children?.length ?? 0) > 0) {
    throw new InvalidSemanticMarkdownError("Image placeholders cannot contain nested Markdown.");
  }
  const attributes = node.attributes ?? {};
  for (const name of Object.keys(attributes)) {
    if (!PLACEHOLDER_ATTRIBUTES.has(name)) {
      throw new InvalidSemanticMarkdownError(`Unsupported image placeholder field: ${name}.`);
    }
  }
  if (!attributes.description?.trim()) {
    throw new InvalidSemanticMarkdownError("Image placeholders require a description.");
  }
}

function nodeText(node: SemanticMarkdownNode): string {
  if (node.type === "text" || node.type === "inlineCode" || node.type === "code") {
    return node.value ?? "";
  }
  if (node.type === "containerDirective") {
    const attributes = node.attributes ?? {};
    return [
      `Image placeholder: ${attributes.description ?? ""}`,
      attributes.purpose ? `Purpose: ${attributes.purpose}` : "",
      attributes.alt ? `Proposed alt text: ${attributes.alt}` : "",
      attributes.caption ? `Caption: ${attributes.caption}` : "",
    ].filter(Boolean).join("\n");
  }
  const separator = node.type === "list" || node.type === "blockquote" ? "\n" : "";
  return (node.children ?? []).map((child) => nodeText(child)).join(separator);
}
