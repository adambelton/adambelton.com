import { TextLink } from "apps/client/src/ui/components";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] py-8 text-sm leading-6 text-[var(--muted)]">
      <nav aria-label="Footer">
        <ul className="m-0 flex list-none gap-5 p-0">
          <li>
            <TextLink href="mailto:hello@adambelton.com">Email</TextLink>
          </li>
          <li>
            <TextLink href="/privacy">Privacy</TextLink>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
