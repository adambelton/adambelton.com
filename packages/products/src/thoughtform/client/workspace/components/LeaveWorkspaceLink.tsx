import type { ProductNavigationLink } from "packages/products/src/thoughtform/client/product-app-components";

export function LeaveWorkspaceLink({
  className = "",
  href,
  Link,
}: {
  className?: string;
  href: string;
  Link: ProductNavigationLink;
}) {
  return (
    <Link
      className={`inline-flex cursor-pointer items-center gap-2 underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--accent)] hover:no-underline ${className}`}
      href={href}
    >
      Leave workspace
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path
          d="M14 5h5v14h-5M10 8l4 4-4 4M14 12H3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    </Link>
  );
}
