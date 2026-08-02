export const PRODUCT_IDS = {
  socraticDraft: "socratic-draft",
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

export const PRODUCT_STATUSES = {
  active: "active",
  archived: "archived",
  prototype: "prototype",
} as const;

export type ProductStatus =
  (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

export const PRODUCT_ROUTE_STATUSES = {
  found: "found",
  notFound: "not_found",
} as const;

export type ProductRouteStatus =
  (typeof PRODUCT_ROUTE_STATUSES)[keyof typeof PRODUCT_ROUTE_STATUSES];

export const PRODUCT_ROUTE_ACCESSES = {
  public: "public",
  authenticated: "authenticated",
  owner: "owner",
} as const;

export type ProductRouteAccess =
  (typeof PRODUCT_ROUTE_ACCESSES)[keyof typeof PRODUCT_ROUTE_ACCESSES];

export interface FoundProductRouteResult<RenderedRoute> {
  status: typeof PRODUCT_ROUTE_STATUSES.found;
  element: RenderedRoute;
  requiredAccess: ProductRouteAccess;
  breadcrumbs: readonly ProductRouteBreadcrumb[];
}

export interface ProductRouteBreadcrumb {
  label: string;
  href?: string;
}

export interface NotFoundProductRouteResult {
  status: typeof PRODUCT_ROUTE_STATUSES.notFound;
}

export type ProductRouteResult<RenderedRoute> =
  | FoundProductRouteResult<RenderedRoute>
  | NotFoundProductRouteResult;

export interface ProductDefinition {
  id: ProductId;
  name: string;
  slug: string;
  summary: string;
  description: string;
  status: ProductStatus;
  publicPath: string;
  demoPath?: string;
  privacyPath?: string;
  requiresAuth: boolean;
}
