import { TextLink } from "apps/client/src/components";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-end gap-8 py-7 sm:py-9">
      <nav
        aria-label="Primary"
        className="flex items-center gap-5 text-sm text-[var(--muted)]"
      >
        <TextLink href="/">Home</TextLink>
        <TextLink href="/products">Products</TextLink>
        <TextLink href="/about">About</TextLink>
        <TextLink href="/login">Log in</TextLink>
      </nav>
    </header>
  );
}
