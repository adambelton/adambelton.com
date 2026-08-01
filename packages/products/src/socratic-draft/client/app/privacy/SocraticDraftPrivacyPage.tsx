import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";
import { SocraticDraftTextLink } from "packages/products/src/socratic-draft/client/app/SocraticDraftTextLink";

type SocraticDraftPrivacyPageProps = {
  components: ProductAppComponents;
};

export function SocraticDraftPrivacyPage({
  components: { Link },
}: SocraticDraftPrivacyPageProps) {
  return (
    <article aria-labelledby="socratic-draft-privacy-title">
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        The Socratic Draft · Privacy
      </p>
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="socratic-draft-privacy-title"
      >
        How this product handles your writing
      </h1>
      <div className="mt-8 max-w-3xl text-lg leading-8 text-[var(--muted)] [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[var(--foreground)] [&_li]:mb-2 [&_p]:my-4 [&_ul]:my-5 [&_ul]:pl-6">
        <p>
          This page describes The Socratic Draft as implemented on 1 August
          2026. Read it before using the editor alongside the site-wide{" "}
          <SocraticDraftTextLink href="/privacy" Link={Link}>
            privacy information
          </SocraticDraftTextLink>
          .
        </p>

        <h2>Conversation processing</h2>
        <p>
          Writing submitted in the editor is sent through the site&apos;s application
          server to the OpenAI Responses API. It is used to generate the
          assistant&apos;s reply.
        </p>
        <p>
          Requests explicitly disable optional Responses API application-state
          storage with <code>store: false</code>. OpenAI&apos;s current documentation
          says API content is not used to train models unless the API customer
          opts in, but abuse-monitoring logs may contain prompts and responses and
          are ordinarily retained for up to 30 days. Legal or safety needs can
          require longer retention. This site does not claim enterprise Zero Data
          Retention.
        </p>

        <h2>Temporary demo conversations</h2>
        <p>
          A signed-in non-owner has at most one temporary conversation. It is held
          in application memory, is not written to the site&apos;s database, and
          expires 24 hours after creation. Continuing the conversation does not
          extend that deadline.
        </p>
        <p>
          The conversation can be restored after a reload or navigation while
          that application memory remains available. A restart, deployment, or
          request to another application instance may remove it sooner. You can
          clear it immediately in the editor to delete it from application memory
          and start over.
        </p>

        <h2>Owner conversations</h2>
        <p>
          The site owner&apos;s conversations may be stored in the Neon-hosted
          database so they can be reopened and continued. They do not currently
          have an automatic expiry and remain private working material unless the
          owner separately publishes writing.
        </p>

        <h2>What not to submit</h2>
        <p>
          This is a portfolio demo, not a confidential professional, medical,
          legal, or therapeutic service. Do not include unnecessary identifying,
          confidential, or highly sensitive information about yourself or anyone
          else. Application code does not intentionally log conversation message
          bodies or generated writing.
        </p>

        <h2>Provider information</h2>
        <p>
          These provider pages were checked on 1 August 2026. Their policies,
          subprocessors, retention practices, and data locations may change, so
          verify the current information directly:
        </p>
        <ul>
          <li>
            <SocraticDraftTextLink
              href="https://platform.openai.com/docs/models/default-usage-policies-by-endpoint"
              Link={Link}
            >
              OpenAI API data controls
            </SocraticDraftTextLink>
          </li>
          <li>
            <SocraticDraftTextLink
              href="https://openai.com/policies/how-your-data-is-used-to-improve-model-performance/"
              Link={Link}
            >
              OpenAI data use information
            </SocraticDraftTextLink>
          </li>
        </ul>

        <h2>Your choices</h2>
        <p>
          You can leave without opening the editor, clear a temporary conversation
          from inside it, or stop using the demo. Privacy and deletion requests
          are handled through the contact route on the site-wide{" "}
          <SocraticDraftTextLink href="/privacy" Link={Link}>
            privacy page
          </SocraticDraftTextLink>
          .
        </p>
      </div>
    </article>
  );
}
