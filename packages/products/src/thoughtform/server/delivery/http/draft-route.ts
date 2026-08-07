import { Hono } from "hono";
import type { Context } from "hono";
import type { ConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import {
  DRAFT_WRITE_STATUSES,
  DraftService,
  InvalidDraftOperationError,
  type DraftCompositionModel,
  type DraftChangeInterpretationModel,
  type DraftStore,
  type DraftWriteResult,
  type RevisionProposalModel,
} from "packages/products/src/thoughtform/server/capabilities/drafting";
import {
  DRAFT_ERROR_CODES,
  REVISION_PROPOSAL_SCOPES,
  type DraftSelection,
  type RevisionProposalScope,
} from "packages/products/src/thoughtform/shared";
import { interpretSavedDraftChange } from "packages/products/src/thoughtform/server/application/workspace";
import { validateDraftChange } from "packages/products/src/thoughtform/server/delivery/http/draft-change-context";
import { failure, success } from "packages/shared/src";

type Resolver<T> = (request: Request) => Promise<T | null>;

export interface CreateDraftRouteDependencies {
  compositionModel: DraftCompositionModel;
  interpretationModel: DraftChangeInterpretationModel;
  getConversationStore: Resolver<ConversationStore>;
  getDraftStore: Resolver<DraftStore>;
  proposalModel: RevisionProposalModel;
  kind: "persistent" | "temporary";
}

export function createDraftRoute(dependencies: CreateDraftRouteDependencies) {
  const route = new Hono();

  route.get("/:conversationId", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    return context.json(success(
      await resolved.drafts.getDraftingState(conversationId),
    ));
  });

  route.post("/:conversationId/compose", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    const workspace = await resolved.conversations.getConversationWorkspace(
      conversationId,
    );
    if (!workspace) return missingWorkspace(context, dependencies.kind);
    const body = await readBody(context.req.raw);
    const selectedIdeaIds = body?.selectedIdeaIds;
    if (!isStringArray(selectedIdeaIds)) return invalid(context);
    const instruction = stringValue(body?.instruction) ??
      "Compose a draft from the selected ideas.";
    return run(context, () => service(resolved.drafts, dependencies).compose({
      conversationId,
      operationId: operationId(context.req.raw, body),
      selectedIdeaIds,
      ideas: workspace.ideaMap.ideas,
      relevantConversationLanguage: workspace.messages
        .filter((message) => message.role === "user")
        .map((message) => message.content),
      instruction,
    }), 201);
  });

  route.put("/:conversationId", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    const body = await readBody(context.req.raw);
    const expectedRevision = body?.expectedRevision;
    const draftBody = body?.body;
    if (typeof expectedRevision !== "number" || typeof draftBody !== "string") {
      return invalid(context);
    }
    return run(context, () => service(resolved.drafts, dependencies).save({
      conversationId,
      operationId: operationId(context.req.raw, body),
      expectedRevision,
      body: draftBody,
    }), 200, draftOperationResponse);
  });

  route.post("/:conversationId/restore", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    const body = await readBody(context.req.raw);
    const expectedRevision = body?.expectedRevision;
    const restoreRevision = body?.restoreRevision;
    if (typeof expectedRevision !== "number" || typeof restoreRevision !== "number") {
      return invalid(context);
    }
    return run(context, () => service(resolved.drafts, dependencies).restore({
      conversationId,
      operationId: operationId(context.req.raw, body),
      expectedRevision,
      restoreRevision,
    }), 200, draftOperationResponse);
  });

  route.post("/:conversationId/interpret-change", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    const body = await readBody(context.req.raw);
    const change = isDraftChange(body.change) ? body.change : null;
    if (!change || !await validateDraftChange({
      conversationId,
      drafts: resolved.drafts,
      change,
    })) return invalid(context, "The saved draft change is stale or invalid.");
    const interpretation = await interpretSavedDraftChange({
      conversationId,
      change,
      model: dependencies.interpretationModel,
      conversations: resolved.conversations,
    });
    if (interpretation.status === "failed") {
      console.warn(`Saved-edit interpretation failed during ${interpretation.failureStage ?? "unknown"}.`);
    }
    return context.json(success(interpretation));
  });

  route.post("/:conversationId/proposals", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    const body = await readBody(context.req.raw);
    const expectedDraftRevision = body?.expectedDraftRevision;
    const scope = body?.scope;
    const userInstruction = stringValue(body?.userInstruction);
    if (
      typeof expectedDraftRevision !== "number" ||
      !isScope(scope) ||
      !userInstruction
    ) return invalid(context);
    return run(context, () => service(resolved.drafts, dependencies).propose({
      conversationId,
      operationId: operationId(context.req.raw, body),
      expectedDraftRevision,
      scope,
      selection: isSelection(body?.selection) ? body.selection : undefined,
      userInstruction,
    }), 201);
  });

  route.patch("/:conversationId/proposals/:proposalId", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    const body = await readBody(context.req.raw);
    const expectedProposalRevision = body?.expectedProposalRevision;
    const userInstruction = stringValue(body?.userInstruction);
    if (
      typeof expectedProposalRevision !== "number" ||
      !userInstruction
    ) return invalid(context);
    return run(context, () => service(resolved.drafts, dependencies).amend({
      conversationId,
      proposalId: context.req.param("proposalId"),
      operationId: operationId(context.req.raw, body),
      expectedProposalRevision,
      userInstruction,
    }));
  });

  route.post("/:conversationId/proposals/:proposalId/accept", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    const body = await readBody(context.req.raw);
    const expectedDraftRevision = body?.expectedDraftRevision;
    if (typeof expectedDraftRevision !== "number") return invalid(context);
    return run(context, () => service(resolved.drafts, dependencies).accept({
      conversationId,
      proposalId: context.req.param("proposalId"),
      operationId: operationId(context.req.raw, body),
      expectedDraftRevision,
    }));
  });

  route.post("/:conversationId/proposals/:proposalId/reject", async (context) => {
    const resolved = await resolve(context.req.raw, dependencies);
    if (!resolved) return notFound(context);
    const conversationId = context.req.param("conversationId");
    if (!(await resolved.conversations.getConversationWorkspace(conversationId))) {
      return missingWorkspace(context, dependencies.kind);
    }
    const body = await readBody(context.req.raw);
    return run(context, () => service(resolved.drafts, dependencies).reject({
      conversationId,
      proposalId: context.req.param("proposalId"),
      operationId: operationId(context.req.raw, body),
    }));
  });

  return route;
}

async function resolve(
  request: Request,
  dependencies: CreateDraftRouteDependencies,
) {
  const [conversations, drafts] = await Promise.all([
    dependencies.getConversationStore(request),
    dependencies.getDraftStore(request),
  ]);
  return conversations && drafts ? { conversations, drafts } : null;
}

function service(store: DraftStore, dependencies: CreateDraftRouteDependencies) {
  return new DraftService(
    store,
    dependencies.compositionModel,
    dependencies.proposalModel,
  );
}

async function run(
  context: Context,
  command: () => Promise<DraftWriteResult & { change?: unknown }>,
  successStatus: 200 | 201 = 200,
  responseData: (result: DraftWriteResult & { change?: unknown }) => unknown | Promise<unknown> =
    (result) => "workspace" in result ? result.workspace : null,
) {
  try {
    const result = await command();
    if (result.status === DRAFT_WRITE_STATUSES.notFound) return notFound(context);
    if (result.status === DRAFT_WRITE_STATUSES.conflict) {
      return context.json(failure(DRAFT_ERROR_CODES.conflict, "The draft changed elsewhere. Review the current draft and try again."), 409);
    }
    if (result.status === DRAFT_WRITE_STATUSES.proposalNotActive) {
      return context.json(failure(DRAFT_ERROR_CODES.proposalNotActive, "This revision proposal is no longer active."), 409);
    }
    return context.json(success(await responseData(result)), result.status === DRAFT_WRITE_STATUSES.changed ? successStatus : 200);
  } catch (error) {
    if (error instanceof InvalidDraftOperationError) return invalid(context, error.message);
    if (error instanceof HostedAiDisabledError) {
      return context.json(failure("hosted_ai_disabled", "ThoughtForm is currently disabled."), 503);
    }
    if (error instanceof HostedAiUnavailableError) {
      return context.json(failure("hosted_ai_unavailable", "ThoughtForm could not respond. Try again shortly."), 503);
    }
    throw error;
  }
}

function draftOperationResponse(
  result: DraftWriteResult & { change?: unknown },
) {
  return "workspace" in result
    ? { workspace: result.workspace, change: result.change ?? null }
    : null;
}

function isDraftChange(value: unknown): value is import("packages/products/src/thoughtform/shared").DraftChange {
  if (!value || typeof value !== "object") return false;
  const change = value as Record<string, unknown>;
  return typeof change.fromRevision === "number" && typeof change.toRevision === "number" &&
    typeof change.removedText === "string" && typeof change.addedText === "string";
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function operationId(request: Request, body: Record<string, unknown>) {
  return request.headers.get("Idempotency-Key")?.trim() ||
    stringValue(body.operationId) || globalThis.crypto.randomUUID();
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isScope(value: unknown): value is RevisionProposalScope {
  return Object.values(REVISION_PROPOSAL_SCOPES).includes(value as RevisionProposalScope);
}

function isSelection(value: unknown): value is DraftSelection {
  if (!value || typeof value !== "object") return false;
  const selection = value as Record<string, unknown>;
  return typeof selection.baseDraftRevision === "number" &&
    typeof selection.start === "number" &&
    typeof selection.end === "number" &&
    typeof selection.selectedText === "string";
}

function invalid(context: Context, message = "The draft request is invalid.") {
  return context.json(failure(DRAFT_ERROR_CODES.invalidRequest, message), 400);
}

function notFound(context: Context) {
  return context.json(failure(DRAFT_ERROR_CODES.notFound, "The requested drafting state was not found."), 404);
}

function missingWorkspace(
  context: Context,
  kind: CreateDraftRouteDependencies["kind"],
) {
  return kind === "temporary"
    ? context.json(
        failure(
          DRAFT_ERROR_CODES.unavailable,
          "This temporary workspace is no longer available.",
        ),
        409,
      )
    : notFound(context);
}
