import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="flex items-center justify-end gap-8 py-7 sm:py-9">
      <nav
        aria-label="Primary"
        className="flex items-center gap-5 text-sm text-[var(--muted)]"
      >
        <Link className="transition-colors hover:text-[var(--foreground)]" href="/">
          Home
        </Link>
        <Link
          className="transition-colors hover:text-[var(--foreground)]"
          href="/products"
        >
          Products
        </Link>
        <Link
          className="transition-colors hover:text-[var(--foreground)]"
          href="/about"
        >
          About
        </Link>
      </nav>
    </header>
  );
}
