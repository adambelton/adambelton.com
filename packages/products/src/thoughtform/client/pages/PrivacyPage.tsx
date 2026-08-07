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
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="thoughtform-privacy-title"
      >
        How this product handles your thinking
      </h1>
      <div className="mt-8 max-w-3xl text-lg leading-8 text-[var(--muted)] [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[var(--foreground)] [&_li]:mb-2 [&_p]:my-4 [&_ul]:my-5 [&_ul]:pl-6">
        <p>
          This page describes ThoughtForm as implemented on 7 August
          2026. Read it before using the editor alongside the site-wide{" "}
          <TextLink href="/privacy" Link={Link}>
            privacy information
          </TextLink>
          .
        </p>

        <h2>Conversation processing</h2>
        <p>
          Messages submitted in the editor are sent through the site&apos;s application
          server to the currently configured supported AI provider to generate the
          assistant&apos;s reply. Changing models within that provider does not change
          this processing relationship.
        </p>
        <AiProcessingDisclosureLoader Link={Link} />

        <h2>Temporary workspace</h2>
        <p>
          An authenticated user with access to the editor can use one current
          temporary workspace. Its
          conversation, Idea Map, and Draft state are held in application memory,
          are not written to the site&apos;s database, and expire 24 hours after
          creation. Continuing the work does not extend that deadline.
        </p>
        <p>
          The workspace can be restored after a reload or navigation while
          that application memory remains available. A restart, deployment, or
          request to another application instance may remove it sooner. You can
          clear it immediately in the editor to delete it from application memory
          and start over.
        </p>

        <h2>Saved owner conversations</h2>
        <p>
          The site owner&apos;s conversations may be stored in the Neon-hosted
          database so they can be reopened and continued. They do not currently
          have an automatic expiry and remain private working material unless the
          owner separately publishes material outside this product.
        </p>

        <h2>What not to submit</h2>
        <p>
          This is a portfolio demo, not a confidential professional, medical,
          legal, or therapeutic service. Do not include unnecessary identifying,
          confidential, or highly sensitive information about yourself or anyone
          else. Application code does not intentionally log conversation message
          bodies or generated Drafts.
        </p>
        <p>
          The assistant cannot diagnose, provide therapy, respond as a crisis
          service, or replace professional support. If you may be in immediate
          danger, contact local emergency or crisis support and a person you trust.
        </p>

        <h2>Your choices</h2>
        <p>
          You can leave without opening the editor, clear the temporary workspace
          from inside it, or stop using ThoughtForm. Privacy and deletion requests
          are handled through the contact route on the site-wide{" "}
          <TextLink href="/privacy" Link={Link}>
            privacy page
          </TextLink>
          .
        </p>
      </div>
    </article>
  );
}
