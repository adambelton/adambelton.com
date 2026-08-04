import { toMarkdown } from "mdast-util-to-markdown";

export function legacyPlainTextToSemanticMarkdown(source: string) {
  if (!source.trim()) return "";
  const paragraphs = source
    .split(/\n{2,}/)
    .map((value) => value.trimEnd())
    .filter((value) => value.length > 0)
    .map((value) => ({ type: "paragraph", children: [{ type: "text", value }] }));
  return toMarkdown({ type: "root", children: paragraphs } as never, {
    bullet: "-",
    emphasis: "*",
    strong: "*",
    rule: "-",
  });
}
