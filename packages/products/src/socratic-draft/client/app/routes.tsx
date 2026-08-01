import type { ReactNode } from "react";
import type { AccessLevel } from "packages/shared/src";
import {
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
  type ProductRouteResult,
} from "packages/shared/src";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";
import { ConversationEditorPage } from "packages/products/src/socratic-draft/client/app/editor/ConversationEditorPage";
import { SocraticDraftConversationsPage } from "packages/products/src/socratic-draft/client/app/conversations/SocraticDraftConversationsPage";
import { SocraticDraftConversationPage } from "packages/products/src/socratic-draft/client/app/conversations/SocraticDraftConversationPage";
import { SocraticDraftOverviewPage } from "packages/products/src/socratic-draft/client/app/overview/SocraticDraftOverviewPage";
import { SocraticDraftPrivacyPage } from "packages/products/src/socratic-draft/client/app/privacy/SocraticDraftPrivacyPage";

export type ProductAppRoute = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
  segments: readonly string[];
};

type SocraticDraftRenderedRoute = ReactNode;

export type ProductAppRouteResult =
  ProductRouteResult<SocraticDraftRenderedRoute>;

export function renderSocraticDraftRoute({
  accessLevel,
  components,
  segments,
}: ProductAppRoute): ProductAppRouteResult {
  if (segments.length === 0) {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <SocraticDraftOverviewPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    };
  }

  if (segments.length === 1 && segments[0] === "editor") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: (
        <ConversationEditorPage
          accessLevel={accessLevel}
          components={components}
        />
      ),
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    };
  }

  if (segments.length === 1 && segments[0] === "privacy") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <SocraticDraftPrivacyPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
    };
  }

  if (segments.length === 1 && segments[0] === "conversations") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <SocraticDraftConversationsPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    };
  }

  const conversationId = segments[1];

  if (
    segments.length === 2 &&
    segments[0] === "conversations" &&
    conversationId
  ) {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: (
        <SocraticDraftConversationPage
          key={conversationId}
          conversationId={conversationId}
        />
      ),
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    };
  }

  return {
    status: PRODUCT_ROUTE_STATUSES.notFound,
  };
}
