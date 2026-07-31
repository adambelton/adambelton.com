import {
  getProductBySlug,
  PRODUCT_IDS,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { renderSocraticDraftRoute } from "packages/products/src/socratic-draft/client";

type ResolveProductRouteInput = {
  path: string;
  productSlug: string;
};

export type ResolvedProductRoute = ReturnType<typeof renderSocraticDraftRoute>;

export function resolveProductRoute({
  path,
  productSlug,
}: ResolveProductRouteInput): ResolvedProductRoute {
  const product = getProductBySlug(productSlug);

  if (!product) {
    return { status: PRODUCT_ROUTE_STATUSES.notFound };
  }

  const segments = path.split("/").filter(Boolean);

  if (product.id === PRODUCT_IDS.socraticDraft) {
    return renderSocraticDraftRoute({ segments });
  }

  return { status: PRODUCT_ROUTE_STATUSES.notFound };
}
