import { useAuthSession } from "apps/client/src/auth";
import { TextLink } from "apps/client/src/components";

export function SiteHeader() {
  const session = useAuthSession();

  return (
    <header className="flex items-center justify-end gap-8 py-7 sm:py-9">
      <nav
        aria-label="Primary"
        className="flex items-center gap-5 text-sm text-[var(--muted)]"
      >
        <TextLink href="/">Home</TextLink>
        <TextLink href="/products">Products</TextLink>
        <TextLink href="/about">About</TextLink>
        <TextLink href={session.data ? "/logout" : "/login"}>
          {session.data ? "Log out" : "Log in"}
        </TextLink>
      </nav>
    </header>
  );
}
