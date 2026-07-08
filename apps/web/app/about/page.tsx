import { Prose } from "../../components/site/Prose";
import { TextLink } from "../../components/site/TextLink";

export default function AboutPage() {
  return (
    <main className="grid gap-14 pb-24 pt-14 sm:gap-20 sm:pb-32 sm:pt-20">
      <section aria-labelledby="about-title">
        <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
          About
        </p>
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="about-title"
        >
          Adam Belton
        </h1>
        <Prose className="mt-8">
          A personal site for writing, product experiments, and the slow work of
          making ideas clearer.
        </Prose>
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
    </main>
  );
}
