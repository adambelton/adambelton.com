import type { ReactNode } from "react";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";
import { TextLink } from "packages/products/src/thoughtform/client/ui/TextLink";
import { AiProcessingDisclosureLoader } from "packages/products/src/thoughtform/client/workspace/components/AiProcessingDisclosureLoader";

type PrivacyPageProps = {
  components: ProductAppComponents;
};

export function PrivacyPage({
  components: { Link },
}: PrivacyPageProps) {
  return (
    <article aria-labelledby="thoughtform-privacy-title">
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
        id="thoughtform-privacy-title"
      >
        How this product handles your thinking
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        This page describes ThoughtForm as implemented on 7 August 2026. Read it
        before using the editor alongside the site-wide{" "}
        <TextLink href="/privacy" Link={Link}>
          privacy information
        </TextLink>
        .
      </p>

      <div className="mt-12 grid gap-14 sm:mt-16 sm:gap-20">
        <PrivacySection id="conversation-processing-title" title="Conversation processing">
          <p className="m-0">
            Messages submitted in the editor are sent through the site&apos;s
            application server to the currently configured supported AI provider
            to generate the assistant&apos;s reply. Changing models within that
            provider does not change this processing relationship.
          </p>
          <AiProcessingDisclosureLoader Link={Link} />
        </PrivacySection>

        <PrivacySection id="temporary-workspace-title" title="Temporary workspace">
          <p className="m-0">
            An authenticated user with access to the editor can use one current
            temporary workspace. Its conversation, Idea Map, and Draft state are
            held in application memory, are not written to the site&apos;s database,
            and expire 24 hours after creation. Continuing the work does not extend
            that deadline.
          </p>
          <p className="m-0">
            The workspace can be restored after a reload or navigation while that
            application memory remains available. A restart, deployment, or request
            to another application instance may remove it sooner. You can clear it
            immediately in the editor to delete it from application memory and start
            over.
          </p>
        </PrivacySection>

        <PrivacySection
          id="saved-conversations-title"
          title="Saved owner conversations"
        >
          <p className="m-0">
            The site owner&apos;s conversations may be stored in the Neon-hosted
            database so they can be reopened and continued. They do not currently
            have an automatic expiry and remain private working material unless the
            owner separately publishes material outside this product.
          </p>
        </PrivacySection>

        <PrivacySection id="appropriate-use-title" title="What not to submit">
          <p className="m-0">
            This is a portfolio demo, not a confidential professional, medical,
            legal, or therapeutic service. Do not include unnecessary identifying,
            confidential, or highly sensitive information about yourself or anyone
            else. Application code does not intentionally log conversation message
            bodies or generated Drafts.
          </p>
          <p className="m-0">
            The assistant cannot diagnose, provide therapy, respond as a crisis
            service, or replace professional support. If you may be in immediate
            danger, contact local emergency or crisis support and a person you trust.
          </p>
        </PrivacySection>

        <PrivacySection id="choices-title" title="Your choices">
          <p className="m-0">
            You can leave without opening the editor, clear the temporary workspace
            from inside it, or stop using ThoughtForm. Privacy and deletion requests
            are handled through the contact route on the site-wide{" "}
            <TextLink href="/privacy" Link={Link}>
              privacy page
            </TextLink>
            .
          </p>
        </PrivacySection>
      </div>
    </article>
  );
}

function PrivacySection({
  children,
  id,
  title,
}: {
  children: ReactNode;
  id: string;
  title: string;
}) {
  return (
    <section aria-labelledby={id}>
      <h2 className="eyebrow mb-5" id={id}>
        {title}
      </h2>
      <div className="grid max-w-2xl gap-4 border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}
