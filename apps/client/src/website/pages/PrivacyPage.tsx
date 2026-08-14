import type { ReactNode } from "react";
import { Breadcrumbs, TextLink } from "apps/client/src/ui/components";
import { products } from "packages/products/src/registry";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";

const productsWithPrivacyInformation = products.filter(
  (product) => product.privacyPath,
);

export function PrivacyPage() {
  return (
    <article aria-labelledby="privacy-title">
      <PublicPageMetadata
        description="How AdamBelton.com handles sign-in, product, and service-provider data."
        path="/privacy"
        title="Privacy — Adam Belton"
      />
      <Breadcrumbs items={[{ label: "Privacy" }]} />
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
        id="privacy-title"
      >
        How this site handles your data
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
        This page describes the site as implemented on 1 August 2026. It is a
        practical summary, not a promise that third-party services or their
        policies will never change.
      </p>

      <div className="mt-12 grid gap-14 sm:mt-16 sm:gap-20">
        <PrivacySection id="signing-in-title" title="Signing in">
          <p className="m-0">
            The site uses your email address to send a magic sign-in link through
            Resend. Authentication records and sessions are stored in the site&apos;s
            Neon-hosted database. They are retained while access is needed or until
            a verified deletion request can be completed, subject to necessary
            security or legal retention. The site does not currently apply an
            automatic deletion schedule to authentication records.
          </p>
        </PrivacySection>

        <PrivacySection
          id="product-privacy-title"
          title="Product-specific privacy information"
        >
          <p className="m-0">
            Individual product demos may process information differently or use
            additional service providers. A product privacy page may therefore
            exist alongside this site-wide information.
          </p>
          <p className="m-0">
            Review the applicable product privacy page before using any individual
            product demo. It explains what that product processes, why it is
            processed, where it is sent, how long it is retained, and the choices
            available to you.
          </p>
          {productsWithPrivacyInformation.length > 0 ? (
            <ul className="m-0 pl-6 [&>li+li]:mt-1">
              {productsWithPrivacyInformation.map((product) => (
                <li key={product.id}>
                  <TextLink href={product.privacyPath ?? product.publicPath}>
                    {product.name} privacy information
                  </TextLink>
                </li>
              ))}
            </ul>
          ) : null}
        </PrivacySection>

        <PrivacySection id="services-title" title="Services involved">
          <p className="m-0">
            The shared platform providers checked on 1 August 2026 are linked
            below. Product privacy pages identify any providers involved in a
            particular demo. Check providers directly for their current policies,
            subprocessors, retention practices, and data locations:
          </p>
          <ul className="m-0 pl-6 [&>li+li]:mt-1">
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
        </PrivacySection>

        <PrivacySection id="choices-title" title="Your choices and contact">
          <p className="m-0">
            You can choose not to sign in or use a product demo. Product pages
            describe any additional controls available within that product. For
            questions or a request to access or delete data held by this site, use
            the contact details on the{" "}
            <TextLink href="/about#contact">About page</TextLink>. A request may
            require identity verification.
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
