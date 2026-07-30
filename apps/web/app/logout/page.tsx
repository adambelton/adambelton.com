import { LogoutEffect } from "apps/web/app/logout/LogoutEffect";
import { TextLink } from "apps/web/components/site/TextLink";

export default function LogoutPage() {
  return (
    <section aria-labelledby="logout-title">
      <LogoutEffect />
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        Account
      </p>
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="logout-title"
      >
        Logging out.
      </h1>
      <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)]">
        You will be returned to the writing collection.
      </p>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
        If nothing changes, go back to <TextLink href="/">the homepage</TextLink>.
      </p>
    </section>
  );
}
