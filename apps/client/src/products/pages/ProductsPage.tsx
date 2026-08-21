import { Breadcrumbs, Prose, TextLink } from "apps/client/src/ui/components";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";
import {
  PRODUCT_OVERVIEW_SECTIONS,
  productOverviewCatalogue,
  type ProductOverviewSection,
} from "apps/client/src/products/catalogue/product-overview-catalogue";

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

      <ProductSection
        id="current-products-title"
        section={PRODUCT_OVERVIEW_SECTIONS.current}
        title="Current"
      />
      <ProductSection
        id="completed-products-title"
        section={PRODUCT_OVERVIEW_SECTIONS.completed}
        title="Completed"
      />
    </div>
  );
}

function ProductSection({
  id,
  section,
  title,
}: {
  id: string;
  section: ProductOverviewSection;
  title: string;
}) {
  const sectionProducts = productOverviewCatalogue.filter(
    (product) => product.catalogueSection === section,
  );

  return (
    <section aria-labelledby={id}>
      <h2
        className="eyebrow mb-5 w-full border-b border-[var(--line)] pb-4"
        id={id}
      >
        {title}
      </h2>
      <ul className="m-0 grid list-none gap-x-6 gap-y-10 p-0 md:grid-cols-2 xl:grid-cols-3">
        {sectionProducts.map((product) => (
          <li className="w-full" key={product.id}>
            <h3 className="m-0 text-2xl font-semibold tracking-normal">
              <TextLink href={product.publicPath}>{product.name}</TextLink>
            </h3>
            <p className="mt-2 text-sm font-semibold text-[var(--accent)]">
              {product.statusLabel}
            </p>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {product.summary}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
