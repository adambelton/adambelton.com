import { Breadcrumbs, TextLink } from "apps/client/src/ui/components";
import { aboutPageContent } from "apps/client/src/website/content/content";
import { RenderedMarkdown } from "apps/client/src/website/content/RenderedMarkdown";

export function AboutPage() {
  return (
    <>
      <section aria-labelledby="about-title">
        <Breadcrumbs items={[{ label: "About" }]} />
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="about-title"
        >
          {aboutPageContent.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--muted)]">
          {aboutPageContent.description}
        </p>
        <div className="mt-8">
          <RenderedMarkdown html={aboutPageContent.bodyHtml} />
        </div>
      </section>

      <section aria-labelledby="contact-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="contact-title"
        >
          Contact
        </h2>
        <p className="m-0 max-w-2xl border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
          <TextLink href="mailto:hello@adambelton.com">Email Adam</TextLink>
        </p>
      </section>
    </>
  );
}
