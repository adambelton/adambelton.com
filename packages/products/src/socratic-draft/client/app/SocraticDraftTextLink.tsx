import type {
  ProductNavigationLink,
  ProductNavigationLinkProps,
} from "packages/products/src/socratic-draft/client/app/product-app-components";

type SocraticDraftTextLinkProps = ProductNavigationLinkProps & {
  Link: ProductNavigationLink;
};

export function SocraticDraftTextLink({
  Link,
  className = "",
  ...props
}: SocraticDraftTextLinkProps) {
  const linkClassName = `underline decoration-[var(--line)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:no-underline ${className}`;

  return <Link className={linkClassName} {...props} />;
}
