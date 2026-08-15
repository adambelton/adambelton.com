import { Navigate, useParams } from "react-router";
import { Breadcrumbs } from "apps/client/src/ui/components";
import { getWritingPost } from "apps/client/src/website/content/content";
import { RenderedMarkdown } from "apps/client/src/website/content/RenderedMarkdown";
import { NotFoundPage } from "apps/client/src/website/pages/NotFoundPage";
import { formatPublicDate } from "apps/client/src/website/content/formatPublicDate";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";
import { WritingCoverImage } from "apps/client/src/website/pages/WritingCoverImage";

export function WritingPostPage() {
  const { slug = "" } = useParams();
  const post = getWritingPost(slug);
  if (!post) return <NotFoundPage />;
  if (slug !== post.slug) return <Navigate replace to={`/writing/${post.slug}`} />;

  return (
    <>
      <PublicPageMetadata
        article={{ publishedTime: post.createdAt, tags: post.externalTags }}
        description={post.description}
        image={post.coverImage}
        imageHeight={840}
        imageWidth={2000}
        path={`/writing/${post.slug}`}
        title={`${post.title} — Adam Belton`}
      />
      <article aria-labelledby="post-title" className="min-w-0">
        <Breadcrumbs
          items={[
            { label: "Writing", href: "/" },
            { label: post.shortTitle ?? post.title },
          ]}
        />
        <WritingCoverImage alt={post.coverImageAlt} coverImage={post.coverImage} />
        <header className="mt-12">
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
        </header>
        <div className="mt-10 border-t border-[var(--line)] pt-8">
          <RenderedMarkdown html={post.bodyHtml} />
        </div>
      </article>
    </>
  );
}
