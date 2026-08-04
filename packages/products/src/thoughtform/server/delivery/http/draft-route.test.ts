import { Hono } from "hono";
import { beforeEach, describe, expect, it } from "vitest";
import { createConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { createDraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import { createDraftRoute } from "packages/products/src/thoughtform/server/delivery/http/draft-route";
import { TestConversationPersistence } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";
import { TestDraftPersistence } from "packages/products/src/thoughtform/testing/fakes/test-draft-persistence";
import type { Idea } from "packages/products/src/thoughtform/shared";
import type { DraftOperationResponse, DraftingState } from "packages/products/src/thoughtform/shared";
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
      interpretationModel: {
        interpret: async () => ({
          type: "composition",
          assistantMessage: "It sounds as though this wording is provisional. Is that right?",
          potentialConflicts: [],
        }),
      },
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
    expect(composed.payload.data.draft).toMatchObject({ body: "The first draft.", currentRevision: 1 });

    const saved = await jsonRequest<DraftOperationResponse>(app, `/drafts/${conversationId}`, {
      method: "PUT",
      body: { expectedRevision: 1, body: "My direct edit." },
    });
    if (!saved.payload.ok) throw new Error("Expected save to succeed.");
    expect(saved.payload.data.workspace.draft).toMatchObject({ body: "My direct edit.", currentRevision: 2 });
    expect(saved.payload.data.change).toMatchObject({
      fromRevision: 1,
      toRevision: 2,
      removedText: "The first draft.",
      addedText: "My direct edit.",
    });
    expect(saved.payload.data.interpretation).toBeUndefined();

    const interpreted = await jsonRequest(app, `/drafts/${conversationId}/interpret-change`, {
      method: "POST",
      body: { change: saved.payload.data.change },
    });
    expect(interpreted.response.status).toBe(200);
    if (!interpreted.payload.ok) throw new Error("Expected interpretation to succeed.");
    expect(interpreted.payload.data).toMatchObject({
      status: "responded",
      response: { message: { role: "assistant" } },
    });

    const stale = await jsonRequest(app, `/drafts/${conversationId}`, {
      method: "PUT",
      body: { expectedRevision: 1, body: "Stale edit." },
    });
    expect(stale.response.status).toBe(409);
    if (stale.payload.ok) throw new Error("Expected stale save to fail.");
    expect(stale.payload.error.code).toBe("draft_conflict");
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
    expect(proposed.payload.data.draft.body).toBe("The first draft.");
    expect(proposed.payload.data.activeProposal.versions[0]?.proposedContent).toBe("The reviewed draft.");

    const accepted = await jsonRequest(app, `/drafts/${conversationId}/proposals/${proposalId}/accept`, {
      method: "POST",
      body: { expectedDraftRevision: 1 },
    });
    if (!accepted.payload.ok) throw new Error("Expected acceptance to succeed.");
    expect(accepted.payload.data.draft).toMatchObject({ body: "The reviewed draft.", currentRevision: 2 });
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
