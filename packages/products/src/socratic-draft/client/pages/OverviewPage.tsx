import { TextLink } from "packages/products/src/socratic-draft/client/ui/TextLink";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/product-app-components";
import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";

type OverviewPageProps = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
};

export function OverviewPage({
  accessLevel,
  components,
}: OverviewPageProps) {
  return (
    <>
      <section aria-labelledby="product-title">
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
          <TextLink
            Link={components.Link}
            href="/products/socratic-draft/editor"
          >
            Open the editor demo
          </TextLink>
        </p>
        {accessLevel === ACCESS_LEVELS.owner ? (
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">
            <TextLink
              Link={components.Link}
              href="/products/socratic-draft/conversations"
            >
              Saved conversations
            </TextLink>
          </p>
        ) : null}
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          <TextLink
            Link={components.Link}
            href="/products/socratic-draft/privacy"
          >
            Privacy information
          </TextLink>
        </p>
      </section>
    </>
  );
}
