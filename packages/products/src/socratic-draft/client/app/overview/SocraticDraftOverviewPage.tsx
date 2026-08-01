import { SocraticDraftTextLink } from "packages/products/src/socratic-draft/client/app/SocraticDraftTextLink";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";

type SocraticDraftOverviewPageProps = {
  components: ProductAppComponents;
};

export function SocraticDraftOverviewPage({
  components,
}: SocraticDraftOverviewPageProps) {
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
          The Socratic Draft
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Start with a rough thought. The assistant asks questions, challenges
          assumptions, tracks threads, and helps turn the conversation into a
          private draft that you can shape together.
        </p>
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
        <p className="mt-5 text-base leading-7 text-[var(--muted)]">
          <SocraticDraftTextLink
            Link={components.Link}
            href="/products/socratic-draft/editor"
          >
            Open the editor demo
          </SocraticDraftTextLink>
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          <SocraticDraftTextLink
            Link={components.Link}
            href="/products/socratic-draft/privacy"
          >
            Privacy information
          </SocraticDraftTextLink>
        </p>
      </section>
    </>
  );
}
