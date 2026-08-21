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
import { resolveProductRoute } from "apps/client/src/products/routing/resolveProductRoute";
import { getProductBySlug } from "packages/products/src/registry";
import { PublicPageMetadata } from "apps/client/src/website/metadata/PublicPageMetadata";
import {
  shouldLoadThoughtFormRuntimeCapabilities,
  useThoughtFormRuntimeCapabilities,
} from "apps/client/src/products/thoughtform/useThoughtFormRuntimeCapabilities";
import { ProductRouteLoading } from "apps/client/src/products/components/ProductRouteLoading";
import { getProductOverviewBySlug } from "apps/client/src/products/catalogue/product-overview-catalogue";
import type { ReactNode } from "react";

export function ProductRoutePage() {
  const session = useAuthSession();
  const { productSlug = "", "*": productPath = "" } = useParams();
  const thoughtFormCapabilities = useThoughtFormRuntimeCapabilities(
    shouldLoadThoughtFormRuntimeCapabilities({ productPath, productSlug }),
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
  const productOverview = getProductOverviewBySlug(productSlug);

  if (!productOverview) {
    return null;
  }

  if (productPath === "") {
    return (
      <PublicPageMetadata
        description={productOverview.description}
        path={productOverview.publicPath}
        title={`${productOverview.name} — Adam Belton`}
      />
    );
  }

  if (productPath === "privacy") {
    const hostedProduct = getProductBySlug(productSlug);

    if (!hostedProduct) {
      return null;
    }

    return (
      <PublicPageMetadata
        description={`How ${hostedProduct.name} processes product information and the choices available to you.`}
        path={`/products/${hostedProduct.slug}/privacy`}
        title={`${hostedProduct.name} privacy — Adam Belton`}
      />
    );
  }

  return (
    <>
      <title>{`${productOverview.name} workspace — Adam Belton`}</title>
      <meta content="noindex" name="robots" />
    </>
  );
}
