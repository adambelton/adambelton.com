import { products } from "packages/shared/src";
import { Prose } from "apps/web/components/site/Prose";
import { TextLink } from "apps/web/components/site/TextLink";

export default function ProductsPage() {
  return (
    <main className="grid gap-14 pb-24 pt-14 sm:gap-20 sm:pb-32 sm:pt-20">
      <section aria-labelledby="products-title">
        <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
          Products
        </p>
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="products-title"
        >
          Things being built.
        </h1>
        <Prose className="mt-8">
          Product notes and demos will live here as they become real enough to
          show.
        </Prose>
      </section>

      <section aria-labelledby="products-list-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="products-list-title"
        >
          Current
        </h2>
        <ul className="m-0 grid list-none gap-5 p-0">
          {products.map((product) => (
            <li className="border-t border-[var(--line)] pt-5" key={product.id}>
              <h3 className="m-0 text-2xl font-semibold tracking-normal">
                <TextLink href={product.publicPath}>{product.name}</TextLink>
              </h3>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {product.summary}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
