import type { ReactNode } from "react";
import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";
import {
  PRODUCT_ROUTE_ACCESSES,
  PRODUCT_ROUTE_STATUSES,
  type ProductRouteResult,
} from "packages/shared/src";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";
import { TemporaryWorkspacePage } from "packages/products/src/thoughtform/client/pages/TemporaryWorkspacePage";
import { ConversationsPage } from "packages/products/src/thoughtform/client/pages/ConversationsPage";
import { ConversationPage } from "packages/products/src/thoughtform/client/pages/ConversationPage";
import { EditorPage } from "packages/products/src/thoughtform/client/pages/EditorPage";
import { OverviewPage } from "packages/products/src/thoughtform/client/pages/OverviewPage";
import { PrivacyPage } from "packages/products/src/thoughtform/client/pages/PrivacyPage";

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
      element: <OverviewPage accessLevel={accessLevel} components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: "ThoughtForm" },
      ],
    };
  }

  if (segments.length === 1 && segments[0] === "editor") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: (
        <TemporaryWorkspacePage
          components={components}
        />
      ),
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: "ThoughtForm", href: "/products/thoughtform" },
        { label: "Editor" },
      ],
    };
  }

  if (segments.length === 1 && segments[0] === "privacy") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <PrivacyPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.public,
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: "ThoughtForm", href: "/products/thoughtform" },
        { label: "Privacy" },
      ],
    };
  }

  if (segments.length === 1 && segments[0] === "conversations") {
    return {
      status: PRODUCT_ROUTE_STATUSES.found,
      element: <ConversationsPage components={components} />,
      requiredAccess: PRODUCT_ROUTE_ACCESSES.owner,
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: "ThoughtForm", href: "/products/thoughtform" },
        { label: "Conversations" },
      ],
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
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: "ThoughtForm", href: "/products/thoughtform" },
        { label: "Conversations", href: "/products/thoughtform/conversations" },
        { label: "Editor" },
      ],
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
      breadcrumbs: [
        { label: "Products", href: "/products" },
        { label: "ThoughtForm", href: "/products/thoughtform" },
        { label: "Conversations", href: "/products/thoughtform/conversations" },
        { label: "Conversation" },
      ],
    };
  }

  return {
    status: PRODUCT_ROUTE_STATUSES.notFound,
  };
}
