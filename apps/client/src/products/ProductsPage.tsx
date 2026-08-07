import { products } from "packages/products/src/registry";
import { Breadcrumbs, Prose, TextLink } from "apps/client/src/ui/components";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";

const description =
  "Products and experiments built around difficult, human problems.";

export function ProductsPage() {
  return (
    <div className="grid gap-10 sm:gap-12">
      <PublicPageMetadata
        description={description}
        path="/products"
        title="Products — Adam Belton"
      />
      <section aria-labelledby="products-title">
        <Breadcrumbs items={[{ label: "Products" }]} />
        <h1
          className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
          id="products-title"
        >
          Products
        </h1>
        <Prose className="mt-6">
          Products and experiments built around difficult, human problems.
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
              <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
                Preparing for public beta
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                {product.summary}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
