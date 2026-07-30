import type { ReactNode } from "react";
import { ConversationEditorPage } from "packages/products/src/socratic-draft/client/app/editor/ConversationEditorPage";
import { SocraticDraftOverviewPage } from "packages/products/src/socratic-draft/client/app/overview/SocraticDraftOverviewPage";

export type ProductAppRoute = {
  segments: readonly string[];
};

export type ProductAppRouteResult =
  | {
      status: "found";
      element: ReactNode;
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
    };
  }

  if (segments.length === 1 && segments[0] === "editor") {
    return {
      status: "found",
      element: <ConversationEditorPage />,
    };
  }

  return {
    status: "not_found",
  };
}
