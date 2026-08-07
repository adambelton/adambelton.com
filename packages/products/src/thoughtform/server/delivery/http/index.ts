import { Hono } from "hono";
import { createConversationRoute } from "packages/products/src/thoughtform/server/delivery/http/conversation-route";
import type { CreateConversationRouteDependencies } from "packages/products/src/thoughtform/server/delivery/http/conversation-route";
import { createConversationsRoute } from "packages/products/src/thoughtform/server/delivery/http/conversations-route";
import type { CreateConversationsRouteDependencies } from "packages/products/src/thoughtform/server/delivery/http/conversations-route";
import { createTemporaryConversationRoute } from "packages/products/src/thoughtform/server/delivery/http/temporary-conversation-route";
import type { CreateTemporaryConversationRouteDependencies } from "packages/products/src/thoughtform/server/delivery/http/temporary-conversation-route";
import { createDraftRoute } from "packages/products/src/thoughtform/server/delivery/http/draft-route";
import type { CreateDraftRouteDependencies } from "packages/products/src/thoughtform/server/delivery/http/draft-route";
import type {
  DraftCompositionModel,
  RevisionProposalModel,
} from "packages/products/src/thoughtform/server/capabilities/drafting";

export type CreateThoughtFormApiRouteDependencies =
  CreateConversationRouteDependencies &
    CreateConversationsRouteDependencies &
    CreateTemporaryConversationRouteDependencies & {
      compositionModel: DraftCompositionModel;
      interpretationModel: CreateDraftRouteDependencies["interpretationModel"];
      proposalModel: RevisionProposalModel;
      getPersistentDraftStore: CreateDraftRouteDependencies["getDraftStore"];
      getTemporaryDraftStore: CreateDraftRouteDependencies["getDraftStore"];
      persistentConversationService?: CreateConversationsRouteDependencies["conversationService"];
      persistentStreamingConversationService?: CreateConversationsRouteDependencies["streamingConversationService"];
      persistentIdeaMapAnalysis?: CreateConversationsRouteDependencies["ideaMapAnalysis"];
      persistentObservability?: CreateConversationsRouteDependencies["observability"];
    };

export function createThoughtFormApiRoute(
  dependencies: CreateThoughtFormApiRouteDependencies,
) {
  const route = new Hono();

  route.route("/conversation", createConversationRoute({
    ...dependencies,
    getDraftStore: dependencies.getTemporaryDraftStore,
  }));
  route.route(
    "/temporary-conversation",
    createTemporaryConversationRoute(dependencies),
  );
  route.route("/conversations", createConversationsRoute({
    ...dependencies,
    conversationService:
      dependencies.persistentConversationService ?? dependencies.conversationService,
    streamingConversationService:
      dependencies.persistentStreamingConversationService ??
      dependencies.streamingConversationService,
    ideaMapAnalysis:
      dependencies.persistentIdeaMapAnalysis ?? dependencies.ideaMapAnalysis,
    observability: dependencies.persistentObservability,
  }));
  route.route("/drafts", createDraftRoute({
    kind: "persistent",
    compositionModel: dependencies.compositionModel,
    interpretationModel: dependencies.interpretationModel,
    proposalModel: dependencies.proposalModel,
    getConversationStore: dependencies.getPersistentConversationStore,
    getDraftStore: dependencies.getPersistentDraftStore,
  }));
  route.route("/temporary-drafts", createDraftRoute({
    kind: "temporary",
    compositionModel: dependencies.compositionModel,
    interpretationModel: dependencies.interpretationModel,
    proposalModel: dependencies.proposalModel,
    getConversationStore: dependencies.getTemporaryConversationStore,
    getDraftStore: dependencies.getTemporaryDraftStore,
  }));

  return route;
}

export * from "packages/products/src/thoughtform/server/delivery/http/conversation-route";
export * from "packages/products/src/thoughtform/server/delivery/http/conversations-route";
export * from "packages/products/src/thoughtform/server/delivery/http/temporary-conversation-route";
export * from "packages/products/src/thoughtform/server/delivery/http/draft-route";
