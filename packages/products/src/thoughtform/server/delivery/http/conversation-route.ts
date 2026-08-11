import { Hono } from "hono";
import type { Context } from "hono";
import {
  ConversationService,
  type TemporaryConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import type { DraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import {
  type ConversationResponder,
  type IdeaMapAnalyser,
  type StreamingConversationResponder,
} from "packages/products/src/thoughtform/server/application/workspace";
import { handleIdeaActionRequest } from "packages/products/src/thoughtform/server/delivery/http/idea-action-handler";
import { handleIdeaStructureRequest } from "packages/products/src/thoughtform/server/delivery/http/idea-structure-handler";
import {
  handleConversationResponse,
  handleConversationStream,
} from "packages/products/src/thoughtform/server/delivery/http/conversation-response-handler";
import { failure } from "packages/shared/src";
import { WORKSPACE_PERSISTENCE_TYPES } from "packages/products/src/thoughtform/shared";
import type { HostedAttemptLifecycle } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

export type CreateConversationRouteDependencies = {
  conversationStore?: TemporaryConversationStore;
  getConversationStore?: (
    request: Request,
  ) => Promise<TemporaryConversationStore | null>;
  conversationService?: ConversationResponder;
  streamingConversationService?: StreamingConversationResponder;
  ideaMapAnalysis?: IdeaMapAnalyser;
  getDraftStore?: (request: Request) => Promise<DraftStore | null>;
  getHostedAttemptLifecycle?: (
    request: Request,
  ) => Promise<HostedAttemptLifecycle | null>;
};

export function createConversationRoute({
  conversationStore,
  getConversationStore,
  conversationService = new ConversationService(),
  streamingConversationService = new ConversationService(),
  ideaMapAnalysis,
  getDraftStore,
  getHostedAttemptLifecycle,
}: CreateConversationRouteDependencies) {
  const route = new Hono();

  route.post("/respond-stream", async (context) => {
    const store = await resolveStore(context.req.raw);
    if (!store) return unauthorized(context, "Sign in to continue the conversation.");
    return handleConversationStream({
      context,
      conversationId: null,
      conversation: streamingConversationService,
      conversations: store,
      draftStore: await resolveDraftStore(context.req.raw),
      ideaMapAnalysis,
      persistenceType: WORKSPACE_PERSISTENCE_TYPES.temporary,
      hostedAttempts: await getHostedAttemptLifecycle?.(context.req.raw) ?? undefined,
    });
  });

  route.post("/respond", async (context) => {
    const store = await resolveStore(context.req.raw);
    if (!store) return unauthorized(context, "Sign in to continue the conversation.");
    return handleConversationResponse({
      context,
      conversationId: null,
      conversation: conversationService,
      conversations: store,
      draftStore: await resolveDraftStore(context.req.raw),
      persistenceType: WORKSPACE_PERSISTENCE_TYPES.temporary,
      hostedAttempts: await getHostedAttemptLifecycle?.(context.req.raw) ?? undefined,
    });
  });

  route.post("/:conversationId/ideas/:ideaId", async (context) => {
    const store = await resolveStore(context.req.raw);
    if (!store) return unauthorized(context, "Sign in to continue.");
    return handleIdeaActionRequest({
      request: context.req.raw,
      conversationId: context.req.param("conversationId"),
      ideaId: context.req.param("ideaId"),
      conversations: store,
      persistenceType: WORKSPACE_PERSISTENCE_TYPES.temporary,
    });
  });

  route.post("/:conversationId/idea-structure", async (context) => {
    const store = await resolveStore(context.req.raw);
    if (!store) return unauthorized(context, "Sign in to continue.");
    return handleIdeaStructureRequest({
      request: context.req.raw,
      conversationId: context.req.param("conversationId"),
      conversations: store,
      persistenceType: WORKSPACE_PERSISTENCE_TYPES.temporary,
    });
  });

  return route;

  function resolveStore(request: Request) {
    return getConversationStore
      ? getConversationStore(request)
      : Promise.resolve(conversationStore ?? null);
  }

  function resolveDraftStore(request: Request) {
    return getDraftStore ? getDraftStore(request) : Promise.resolve(null);
  }
}

function unauthorized(
  context: Context,
  message: string,
) {
  return context.json(failure("unauthorized", message), 401);
}
