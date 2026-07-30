import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type TextLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

export function TextLink({ children, href, className = "", ...props }: TextLinkProps) {
  const linkClassName = `underline decoration-[var(--line)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:no-underline ${className}`;

  if (href.startsWith("/")) {
    return (
      <Link className={linkClassName} href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a className={linkClassName} href={href} {...props}>
      {children}
    </a>
  );
}
