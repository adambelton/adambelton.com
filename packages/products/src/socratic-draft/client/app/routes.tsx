import type { ReactNode } from "react";
import { ConversationEditorPage } from "packages/products/src/socratic-draft/client/app/editor/ConversationEditorPage";
import { SocraticDraftEntriesPage } from "packages/products/src/socratic-draft/client/app/entries/SocraticDraftEntriesPage";
import { SocraticDraftOverviewPage } from "packages/products/src/socratic-draft/client/app/overview/SocraticDraftOverviewPage";

export type ProductAppRoute = {
  segments: readonly string[];
};

export type ProductAppRouteAccess = "authenticated" | "owner";

export type ProductAppRouteResult =
  | {
      status: "found";
      element: ReactNode;
      requiredAccess: ProductAppRouteAccess;
    }
  | {
      status: "not_found";
    };

export function renderSocraticDraftRoute({
  segments,
}: ProductAppRoute): ProductAppRouteResult {
  if (segments.length === 0) {
    return {
      status: "found",
      element: <SocraticDraftOverviewPage />,
      requiredAccess: "authenticated",
    };
  }

  if (segments.length === 1 && segments[0] === "editor") {
    return {
      status: "found",
      element: <ConversationEditorPage />,
      requiredAccess: "authenticated",
    };
  }

  if (segments.length === 1 && segments[0] === "entries") {
    return {
      status: "found",
      element: <SocraticDraftEntriesPage />,
      requiredAccess: "owner",
    };
  }

  return {
    status: "not_found",
  };
}
