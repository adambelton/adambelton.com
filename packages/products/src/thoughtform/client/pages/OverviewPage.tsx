import { TextLink } from "packages/products/src/thoughtform/client/ui/TextLink";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";
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
          ThoughtForm
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)]">
          Explore what you think or feel through conversation. The assistant
          helps you notice distinctions, organise ideas, and, when it is useful,
          articulate them in a private Draft that remains yours to shape.
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
        {accessLevel === ACCESS_LEVELS.owner ||
        components.isTemporaryWorkspaceAvailable ? (
          <>
            <p className="mt-5 text-base leading-7 text-[var(--muted)]">
              <TextLink Link={components.Link} href="/products/thoughtform/editor">
                Open the workspace
              </TextLink>
            </p>
            {accessLevel === ACCESS_LEVELS.owner ? (
            <p className="mt-3 text-base leading-7 text-[var(--muted)]">
              <TextLink
                Link={components.Link}
                href="/products/thoughtform/conversations"
              >
                Saved conversations
              </TextLink>
            </p>
            ) : null}
          </>
        ) : null}
        <p className="mt-3 text-base leading-7 text-[var(--muted)]">
          <TextLink
            Link={components.Link}
            href="/products/thoughtform/privacy"
          >
            Privacy information
          </TextLink>
        </p>
      </section>
    </>
  );
}
