import { Breadcrumbs, Prose, TextLink } from "apps/client/src/ui/components";
import { products } from "packages/products/src/registry";

const productsWithPrivacyInformation = products.filter(
  (product) => product.privacyPath,
);

export function PrivacyPage() {
  return (
    <article aria-labelledby="privacy-title">
      <Breadcrumbs items={[{ label: "Privacy" }]} />
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="privacy-title"
      >
        How this site handles your data
      </h1>
      <Prose className="mt-8 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[var(--foreground)] [&_li]:mb-2 [&_p]:my-4 [&_ul]:my-5 [&_ul]:pl-6">
        <p>
          This page describes the site as implemented on 1 August 2026. It is a
          practical summary, not a promise that third-party services or their
          policies will never change.
        </p>

        <h2>Signing in</h2>
        <p>
          The site uses your email address to send a magic sign-in link through
          Resend. Authentication records and sessions are stored in the site&apos;s
          Neon-hosted database. They are retained while access is needed or until
          a verified deletion request can be completed, subject to necessary
          security or legal retention. The site does not currently apply an
          automatic deletion schedule to authentication records.
        </p>

        <h2>Product-specific privacy information</h2>
        <p>
          Individual product demos may process information differently or use
          additional service providers. A product privacy page may therefore
          exist alongside this site-wide information.
        </p>
        <p>
          Review the applicable product privacy page before using any individual
          product demo. It explains what that product processes, why it is
          processed, where it is sent, how long it is retained, and the choices
          available to you.
        </p>
        {productsWithPrivacyInformation.length > 0 ? (
          <ul>
            {productsWithPrivacyInformation.map((product) => (
              <li key={product.id}>
                <TextLink href={product.privacyPath ?? product.publicPath}>
                  {product.name} privacy information
                </TextLink>
              </li>
            ))}
          </ul>
        ) : null}

        <h2>Services involved</h2>
        <p>
          The shared platform providers checked on 1 August 2026 are linked
          below. Product privacy pages identify any providers involved in a
          particular demo. Check providers directly for their current policies,
          subprocessors, retention practices, and data locations:
        </p>
        <ul>
          <li>
            <TextLink href="https://resend.com/legal/privacy-policy">
              Resend privacy policy
            </TextLink>
          </li>
          <li>
            <TextLink href="https://neon.com/privacy-policy">
              Neon/Databricks privacy notice
            </TextLink>
          </li>
        </ul>

        <h2>Your choices and contact</h2>
        <p>
          You can choose not to sign in or use a product demo. Product pages
          describe any additional controls available within that product. For
          questions or a request to access or delete data held by this site,
          email{" "}
          <TextLink href="mailto:hello@adambelton.com">
            hello@adambelton.com
          </TextLink>
          . A request may require identity verification.
        </p>
      </Prose>
    </article>
  );
}
