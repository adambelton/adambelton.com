import type { SanitizedHtml } from "apps/client/src/website/content/content-types";

type RenderedMarkdownProps = {
  className?: string;
  html: SanitizedHtml;
};

export function RenderedMarkdown({ className = "", html }: RenderedMarkdownProps) {
  return (
    <div
      className={`markdown-content max-w-2xl text-base leading-7 text-[var(--muted)] ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
