import type { ReactNode } from "react";
import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";
import {
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
  type ProductRouteResult,
} from "packages/shared/src";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";
import { DemoEditorPage } from "packages/products/src/socratic-draft/client/app/pages/DemoEditorPage";
import { ConversationsPage } from "packages/products/src/socratic-draft/client/app/pages/ConversationsPage";
import { ConversationPage } from "packages/products/src/socratic-draft/client/app/pages/ConversationPage";
import { EditorPage } from "packages/products/src/socratic-draft/client/app/pages/EditorPage";
import { OverviewPage } from "packages/products/src/socratic-draft/client/app/pages/OverviewPage";
import { PrivacyPage } from "packages/products/src/socratic-draft/client/app/pages/PrivacyPage";

export type ProductAppRoute = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
  segments: readonly string[];
};

type RenderedRoute = ReactNode;

export type ProductAppRouteResult =
  ProductRouteResult<RenderedRoute>;

export function renderProductRoute({
  accessLevel,
  components,
  segments,
}: ProductAppRoute): ProductAppRouteResult {
  if (segments.length === 0) {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <OverviewPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    };
  }

  if (segments.length === 1 && segments[0] === "editor") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: (
        <DemoEditorPage
          components={components}
        />
      ),
      requiredAccess: PRODUCT_ROUTE_ACCESSES.authenticated,
    };
  }

  if (segments.length === 1 && segments[0] === "privacy") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <PrivacyPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
    };
  }

  if (segments.length === 1 && segments[0] === "conversations") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <ConversationsPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    };
  }

  const conversationId = segments[1];

  if (
    segments.length === 3 &&
    segments[0] === "conversations" &&
    conversationId &&
    segments[2] === "editor"
  ) {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: (
        <EditorPage
          key={conversationId}
          conversationId={conversationId}
        />
      ),
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
    };
  }

  if (
    segments.length === 2 &&
    segments[0] === "conversations" &&
    conversationId
  ) {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: (
        <ConversationPage
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
