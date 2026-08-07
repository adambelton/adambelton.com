import type { ComponentType, ReactNode } from "react";

export type ProductNavigationLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
};

export type ProductNavigationLink = ComponentType<ProductNavigationLinkProps>;

export type ProductAppComponents = {
  Link: ProductNavigationLink;
  navigate: (href: string) => void;
  isTemporaryWorkspaceAvailable?: boolean;
};
