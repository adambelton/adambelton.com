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
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";
import { isDevelopmentFeatureEnabled } from "packages/shared/src";

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
      temporaryWorkspaceAvailable:
        Boolean(session.data?.user.isOwner) ||
        isNonOwnerTemporaryWorkspaceEnabled(productSlug, "editor"),
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
      {(route.requiredAccess === PRODUCT_ROUTE_ACCESSES.owner ||
        (route.requiredAccess === PRODUCT_ROUTE_ACCESSES.authenticated &&
          !isNonOwnerTemporaryWorkspaceEnabled(productSlug, productPath))) &&
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

function isNonOwnerTemporaryWorkspaceEnabled(
  productSlug: string,
  productPath: string,
) {
  return isDevelopmentFeatureEnabled(import.meta.env.DEV) &&
    productSlug === "thoughtform" &&
    productPath === "editor";
}

function getProductRouteMetadata(productSlug: string, productPath: string) {
  const product = getProductBySlug(productSlug);

  if (!product) {
    return null;
  }

  if (productPath === "") {
    return (
      <PublicPageMetadata
        description={product.description}
        path={`/products/${product.slug}`}
        title={`${product.name} — Adam Belton`}
      />
    );
  }

  if (productPath === "privacy") {
    return (
      <PublicPageMetadata
        description={`How ${product.name} processes product information and the choices available to you.`}
        path={`/products/${product.slug}/privacy`}
        title={`${product.name} privacy — Adam Belton`}
      />
    );
  }

  return (
    <>
      <title>{`${product.name} workspace — Adam Belton`}</title>
      <meta content="noindex" name="robots" />
    </>
  );
}
