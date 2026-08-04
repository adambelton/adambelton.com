import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { createConversationStore } from "packages/products/src/socratic-draft/server/capabilities/conversation";
import { createDraftStore } from "packages/products/src/socratic-draft/server/capabilities/drafting";
import { createDraftRoute } from "packages/products/src/socratic-draft/server/delivery/http/draft-route";
import { TestConversationPersistence } from "packages/products/src/socratic-draft/testing/fakes/test-conversation-persistence";
import { TestDraftPersistence } from "packages/products/src/socratic-draft/testing/fakes/test-draft-persistence";
import type { Idea } from "packages/products/src/socratic-draft/shared";
import type { DraftOperationResponse, DraftingState } from "packages/products/src/socratic-draft/shared";
import type { ApiResponse } from "packages/shared/src";

const idea: Idea = {
  id: "idea-1",
  title: "Authorship",
  synthesis: "Review preserves authorship.",
  substance: "I remain responsible for accepted language.",
  unresolvedQuestions: [],
  assistantAssessment: { exploration: "well_explored", importance: "central" },
  userInterpretation: null,
  disposition: "active",
};

describe("draft HTTP route", () => {
  let app: Hono;
  const conversationId = "conversation-1";

  beforeEach(async () => {
    const conversationPersistence = new TestConversationPersistence();
    const conversations = createConversationStore(conversationPersistence, {
      initializeOnAppend: true,
      createId: () => conversationId,
    });
    await conversations.appendConversationTurn({
      conversationId,
      operationId: "turn-1",
      userMessage: { role: "user", content: "I want to preserve authorship." },
      assistantMessage: { role: "assistant", content: "What would that require?" },
      expectedIdeaMapRevision: 0,
      ideaMap: { revision: 1, ideas: [idea] },
    });
    const drafts = createDraftStore(new TestDraftPersistence());
    app = new Hono().route("/drafts", createDraftRoute({
      getConversationStore: async () => conversations,
      getDraftStore: async () => drafts,
      compositionModel: { compose: async () => ({ body: "The first draft." }) },
      proposalModel: {
        propose: async () => ({
          proposedContent: "The reviewed draft.",
          intendedEffect: "Make authorship explicit.",
        }),
      },
    }));
  });

  it("composes, saves, and rejects a stale manual save", async () => {
    const composed = await jsonRequest(app, `/drafts/${conversationId}/compose`, {
      method: "POST",
      body: { selectedIdeaIds: [idea.id], instruction: "Compose early." },
    });
    expect(composed.response.status).toBe(201);
    if (!composed.payload.ok) throw new Error("Expected composition to succeed.");
    expect(composed.payload.data.draft).toMatchObject({ body: "The first draft.\n", currentRevision: 1 });

    const saved = await jsonRequest<DraftOperationResponse>(app, `/drafts/${conversationId}`, {
      method: "PUT",
      body: { expectedRevision: 1, body: "My direct edit." },
    });
    if (!saved.payload.ok) throw new Error("Expected save to succeed.");
    expect(saved.payload.data.workspace.draft).toMatchObject({ body: "My direct edit.\n", currentRevision: 2 });
    expect(saved.payload.data.change).toMatchObject({
      fromRevision: 1,
      toRevision: 2,
      removedText: "The first draft.",
      addedText: "My direct edit.",
    });

    const stale = await jsonRequest(app, `/drafts/${conversationId}`, {
      method: "PUT",
      body: { expectedRevision: 1, body: "Stale edit." },
    });
    expect(stale.response.status).toBe(409);
    if (stale.payload.ok) throw new Error("Expected stale save to fail.");
    expect(stale.payload.error.code).toBe("draft_conflict");
  });

  it("persists format before a draft and rejects stale changes", async () => {
    const saved = await jsonRequest(app, `/drafts/${conversationId}/format`, {
      method: "PUT",
      body: { expectedFormatRevision: 0, format: "  Case study  " },
    });
    expect(saved.response.status).toBe(200);
    if (!saved.payload.ok) throw new Error("Expected format save to succeed.");
    expect(saved.payload.data).toMatchObject({
      format: "Case study",
      formatRevision: 1,
      draft: null,
    });

    const stale = await jsonRequest(app, `/drafts/${conversationId}/format`, {
      method: "PUT",
      body: { expectedFormatRevision: 0, format: "Personal essay" },
    });
    expect(stale.response.status).toBe(409);

    const loaded = await app.request(`/drafts/${conversationId}`);
    const payload = await loaded.json() as ApiResponse<DraftingState>;
    expect(payload.ok && payload.data).toMatchObject({
      format: "Case study",
      formatRevision: 1,
      draft: null,
    });
  });

  it("reviews and accepts the exact proposed whole draft", async () => {
    await jsonRequest(app, `/drafts/${conversationId}/compose`, {
      method: "POST",
      body: { selectedIdeaIds: [idea.id] },
    });
    const proposed = await jsonRequest(app, `/drafts/${conversationId}/proposals`, {
      method: "POST",
      body: {
        expectedDraftRevision: 1,
        scope: "whole_draft",
        userInstruction: "Make authorship explicit.",
      },
    });
    if (!proposed.payload.ok || !proposed.payload.data.activeProposal || !proposed.payload.data.draft) {
      throw new Error("Expected proposal to succeed.");
    }
    const proposalId = proposed.payload.data.activeProposal.id;
    expect(proposed.payload.data.draft.body).toBe("The first draft.\n");
    expect(proposed.payload.data.activeProposal.versions[0]?.proposedContent).toBe("The reviewed draft.\n");

    const accepted = await jsonRequest(app, `/drafts/${conversationId}/proposals/${proposalId}/accept`, {
      method: "POST",
      body: { expectedDraftRevision: 1 },
    });
    if (!accepted.payload.ok) throw new Error("Expected acceptance to succeed.");
    expect(accepted.payload.data.draft).toMatchObject({ body: "The reviewed draft.\n", currentRevision: 2 });
    expect(accepted.payload.data.revisions[1]).toMatchObject({ source: "accepted_proposal", proposalId });
  });
});

async function jsonRequest<T = DraftingState>(
  app: Hono,
  path: string,
  input: { method: string; body: Record<string, unknown> },
) {
  const response = await app.request(path, {
    method: input.method,
    headers: { "Content-Type": "application/json", "Idempotency-Key": globalThis.crypto.randomUUID() },
    body: JSON.stringify(input.body),
  });
  return {
    response,
    payload: await response.json() as ApiResponse<T>,
  };
}
