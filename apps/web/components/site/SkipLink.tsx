export function SkipLink() {
  return (
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-50 focus:border focus:border-[var(--accent)] focus:bg-[var(--background)] focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[var(--foreground)] focus:shadow-lg"
      href="#main-content"
    >
      Skip to main content
    </a>
  );
}
