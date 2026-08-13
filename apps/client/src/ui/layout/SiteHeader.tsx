import { useAuthSession } from "apps/client/src/auth";
import { TextLink } from "apps/client/src/ui/components";
import { useIsDevelopmentFeatureEnabled } from "apps/client/src/platform/access/useIsDevelopmentFeatureEnabled";

export function SiteHeader() {
  const session = useAuthSession();
  const isDevelopmentFeatureEnabled = useIsDevelopmentFeatureEnabled();
  let accountLink = null;
  if (isDevelopmentFeatureEnabled) {
    accountLink = session.data
      ? <TextLink href="/logout">Log out</TextLink>
      : <TextLink href="/login">Log in</TextLink>;
  }

  return (
    <header className="flex items-center justify-end gap-8 py-7 sm:py-9">
      <nav
        aria-label="Primary"
        className="flex items-center gap-5 text-sm text-[var(--muted)]"
      >
        <TextLink href="/">Home</TextLink>
        <TextLink href="/products">Products</TextLink>
        <TextLink href="/about">About</TextLink>
        {accountLink ? <span className="ml-3">{accountLink}</span> : null}
      </nav>
    </header>
  );
}
