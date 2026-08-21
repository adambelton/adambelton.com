import {
  PRODUCT_IDS,
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
} from "packages/shared/src";
import { getProductBySlug } from "packages/products/src/registry";
import { renderProductRoute as renderThoughtFormRoute } from "packages/products/src/thoughtform/client";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client";
import type { AccessLevel } from "packages/shared/src";
import { CareCalendarOverviewPage } from "apps/client/src/products/pages/CareCalendarOverviewPage";
import { TheBlackoutOverviewPage } from "apps/client/src/products/pages/TheBlackoutOverviewPage";
import { ThoughtFormOverviewPage } from "apps/client/src/products/pages/ThoughtFormOverviewPage";
import { getProductOverviewBySlug } from "apps/client/src/products/catalogue/product-overview-catalogue";

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
  const productOverview = getProductOverviewBySlug(productSlug);

  if (!productOverview) {
    return { status: PRODUCT_ROUTE_STATUSES.notFound };
  }

  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
    const element =
      productOverview.slug === PRODUCT_IDS.thoughtForm ? (
        <ThoughtFormOverviewPage
          accessLevel={accessLevel}
          components={components}
        />
      ) : productOverview.slug === "care-calendar" ? (
        <CareCalendarOverviewPage />
      ) : (
        <TheBlackoutOverviewPage />
      );

    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: productOverview.name },
      ],
    };
  }

  const hostedProduct = getProductBySlug(productSlug);

  if (hostedProduct?.id === PRODUCT_IDS.thoughtForm) {
    return renderThoughtFormRoute({ accessLevel, components, segments });
  }

  return { status: PRODUCT_ROUTE_STATUSES.notFound };
}
