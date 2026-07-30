import { headers } from "next/headers";
import { getCurrentAuthSession } from "packages/auth/src/session";
import { TextLink } from "apps/web/components/site/TextLink";

export async function SiteHeader() {
  const session = await getCurrentAuthSession(await headers());

  return (
    <header className="flex items-center justify-end gap-8 py-7 sm:py-9">
      <nav
        aria-label="Primary"
        className="flex items-center gap-5 text-sm text-[var(--muted)]"
      >
        <TextLink href="/">
          Home
        </TextLink>
        <TextLink href="/products">
          Products
        </TextLink>
        <TextLink href="/about">
          About
        </TextLink>
        <TextLink href={session ? "/logout" : "/login"}>
          {session ? "Log out" : "Log in"}
        </TextLink>
      </nav>
    </header>
  );
}
