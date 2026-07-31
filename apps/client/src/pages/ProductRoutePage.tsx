import { useParams } from "react-router";
import { PRODUCT_ROUTE_STATUSES } from "packages/shared/src";
import { useAuthSession } from "apps/client/src/auth";
import { NotFoundPage } from "apps/client/src/pages/NotFoundPage";
import { resolveProductRoute } from "apps/client/src/products";

export function ProductRoutePage() {
  const session = useAuthSession();
  const { productSlug = "", "*": productPath = "" } = useParams();
  const route = resolveProductRoute({
    path: productPath,
    productSlug,
  });

  if (route.status === PRODUCT_ROUTE_STATUSES.notFound) {
    return <NotFoundPage />;
  }

  if (route.requiredAccess === "owner" && !session.data?.user.isOwner) {
    return <NotFoundPage />;
  }

  return route.element;
}
