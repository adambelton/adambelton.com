import { useNavigate, useParams } from "react-router";
import {
  ACCESS_LEVELS,
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { ProtectedRoute, useAuthSession } from "apps/client/src/auth";
import { NavigationLink } from "apps/client/src/ui/components";
import { NotFoundPage } from "apps/client/src/website/pages/NotFoundPage";
import { Breadcrumbs } from "apps/client/src/ui/components";
import { resolveProductRoute } from "apps/client/src/products";

export function ProductRoutePage() {
  const session = useAuthSession();
  const navigate = useNavigate();
  const { productSlug = "", "*": productPath = "" } = useParams();
  const route = resolveProductRoute({
    accessLevel: session.data?.user.isOwner
      ? ACCESS_LEVELS.owner
      : ACCESS_LEVELS.demo,
    components: {
      Link: NavigationLink,
      navigate,
    },
    path: productPath,
    productSlug,
  });

  if (route.status === PRODUCT_ROUTE_STATUSES.notFound) {
    return <NotFoundPage />;
  }

  if (route.requiredAccess === PRODUCT_ROUTE_ACCESSES.public) {
    return <><Breadcrumbs items={route.breadcrumbs} />{route.element}</>;
  }

  return (
    <ProtectedRoute>
      {route.requiredAccess === PRODUCT_ROUTE_ACCESSES.owner &&
      !session.data?.user.isOwner ? (
        <NotFoundPage />
      ) : (
        <><Breadcrumbs items={route.breadcrumbs} />{route.element}</>
      )}
    </ProtectedRoute>
  );
}
