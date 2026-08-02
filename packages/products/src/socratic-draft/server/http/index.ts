import { Hono } from "hono";
import { createConversationRoute } from "packages/products/src/socratic-draft/server/http/conversation-route";
import type { CreateConversationRouteDependencies } from "packages/products/src/socratic-draft/server/http/conversation-route";
import { createConversationsRoute } from "packages/products/src/socratic-draft/server/http/conversations-route";
import type { CreateConversationsRouteDependencies } from "packages/products/src/socratic-draft/server/http/conversations-route";
import { createTemporaryConversationRoute } from "packages/products/src/socratic-draft/server/http/temporary-conversation-route";
import type { CreateTemporaryConversationRouteDependencies } from "packages/products/src/socratic-draft/server/http/temporary-conversation-route";
import { createDraftRoute } from "packages/products/src/socratic-draft/server/http/draft-route";
import type { CreateDraftRouteDependencies } from "packages/products/src/socratic-draft/server/http/draft-route";
import type {
  DraftCompositionModel,
  RevisionProposalModel,
} from "packages/products/src/socratic-draft/server/draft";

export type CreateSocraticDraftApiRouteDependencies =
  CreateConversationRouteDependencies &
    CreateConversationsRouteDependencies &
    CreateTemporaryConversationRouteDependencies & {
      compositionModel: DraftCompositionModel;
      proposalModel: RevisionProposalModel;
      getPersistentDraftStore: CreateDraftRouteDependencies["getDraftStore"];
      getTemporaryDraftStore: CreateDraftRouteDependencies["getDraftStore"];
    };

export function createSocraticDraftApiRoute(
  dependencies: CreateSocraticDraftApiRouteDependencies,
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
  route.route("/conversations", createConversationsRoute(dependencies));
  route.route("/drafts", createDraftRoute({
    compositionModel: dependencies.compositionModel,
    proposalModel: dependencies.proposalModel,
    getConversationStore: dependencies.getPersistentConversationStore,
    getDraftStore: dependencies.getPersistentDraftStore,
  }));
  route.route("/temporary-drafts", createDraftRoute({
    compositionModel: dependencies.compositionModel,
    proposalModel: dependencies.proposalModel,
    getConversationStore: dependencies.getTemporaryConversationStore,
    getDraftStore: dependencies.getTemporaryDraftStore,
  }));

  return route;
}

export * from "packages/products/src/socratic-draft/server/http/conversation-route";
export * from "packages/products/src/socratic-draft/server/http/conversations-route";
export * from "packages/products/src/socratic-draft/server/http/temporary-conversation-route";
export * from "packages/products/src/socratic-draft/server/http/draft-route";
