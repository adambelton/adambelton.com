import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

export type NavigationLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & {
  children: ReactNode;
  href: string;
};

export function NavigationLink({
  children,
  href,
  ...props
}: NavigationLinkProps) {
  if (href.startsWith("/")) {
    return (
      <Link to={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
