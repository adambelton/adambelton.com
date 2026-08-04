import {
  PRODUCT_IDS,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { getProductBySlug } from "packages/products/src/registry";
import { renderProductRoute as renderThoughtFormRoute } from "packages/products/src/thoughtform/client";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client";
import type { AccessLevel } from "packages/shared/src";

type ResolveProductRouteInput = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
  path: string;
  productSlug: string;
};

export type ResolvedProductRoute = ReturnType<typeof renderThoughtFormRoute>;

export function resolveProductRoute({
  accessLevel,
  components,
  path,
  productSlug,
}: ResolveProductRouteInput): ResolvedProductRoute {
  const product = getProductBySlug(productSlug);

  if (!product) {
    return { status: PRODUCT_ROUTE_STATUSES.notFound };
  }

  const segments = path.split("/").filter(Boolean);

  if (product.id === PRODUCT_IDS.thoughtForm) {
    return renderThoughtFormRoute({ accessLevel, components, segments });
  }

  return { status: PRODUCT_ROUTE_STATUSES.notFound };
}
