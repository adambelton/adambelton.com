import { Breadcrumbs, Prose, TextLink } from "apps/client/src/ui/components";
import { writingPosts } from "apps/client/src/website/content/content";

export function HomePage() {
  return (
    <>
      <section aria-labelledby="home-title">
        <Breadcrumbs items={[{ label: "Writing" }]} />
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="home-title"
        >
          Notes, essays, and work in progress.
        </h1>
        <Prose className="mt-8">
          Writing about products, technology, and the slow work of making ideas
          clearer.
        </Prose>
      </section>

      <section aria-labelledby="writing-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="writing-title"
        >
          Collection
        </h2>
        <ol className="m-0 grid list-none gap-5 p-0">
          {writingPosts.map((post) => (
            <li className="border-t border-[var(--line)] pt-5" key={post.slug}>
              <p className="m-0 text-sm text-[var(--muted)]">
                <time dateTime={post.createdAt}>{post.createdAt}</time>
              </p>
              <h3 className="mb-0 mt-2 text-2xl font-semibold tracking-normal">
                <TextLink href={`/writing/${post.slug}`}>{post.title}</TextLink>
              </h3>
              <p className="mb-0 mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {post.description}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
