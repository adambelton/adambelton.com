import { NavigationLink } from "apps/client/src/navigation";
import type { NavigationLinkProps } from "apps/client/src/navigation";

export function TextLink({
  children,
  className = "",
  href,
  ...props
}: NavigationLinkProps) {
  const linkClassName = `underline decoration-[var(--line)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:no-underline ${className}`;

  return (
    <NavigationLink className={linkClassName} href={href} {...props}>
      {children}
    </NavigationLink>
  );
}
