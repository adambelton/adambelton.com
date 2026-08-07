import { TextLink } from "packages/products/src/thoughtform/client/ui/TextLink";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";
import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";

type OverviewPageProps = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
};

export function OverviewPage({ accessLevel, components }: OverviewPageProps) {
  const isWorkspaceAvailable =
    accessLevel === ACCESS_LEVELS.owner ||
    components.isTemporaryWorkspaceAvailable;

  return (
    <div className="grid gap-14 sm:gap-20">
      <section aria-labelledby="product-title">
        <h1
          className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
          id="product-title"
        >
          ThoughtForm
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Explore what you think or feel through conversation. The assistant
          helps you notice distinctions, organise ideas, and, when it is useful,
          articulate them in a private Draft that remains yours to shape.
        </p>
        <p className="mt-5 text-sm font-semibold text-[var(--accent)]">
          Preparing for public beta
        </p>
      </section>

      <section aria-labelledby="useful-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="useful-title"
        >
          When it helps
        </h2>
        <p className="m-0 max-w-2xl border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
          ThoughtForm is for questions, experiences, decisions, and ideas that
          do not yet have a clear shape. The conversation helps you slow down,
          notice distinctions, test assumptions, and find language that feels
          faithful to what you mean.
        </p>
      </section>

      <section aria-labelledby="works-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="works-title"
        >
          How it works
        </h2>
        <ol className="m-0 grid max-w-4xl list-none gap-6 border-t border-[var(--line)] p-0 pt-5 sm:grid-cols-3">
          <li>
            <p className="m-0 text-xl font-semibold">Explore</p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">
              Think through the subject in conversation without needing to know
              the conclusion first.
            </p>
          </li>
          <li>
            <p className="m-0 text-xl font-semibold">Inspect</p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">
              Review and correct an evolving Idea Map instead of leaving the
              assistant&apos;s interpretation hidden.
            </p>
          </li>
          <li>
            <p className="m-0 text-xl font-semibold">Articulate</p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">
              When it is useful, compose a private Draft that remains yours to
              edit and shape.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="development-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="development-title"
        >
          Development snapshot
        </h2>
        <div className="grid max-w-4xl gap-6 border-t border-[var(--line)] pt-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="text-base leading-7 text-[var(--muted)]">
            <p className="m-0">
              The complete thinking loop is working today: streamed conversation,
              a user-correctable Idea Map, and optional Draft composition and
              revision. I am now preparing the temporary workspace for responsible
              public use, including usage controls and operational visibility.
            </p>
            <p className="mt-4 text-sm">Updated August 2026</p>
          </div>
          <div>
            {isWorkspaceAvailable ? (
              <>
                <p className="m-0 text-base leading-7 text-[var(--muted)]">
                  <TextLink
                    Link={components.Link}
                    href="/products/thoughtform/editor"
                  >
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
            <p
              className={`${isWorkspaceAvailable ? "mt-3" : "m-0"} text-base leading-7 text-[var(--muted)]`}
            >
              <TextLink
                Link={components.Link}
                href="/products/thoughtform/privacy"
              >
                Privacy information
              </TextLink>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
