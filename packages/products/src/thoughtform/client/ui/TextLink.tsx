import type {
  ProductNavigationLink,
  ProductNavigationLinkProps,
} from "packages/products/src/thoughtform/client/product-app-components";

type TextLinkProps = ProductNavigationLinkProps & {
  Link: ProductNavigationLink;
};

export function TextLink({
  Link,
  className = "",
  ...props
}: TextLinkProps) {
  const linkClassName = `underline decoration-[var(--line)] decoration-1 underline-offset-4 transition-colors hover:text-[var(--foreground)] hover:no-underline ${className}`;

  return <Link className={linkClassName} {...props} />;
}
