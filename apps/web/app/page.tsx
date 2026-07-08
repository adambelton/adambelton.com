import { products } from "@adambelton/shared";
import { Prose } from "../components/site/Prose";

const featuredWriting = [
  {
    title: "Notes from the build",
    excerpt:
      "Early fragments on writing, care, software, and the shape of things being made."
  }
];

export default function HomePage() {
  const [featuredProduct] = products;

  return (
    <main className="grid gap-14 pb-24 pt-14 sm:gap-20 sm:pb-32 sm:pt-20">
      <section aria-labelledby="home-title">
        <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
          adambelton.com
        </p>
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="home-title"
        >
          Writing first. Products close behind.
        </h1>
        <Prose className="mt-8">
          A personal site for published writing, live product demos, and the
          slower work of turning half-formed thoughts into something clearer.
        </Prose>
      </section>

      <section aria-labelledby="writing-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="writing-title"
        >
          Latest Writing
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0">
          {featuredWriting.map((post) => (
            <li className="border-t border-[var(--line)] pt-5" key={post.title}>
              <h3 className="m-0 text-2xl font-semibold tracking-normal">
                {post.title}
              </h3>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {post.excerpt}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {featuredProduct ? (
        <section aria-labelledby="product-title">
          <h2
            className="mb-5 text-sm font-semibold uppercase tracking-normal"
            id="product-title"
          >
            First Product
          </h2>
          <article className="border-t border-[var(--line)] pt-5">
            <h3 className="m-0 text-2xl font-semibold tracking-normal">
              {featuredProduct.name}
            </h3>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
              {featuredProduct.summary}
            </p>
          </article>
        </section>
      ) : null}
    </main>
  );
}
