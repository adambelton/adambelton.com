import type { SanitizedHtml } from "apps/client/src/website/content/content-types";

type RenderedMarkdownProps = {
  html: SanitizedHtml;
};

export function RenderedMarkdown({ html }: RenderedMarkdownProps) {
  return (
    <div
      className="markdown-content max-w-2xl text-lg leading-8 text-[var(--foreground)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
