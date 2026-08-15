import { Breadcrumbs, Prose } from "apps/client/src/ui/components";
import { writingPosts } from "apps/client/src/website/content/content";
import { formatPublicDate } from "apps/client/src/website/content/formatPublicDate";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";
import { WritingCoverImage } from "apps/client/src/website/pages/WritingCoverImage";

const description =
  "Senior software engineer building complex products around the way people actually work.";

export function HomePage() {
  return (
    <div className="grid gap-10 sm:gap-12">
      <PublicPageMetadata
        description={description}
        path="/"
        title="Adam Belton — Software engineer and product builder"
      />
      <section aria-labelledby="home-title">
        <Breadcrumbs items={[{ label: "Writing" }]} />
        <h1
          className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
          id="home-title"
        >
          Writing
        </h1>
        <Prose className="mt-6">
          Notes on products, technology, and the slow work of making ideas
          clearer.
        </Prose>
      </section>

      <section aria-labelledby="writing-title">
        <h2
          className="eyebrow mb-4"
          id="writing-title"
        >
          Collection
        </h2>
        <ol className="m-0 grid list-none gap-x-6 gap-y-12 p-0 md:grid-cols-2 xl:grid-cols-3">
          {writingPosts.map((post) => (
            <li className="min-w-0" key={post.slug}>
              <a className="group block text-[var(--foreground)] no-underline" href={`/writing/${post.slug}`}>
                <WritingCoverImage
                  coverImage={post.coverImage}
                  coverImageSmall={post.coverImageSmall}
                />
              <p className="mb-0 mt-7 text-sm text-[var(--muted)]">
                <time dateTime={post.createdAt}>
                  {formatPublicDate(post.createdAt)}
                </time>
              </p>
              <h3 className="mb-0 mt-3 text-2xl font-semibold tracking-normal">
                <span className="underline decoration-[var(--line)] underline-offset-4 group-hover:no-underline">{post.title}</span>
              </h3>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
