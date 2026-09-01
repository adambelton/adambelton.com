import { Breadcrumbs, Prose, TextLink } from "apps/client/src/ui/components";
import {
  aboutPageContent,
  capabilityProfileContent,
} from "apps/client/src/website/content/content";
import type { SanitizedHtml } from "apps/client/src/website/content/content-types";
import { RenderedMarkdown } from "apps/client/src/website/content/RenderedMarkdown";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";
import { CapabilityProfile } from "apps/client/src/website/capability-profile/CapabilityProfile";

export function AboutPage() {
  const firstParagraphEnd = aboutPageContent.bodyHtml.indexOf("</p>") + 4;
  const professionalIntro = aboutPageContent.bodyHtml.slice(
    0,
    firstParagraphEnd,
  ) as SanitizedHtml;
  const personalIntro = aboutPageContent.bodyHtml.slice(
    firstParagraphEnd,
  ) as SanitizedHtml;

  return (
    <>
      <PublicPageMetadata
        description={aboutPageContent.description}
        path="/about"
        title="About — Adam Belton"
      />
      <section aria-labelledby="about-title" className="min-w-0">
        <Breadcrumbs items={[{ label: "About" }]} />
        <h1
          className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
          id="about-title"
        >
          {aboutPageContent.title}
        </h1>
        <Prose className="mt-6">
          {aboutPageContent.description}
        </Prose>
        <div className="mt-8 flow-root max-w-2xl">
          <div className="mx-auto mb-7 w-full max-w-56 sm:float-right sm:mb-4 sm:ml-4 sm:max-w-[13rem] sm:mr-6">
            <img
              alt="Illustrated portrait of Adam Belton"
              className="w-full rounded-sm"
              decoding="async"
              height={800}
              src="/images/about/about-portrait-800.webp"
              width={800}
            />
          </div>
          <RenderedMarkdown html={professionalIntro} />
        </div>
        <div className="mt-4 max-w-2xl">
          <RenderedMarkdown html={personalIntro} />
        </div>
        <div className="mt-14 sm:mt-16">
          <CapabilityProfile profile={capabilityProfileContent} />
        </div>
      </section>

      <section aria-labelledby="contact-title" id="contact">
        <h2
          className="eyebrow mb-5"
          id="contact-title"
        >
          Contact
        </h2>
        <ul className="m-0 flex max-w-2xl list-none flex-wrap gap-x-5 gap-y-3 border-t border-[var(--line)] p-0 pt-5 text-base leading-7 text-[var(--muted)]">
          <li>
            <TextLink href="mailto:hello@adambelton.com">Email</TextLink>
          </li>
          <li>
            <TextLink href="https://www.linkedin.com/in/adam-b-7505693ab">
              LinkedIn
            </TextLink>
          </li>
          <li>
            <TextLink href="https://github.com/adambelton">GitHub</TextLink>
          </li>
        </ul>
      </section>
    </>
  );
}
