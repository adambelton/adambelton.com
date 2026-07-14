import { getProductById } from "packages/shared/src";
import { notFound } from "next/navigation";
import { Prose } from "apps/web/components/site/Prose";
import { TextLink } from "apps/web/components/site/TextLink";

export default function SocraticDraftPage() {
  const product = getProductById("socratic-draft");

  if (!product) {
    notFound();
  }

  return (
    <>
      <section aria-labelledby="product-title">
        <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
          Product
        </p>
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="product-title"
        >
          {product.name}
        </h1>
        <Prose className="mt-8">{product.description}</Prose>
      </section>

      <section aria-labelledby="status-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="status-title"
        >
          Status
        </h2>
        <p className="m-0 border-t border-[var(--line)] pt-5 text-2xl font-semibold tracking-normal">
          In Development
        </p>
        {product.demoPath ? (
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            <TextLink href={product.demoPath}>Open the editor demo</TextLink>
          </p>
        ) : null}
      </section>
    </>
  );
}
