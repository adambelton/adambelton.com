import { useNavigate, useParams } from "react-router";
import {
  ACCESS_LEVELS,
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { ProtectedRoute, useAuthSession } from "apps/client/src/auth";
import { NavigationLink } from "apps/client/src/ui/components/NavigationLink";
import { NotFoundPage } from "apps/client/src/website/pages/NotFoundPage";
import { Breadcrumbs } from "apps/client/src/ui/components/Breadcrumbs";
import { resolveProductRoute } from "apps/client/src/products/resolveProductRoute";
import { getProductBySlug } from "packages/products/src/registry";

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

  const metadata = getProductRouteMetadata(productSlug, productPath);

  if (route.requiredAccess === PRODUCT_ROUTE_ACCESSES.public) {
    return (
      <>
        {metadata}
        <Breadcrumbs items={route.breadcrumbs} />
        {route.element}
      </>
    );
  }

  return (
    <ProtectedRoute>
      {route.requiredAccess === PRODUCT_ROUTE_ACCESSES.owner &&
      !session.data?.user.isOwner ? (
        <NotFoundPage />
      ) : (
        <>
          {metadata}
          <Breadcrumbs items={route.breadcrumbs} />
          {route.element}
        </>
      )}
    </ProtectedRoute>
  );
}

function getProductRouteMetadata(productSlug: string, productPath: string) {
  const product = getProductBySlug(productSlug);

  if (!product) {
    return null;
  }

  if (productPath === "") {
    return (
      <>
        <title>{`${product.name} — Adam Belton`}</title>
        <meta content={product.description} name="description" />
      </>
    );
  }

  if (productPath === "privacy") {
    return (
      <>
        <title>{`${product.name} privacy — Adam Belton`}</title>
        <meta
          content={`How ${product.name} processes product information and the choices available to you.`}
          name="description"
        />
      </>
    );
  }

  return (
    <>
      <title>{`${product.name} workspace — Adam Belton`}</title>
      <meta content="noindex" name="robots" />
    </>
  );
}
