import { Hono } from "hono";
import { createConversationRoute } from "packages/products/src/socratic-draft/server/http/conversation-route";
import type { CreateConversationRouteDependencies } from "packages/products/src/socratic-draft/server/http/conversation-route";
import { createConversationsRoute } from "packages/products/src/socratic-draft/server/http/conversations-route";
import type { CreateConversationsRouteDependencies } from "packages/products/src/socratic-draft/server/http/conversations-route";

export type CreateSocraticDraftApiRouteDependencies =
  CreateConversationRouteDependencies & CreateConversationsRouteDependencies;

export function createSocraticDraftApiRoute(
  dependencies: CreateSocraticDraftApiRouteDependencies,
) {
  const route = new Hono();

  route.route("/conversation", createConversationRoute(dependencies));
  route.route("/conversations", createConversationsRoute(dependencies));

  return route;
}

export * from "packages/products/src/socratic-draft/server/http/conversation-route";
export * from "packages/products/src/socratic-draft/server/http/conversations-route";
