import { getProductBySlug, PRODUCT_IDS } from "packages/shared/src";
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
    return { status: "not_found" };
  }

  const segments = path.split("/").filter(Boolean);

  if (product.id === PRODUCT_IDS.socraticDraft) {
    return renderSocraticDraftRoute({ segments });
  }

  return { status: "not_found" };
}
