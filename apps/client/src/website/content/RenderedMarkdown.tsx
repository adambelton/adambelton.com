import type { SanitizedHtml } from "apps/client/src/website/content/content-types";

type RenderedMarkdownProps = {
  html: SanitizedHtml;
};

export function RenderedMarkdown({ html }: RenderedMarkdownProps) {
  return (
    <div
      className="markdown-content max-w-3xl text-lg leading-8 text-[var(--muted)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
