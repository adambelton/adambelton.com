import type { ReactNode } from "react";
import {
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
  type ProductRouteResult,
} from "packages/shared/src";
import { ConversationEditorPage } from "packages/products/src/socratic-draft/client/app/editor/ConversationEditorPage";
import { SocraticDraftEntriesPage } from "packages/products/src/socratic-draft/client/app/entries/SocraticDraftEntriesPage";
import { SocraticDraftOverviewPage } from "packages/products/src/socratic-draft/client/app/overview/SocraticDraftOverviewPage";

export type ProductAppRoute = {
  segments: readonly string[];
};

type SocraticDraftRenderedRoute = ReactNode;

export type ProductAppRouteResult =
  ProductRouteResult<SocraticDraftRenderedRoute>;

export function renderSocraticDraftRoute({
  segments,
}: ProductAppRoute): ProductAppRouteResult {
  if (segments.length === 0) {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <SocraticDraftOverviewPage />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    };
  }

  if (segments.length === 1 && segments[0] === "editor") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <ConversationEditorPage />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    };
  }

  if (segments.length === 1 && segments[0] === "entries") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <SocraticDraftEntriesPage />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    };
  }

  return {
    status: PRODUCT_ROUTE_STATUSES.notFound,
  };
}
