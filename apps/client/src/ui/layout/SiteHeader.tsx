import { useAuthSession } from "apps/client/src/auth";
import { TextLink } from "apps/client/src/ui/components";
import { useDevelopmentFeatureAccess } from "apps/client/src/platform/access/useDevelopmentFeatureAccess";

export function SiteHeader() {
  const session = useAuthSession();
  const hasDevelopmentFeatureAccess = useDevelopmentFeatureAccess();

  return (
    <header className="flex items-center justify-end gap-8 py-7 sm:py-9">
      <nav
        aria-label="Primary"
        className="flex items-center gap-5 text-sm text-[var(--muted)]"
      >
        <TextLink href="/">Home</TextLink>
        <TextLink href="/products">Products</TextLink>
        <TextLink href="/about">About</TextLink>
        {hasDevelopmentFeatureAccess
          ? session.data
            ? <TextLink href="/logout">Log out</TextLink>
            : <TextLink href="/login">Log in</TextLink>
          : null}
      </nav>
    </header>
  );
}
