import { TextLink } from "packages/products/src/thoughtform/client/ui/TextLink";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";
import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";

type OverviewPageProps = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
};

export function OverviewPage({ accessLevel, components }: OverviewPageProps) {
  const isWorkspaceAvailable = components.isTemporaryWorkspaceAvailable;

  return (
    <div className="grid gap-14 sm:gap-20">
      <section aria-labelledby="product-title">
        <h1
          className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
          id="product-title"
        >
          ThoughtForm
        </h1>
        <p className="mt-6 max-w-3xl text-xl font-semibold leading-8">
          AI-assisted cathartic journaling for talking through what is on your
          mind.
        </p>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
          ThoughtForm is a conversational thinking workspace where an AI
          assistant helps you explore, organise and articulate what you think or
          feel. Instead of giving you a blank page or rushing to an answer, it
          helps you inspect what is going on, organise what emerges, and bring
          that understanding together into a coherent expression.
        </p>
        {isWorkspaceAvailable ? (
          <div className="mt-8">
            <TextLink
              Link={components.Link}
              href="/products/thoughtform/editor"
              className="text-base font-semibold"
            >
              Try the demo →
            </TextLink>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="useful-title">
        <h2
          className="eyebrow mb-5"
          id="useful-title"
        >
          When it helps
        </h2>
        <div className="grid max-w-3xl gap-4 border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
          <p className="m-0">
            ThoughtForm is useful when something is bothering you, but you
            cannot quite put your finger on why.
          </p>
          <p className="m-0">
            That might be an experience you are still processing, a difficult
            decision, a reaction you do not fully understand, or an idea you
            have not yet formed a clear position on.
          </p>
          <p className="m-0">
            The goal is not to tell you what to think or how to feel. It is to
            help you slow the situation down, examine it from different angles,
            and develop a clearer picture for yourself.
          </p>
        </div>
      </section>

      <section aria-labelledby="works-title">
        <h2
          className="eyebrow mb-5"
          id="works-title"
        >
          How it works
        </h2>
        <ol className="m-0 grid max-w-4xl list-none gap-6 border-t border-[var(--line)] p-0 pt-5 sm:grid-cols-3">
          <li>
            <p className="m-0 text-xl font-semibold">Explore</p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">
              Talk through what is on your mind. The assistant uses focused
              questions, examples, clarification, challenge and alternative
              perspectives to help you examine what is there without deciding
              the answer for you.
            </p>
          </li>
          <li>
            <p className="m-0 text-xl font-semibold">Inspect</p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">
              As the conversation develops, ThoughtForm helps you build an
              evolving Idea Map of the thoughts, feelings, tensions and questions
              that emerge. You can inspect it, correct it, dismiss what does not
              fit, and choose what deserves more attention.
            </p>
          </li>
          <li>
            <p className="m-0 text-xl font-semibold">Articulate</p>
            <p className="mt-2 text-base leading-7 text-[var(--muted)]">
              ThoughtForm brings that developing understanding together into a
              coherent first-person expression. You can read it back, correct
              it and continue exploring until it accurately reflects where you
              stand.
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="agency-title">
        <h2
          className="eyebrow mb-5"
          id="agency-title"
        >
          Designed around your agency
        </h2>
        <div className="grid max-w-3xl gap-4 border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
          <p className="m-0">
            ThoughtForm is built around the idea that reflective technology
            should make you more capable, not replace your judgement.
          </p>
          <p className="m-0">
            The assistant can question, reflect, organise and suggest. You remain
            the authority on what you think, how you feel, and what an experience
            means to you.
          </p>
          <p className="m-0">
            ThoughtForm is intended to support reflection and wellbeing. It is
            not a therapist, diagnostic tool or substitute for professional
            support.
          </p>
        </div>
      </section>

      <section aria-labelledby="development-title">
        <h2
          className="eyebrow mb-5"
          id="development-title"
        >
          Development snapshot
        </h2>
        <div className="grid max-w-4xl gap-6 border-t border-[var(--line)] pt-5 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="text-base leading-7 text-[var(--muted)]">
            <p className="m-0">
              The product demo includes the complete reflective loop: streamed
              conversation, a user-correctable Idea Map, articulation and revision.
            </p>
            <p className="mt-4">
              It runs in a private, temporary workspace with authentication,
              24-hour expiry, usage controls, privacy and safety safeguards,
              and owner-only operational monitoring.
            </p>
            <p className="mt-4 text-sm">Updated August 2026</p>
          </div>
          <div>
            {isWorkspaceAvailable && (
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
                  <>
                    <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                      <TextLink Link={components.Link} href="/products/thoughtform/conversations">
                        Saved conversations
                      </TextLink>
                    </p>
                    {components.ownerOperationsHref && (
                      <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                        <TextLink Link={components.Link} href={components.ownerOperationsHref}>
                          Operations
                        </TextLink>
                      </p>
                    )}
                  </>
                ) : null}
              </>
            )}
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

      <section aria-labelledby="model-title">
        <h2 className="eyebrow mb-5" id="model-title">
          A possible open model
        </h2>
        <div className="grid max-w-3xl gap-4 border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
          <p className="m-0">ThoughtForm is currently a portfolio project and product experiment rather than a commercial service.</p>
          <p className="m-0">If I chose to commercialise it, I would want the business model to reinforce the same principle as the product: help people become more capable without making them dependent on the platform.</p>
          <p className="m-0">The model I am exploring would make the core project open source, allowing developers to inspect, fork and self-host it with their own model credentials. I would also make the underlying conversational approach available as a prompt for people who prefer to use an AI assistant they already have.</p>
          <p className="m-0">A hosted ThoughtForm service would then have to earn its value through the quality of the complete experience: the Idea Map, refined assistant behaviour, privacy and safety safeguards, continuity, and the care put into the interaction itself.</p>
          <p className="m-0">Rather than requiring a subscription, I would favour non-expiring usage credit priced to support sustainable development.</p>
          <p className="m-0">This is not yet how ThoughtForm is operated. It is an example of how I would align the product&apos;s mission, distribution and business model if I decided to take it further.</p>
        </div>
      </section>
    </div>
  );
}
