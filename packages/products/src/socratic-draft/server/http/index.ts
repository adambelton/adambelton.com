import { Hono } from "hono";
import { createConversationRoute } from "packages/products/src/socratic-draft/server/http/conversation-route";
import type { CreateConversationRouteDependencies } from "packages/products/src/socratic-draft/server/http/conversation-route";

export type CreateSocraticDraftApiRouteDependencies =
  CreateConversationRouteDependencies;

export function createSocraticDraftApiRoute(
  dependencies: CreateSocraticDraftApiRouteDependencies,
) {
  const route = new Hono();

  route.route("/conversation", createConversationRoute(dependencies));

  return route;
}

export * from "packages/products/src/socratic-draft/server/http/conversation-route";
