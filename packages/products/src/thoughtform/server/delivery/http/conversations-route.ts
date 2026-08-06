import { Hono } from "hono";
import {
  ConversationService,
  type PersistentConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import type { DraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import {
  type ConversationResponder,
  type IdeaMapAnalyser,
  type StreamingConversationResponder,
} from "packages/products/src/thoughtform/server/application/workspace";
import { handleIdeaActionRequest } from "packages/products/src/thoughtform/server/delivery/http/idea-action-handler";
import {
  handleConversationResponse,
  handleConversationStream,
} from "packages/products/src/thoughtform/server/delivery/http/conversation-response-handler";
import { CONVERSATION_ERROR_CODES } from "packages/products/src/thoughtform/shared";
import type { Observability } from "packages/observability/src";
import { failure, success } from "packages/shared/src";

export type CreateConversationsRouteDependencies = {
  getPersistentConversationStore: (
    request: Request,
  ) => Promise<PersistentConversationStore | null>;
  conversationService?: ConversationResponder;
  streamingConversationService?: StreamingConversationResponder;
  ideaMapAnalysis?: IdeaMapAnalyser;
  getPersistentDraftStore?: (request: Request) => Promise<DraftStore | null>;
  observability?: Observability;
};

export function createConversationsRoute({
  getPersistentConversationStore,
  conversationService = new ConversationService(),
  streamingConversationService = new ConversationService(),
  ideaMapAnalysis,
  getPersistentDraftStore,
  observability,
}: CreateConversationsRouteDependencies) {
  const route = new Hono();

  route.post("/", async (context) => {
    const store = await getPersistentConversationStore(context.req.raw);
    if (!store) return notFound(context);
    return context.json(success(await store.createConversation()), 201);
  });

  route.get("/", async (context) => {
    const store = await getPersistentConversationStore(context.req.raw);
    if (!store) return notFound(context);
    return context.json(success(await store.listConversations()));
  });

  route.get("/:conversationId", async (context) => {
    const store = await getPersistentConversationStore(context.req.raw);
    if (!store) return notFound(context);
    const conversation = await store.getConversation(
      context.req.param("conversationId"),
    );
    if (!conversation) {
      return context.json(failure(
        CONVERSATION_ERROR_CODES.notFound,
        "The requested conversation was not found.",
      ), 404);
    }
    return context.json(success(conversation));
  });

  route.post("/:conversationId/respond", async (context) => {
    const store = await getPersistentConversationStore(context.req.raw);
    if (!store) return notFound(context);
    return handleConversationResponse({
      context,
      conversationId: context.req.param("conversationId"),
      conversation: conversationService,
      conversations: store,
      draftStore: await resolveDraftStore(context.req.raw),
      kind: "persistent",
      observability,
    });
  });

  route.post("/:conversationId/respond-stream", async (context) => {
    const store = await getPersistentConversationStore(context.req.raw);
    if (!store) return notFound(context);
    return handleConversationStream({
      context,
      conversationId: context.req.param("conversationId"),
      conversation: streamingConversationService,
      conversations: store,
      draftStore: await resolveDraftStore(context.req.raw),
      ideaMapAnalysis,
      kind: "persistent",
      observability,
    });
  });

  route.post("/:conversationId/ideas/:ideaId", async (context) => {
    const store = await getPersistentConversationStore(context.req.raw);
    if (!store) return notFound(context);
    return handleIdeaActionRequest({
      request: context.req.raw,
      conversationId: context.req.param("conversationId"),
      ideaId: context.req.param("ideaId"),
      conversations: store,
    });
  });

  return route;

  function resolveDraftStore(request: Request) {
    return getPersistentDraftStore
      ? getPersistentDraftStore(request)
      : Promise.resolve(null);
  }
}

function notFound(context: import("hono").Context) {
  return context.json(failure("not_found", "The requested resource was not found."), 404);
}
