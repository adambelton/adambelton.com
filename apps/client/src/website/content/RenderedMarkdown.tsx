import type { SanitizedHtml } from "apps/client/src/website/content/content-types";

type RenderedMarkdownProps = {
  html: SanitizedHtml;
};

export function RenderedMarkdown({ html }: RenderedMarkdownProps) {
  return (
    <div
      className="markdown-content max-w-2xl text-base leading-7 text-[var(--muted)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
