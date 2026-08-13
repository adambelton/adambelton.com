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
import { useThoughtFormRuntimeCapabilities } from "apps/client/src/products/thoughtform/useThoughtFormRuntimeCapabilities";
import { ProductRouteLoading } from "apps/client/src/products/ProductRouteLoading";
import type { ReactNode } from "react";

export function ProductRoutePage() {
  const session = useAuthSession();
  const { productSlug = "", "*": productPath = "" } = useParams();
  const thoughtFormCapabilities = useThoughtFormRuntimeCapabilities(
    productSlug === "thoughtform",
  );
  const isTemporaryWorkspaceAvailable =
    thoughtFormCapabilities.data?.temporaryWorkspaceAvailable ?? false;
  const navigate = useNavigate();
  const route = resolveProductRoute({
    accessLevel: session.data?.user.isOwner
      ? ACCESS_LEVELS.owner
      : ACCESS_LEVELS.demo,
    components: {
      Link: NavigationLink,
      navigate,
      isTemporaryWorkspaceAvailable:
        productSlug === "thoughtform" && isTemporaryWorkspaceAvailable,
      ownerOperationsHref: session.data?.user.isOwner
        ? "/products/thoughtform/operations"
        : undefined,
    },
    path: productPath,
    productSlug,
  });

  if (route.status === PRODUCT_ROUTE_STATUSES.notFound) {
    return <NotFoundPage />;
  }

  if (
    productSlug === "thoughtform" &&
    route.requiredAccess === PRODUCT_ROUTE_ACCESSES.authenticated &&
    thoughtFormCapabilities.isPending
  ) {
    return <ProductRouteLoading />;
  }

  const metadata = getProductRouteMetadata(productSlug, productPath);
  const showBreadcrumbs = !isThoughtFormEditorPath(productSlug, productPath);

  if (route.requiredAccess === PRODUCT_ROUTE_ACCESSES.public) {
    return (
      <>
        {metadata}
        <ProductRouteLayout breadcrumbs={showBreadcrumbs ? route.breadcrumbs : []}>
          {route.element}
        </ProductRouteLayout>
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
          <ProductRouteLayout breadcrumbs={showBreadcrumbs ? route.breadcrumbs : []}>
            {route.element}
          </ProductRouteLayout>
        </>
      )}
    </ProtectedRoute>
  );
}

function ProductRouteLayout({
  breadcrumbs,
  children,
}: {
  breadcrumbs: Parameters<typeof Breadcrumbs>[0]["items"];
  children: ReactNode;
}) {
  return (
    <div className={breadcrumbs.length > 0 ? undefined : "h-full min-h-0"}>
      {breadcrumbs.length > 0 ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className={breadcrumbs.length > 0 ? undefined : "h-full min-h-0"}>{children}</div>
    </div>
  );
}

function isThoughtFormEditorPath(productSlug: string, productPath: string) {
  return productSlug === "thoughtform" && (
    productPath === "editor" ||
    /^conversations\/[^/]+\/editor$/.test(productPath)
  );
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
