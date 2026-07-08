import { TextLink } from "./TextLink";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] py-8 text-sm leading-6 text-[var(--muted)]">
      <p className="m-0">
        <TextLink href="mailto:adam.belton@proton.me">Email</TextLink>
      </p>
    </footer>
  );
}
