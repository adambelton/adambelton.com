import { useParams } from "react-router";
import { Breadcrumbs } from "apps/client/src/ui/components";
import { getWritingPost } from "apps/client/src/website/content/content";
import { RenderedMarkdown } from "apps/client/src/website/content/RenderedMarkdown";
import { NotFoundPage } from "apps/client/src/website/pages/NotFoundPage";
import { formatPublicDate } from "apps/client/src/website/content/formatPublicDate";

export function WritingPostPage() {
  const { slug = "" } = useParams();
  const post = getWritingPost(slug);
  if (!post) return <NotFoundPage />;

  return (
    <>
      <title>{`${post.title} — Adam Belton`}</title>
      <meta content={post.description} name="description" />
      <article aria-labelledby="post-title" className="min-w-0">
        <Breadcrumbs
          items={[
            { label: "Writing", href: "/" },
            { label: post.title },
          ]}
        />
        <header>
          <h1
            className="m-0 max-w-4xl text-5xl font-semibold leading-[1] tracking-normal sm:text-7xl"
            id="post-title"
          >
            {post.title}
          </h1>
          <p className="mt-5 text-sm text-[var(--muted)]">
            <time dateTime={post.createdAt}>
              {formatPublicDate(post.createdAt)}
            </time>
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {post.description}
          </p>
        </header>
        <div className="mt-10 border-t border-[var(--line)] pt-8">
          <RenderedMarkdown html={post.bodyHtml} />
        </div>
      </article>
    </>
  );
}
