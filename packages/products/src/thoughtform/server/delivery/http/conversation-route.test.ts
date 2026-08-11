import { describe, expect, it } from "vitest";
import { ConversationService } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { createConversationRoute } from "packages/products/src/thoughtform/server/delivery/http";
import type {
  AppendConversationTurnInput,
  TemporaryConversationStore,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import type { ConversationResponder } from "packages/products/src/thoughtform/server/application/workspace";
import type {
  ConversationMessage,
  ConversationResponse,
  Idea,
  IdeaMap,
} from "packages/products/src/thoughtform/shared";
import {
  ConversationInputTooLargeError,
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/thoughtform/server/capabilities/conversation";
import type { ApiResponse } from "packages/shared/src";
import { createDraftStore } from "packages/products/src/thoughtform/server/capabilities/drafting";
import { TestDraftPersistence } from "packages/products/src/thoughtform/testing/fakes/test-draft-persistence";
import {
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_COMMAND_TYPES,
  IDEA_STRUCTURE_OPERATION_TYPES,
} from "packages/products/src/thoughtform/shared";

describe("ThoughtForm conversation route", () => {
  it("streams and retains a temporary assistant response before the Idea Map completes", async () => {
    const conversationStore = createFakeConversationStore();
    const service = new ConversationService();
    const route = createConversationRoute({
      conversationStore,
      streamingConversationService: service,
    });

    const response = await route.request("/respond-stream", {
      method: "POST",
      body: JSON.stringify({ message: "I am noticing a real tension." }),
      headers: { "content-type": "application/json" },
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(body).toContain('"type":"assistant_delta"');
    expect(body).toContain('"type":"assistant_completed"');
    expect(body).toContain('"expiresAt":"2026-08-02T12:00:00.000Z"');
    expect(body.indexOf('"type":"assistant_completed"')).toBeLessThan(
      body.indexOf('"type":"idea_map_completed"'),
    );
  });

  it("returns an assistant response and persists the turn through the host store", async () => {
    const conversationStore = createFakeConversationStore();
    const route = createConversationRoute({ conversationStore });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: null,
        message: "I can't tell whether this draft is honest.",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const body = (await response.json()) as ApiResponse<ConversationResponse>;

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      ok: true,
      data: {
        conversationId: "conversation-1",
        message: {
          role: "assistant",
        },
        activity: "discovery",
        move: "probe",
        assistantReadiness: [],
        userIntention: null,
        expiresAt: "2026-08-02T12:00:00.000Z",
      },
    });

    const responseData = body.ok ? body.data : null;
    const workspace = await conversationStore.getConversationWorkspace("conversation-1");

    expect(workspace?.messages).toEqual([
      {
        role: "user",
        content: "I can't tell whether this draft is honest.",
      },
      responseData?.message,
    ]);
  });

  it("passes existing conversation history into the conversation service", async () => {
    const conversationStore = createFakeConversationStore();
    await conversationStore.appendConversationTurn({
      conversationId: "conversation-1",
      operationId: "operation-1",
      userMessage: {
        role: "user",
        content: "Earlier thought.",
      },
      assistantMessage: {
        role: "assistant",
        content: "Earlier response.",
      },
      expectedMessageCount: 0,
      expectedIdeaMapRevision: 0,
      ideaMap: { revision: 0, ideas: [] },
    });
    let previousMessages: ConversationMessage[] | null = null;
    const conversationService = {
      async respond(request) {
        previousMessages = request.previousMessages;
        return new ConversationService().respond(request);
      },
    } satisfies ConversationResponder;
    const route = createConversationRoute({ conversationService, conversationStore });

    await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "conversation-1",
        message: "New thought.",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    expect(previousMessages).toEqual([
      {
        role: "user",
        content: "Earlier thought.",
      },
      {
        role: "assistant",
        content: "Earlier response.",
      },
    ]);
  });

  it("rejects invalid requests", async () => {
    const route = createConversationRoute({
      conversationStore: createFakeConversationStore(),
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: null,
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const body = (await response.json()) as ApiResponse<ConversationResponse>;

    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "invalid_conversation_request",
        message: "Conversation requests require a message and optional conversationId.",
      },
    });
  });

  it("rejects stale or inexact attached draft selections", async () => {
    const conversationStore = createFakeConversationStore();
    await conversationStore.appendConversationTurn({
      conversationId: "conversation-1",
      operationId: "operation-1",
      userMessage: { role: "user", content: "Earlier thought." },
      assistantMessage: { role: "assistant", content: "Earlier response." },
      expectedMessageCount: 0,
      expectedIdeaMapRevision: 0,
      ideaMap: { revision: 0, ideas: [] },
    });
    const persistence = new TestDraftPersistence();
    persistence.registerWorkspace("conversation-1");
    const drafts = createDraftStore(persistence);
    await drafts.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "The exact canonical passage.",
      createdAt: "2026-08-02T12:00:00.000Z",
    });
    const route = createConversationRoute({
      conversationStore,
      getDraftStore: async () => drafts,
    });

    const response = await route.request("/respond", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        conversationId: "conversation-1",
        message: "Discuss this.",
        draftSelection: {
          baseDraftRevision: 1,
          start: 4,
          end: 9,
          selectedText: "wrong",
        },
      }),
    });

    expect(response.status).toBe(409);
  });

  it("does not continue an unknown saved conversation", async () => {
    const route = createConversationRoute({
      conversationStore: createFakeConversationStore(),
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: "missing-conversation",
        message: "Continue this conversation.",
      }),
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "conversation_not_found",
        message: "The requested conversation was not found.",
      },
    });
  });

  it("rejects requests without an available conversation store", async () => {
    const route = createConversationRoute({
      getConversationStore: async () => null,
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: null,
        message: "This should require a session.",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const body = (await response.json()) as ApiResponse<ConversationResponse>;

    expect(response.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "unauthorized",
        message: "Sign in to continue the conversation.",
      },
    });
  });

  it("does not report success when the temporary turn cannot be retained", async () => {
    const conversationStore = createFakeConversationStore();
    const route = createConversationRoute({
      conversationStore: {
        ...conversationStore,
        appendConversationTurn: async () => ({
          status: "conversation_unavailable",
        }),
      },
    });

    const response = await route.request("/respond", {
      method: "POST",
      body: JSON.stringify({
        conversationId: null,
        message: "This turn should lose the expiry race.",
      }),
      headers: { "content-type": "application/json" },
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "conversation_unavailable",
        message: "This temporary workspace is no longer available.",
      },
    });
  });

  it.each([
    {
      error: new HostedAiDisabledError(),
      code: "hosted_ai_disabled",
      status: 503,
    },
    {
      error: new ConversationInputTooLargeError(),
      code: "conversation_input_too_large",
      status: 413,
    },
    {
      error: new HostedAiUnavailableError(),
      code: "hosted_ai_unavailable",
      status: 503,
    },
  ])(
    "returns $code without creating or appending a temporary conversation",
    async ({ error, code, status }) => {
      const conversationStore = createFakeConversationStore();
      const route = createConversationRoute({
        conversationStore,
        conversationService: {
          async respond() {
            throw error;
          },
        },
      });

      const response = await route.request("/respond", {
        method: "POST",
        body: JSON.stringify({ conversationId: null, message: "Keep this" }),
        headers: { "content-type": "application/json" },
      });

      expect(response.status).toBe(status);
      await expect(response.json()).resolves.toMatchObject({
        ok: false,
        error: { code },
      });
      await expect(conversationStore.getCurrentConversation()).resolves.toBeNull();
    },
  );

  it("applies an explicit temporary idea action and advances the revision", async () => {
    const conversationStore = createFakeConversationStore();
    const conversationId = conversationStore.createConversationId();
    await conversationStore.replaceIdeaMap({
      conversationId,
      operationId: "operation-1",
      expectedRevision: 0,
      ideaMap: {
        revision: 1,
        ideas: [
          {
            id: "idea-1",
            title: "A tangent",
            synthesis: "A possible tangent.",
            substance: "This may not belong.",
            unresolvedQuestions: [],
            assistantAssessment: {
              exploration: "emerging",
              importance: "background",
            },
            userInterpretation: null,
            disposition: "active",
          },
        ],
      },
    });
    const route = createConversationRoute({ conversationStore });
    const response = await route.request(
      `/${conversationId}/ideas/idea-1`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "dismiss", expectedRevision: 1 }),
      },
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        status: "changed",
        ideaMap: { revision: 2, ideas: [{ disposition: "dismissed" }] },
      },
    });
  });

  it("returns the current idea map when an explicit action is stale", async () => {
    const conversationStore = createFakeConversationStore();
    const conversationId = conversationStore.createConversationId();
    await conversationStore.replaceIdeaMap({
      conversationId,
      operationId: "operation-1",
      expectedRevision: 0,
      ideaMap: {
        revision: 1,
        ideas: [
          {
            id: "idea-1",
            title: "A tangent",
            synthesis: "A possible tangent.",
            substance: "This may not belong.",
            unresolvedQuestions: [],
            assistantAssessment: {
              exploration: "emerging",
              importance: "background",
            },
            userInterpretation: null,
            disposition: "active",
          },
        ],
      },
    });
    const route = createConversationRoute({ conversationStore });
    await route.request(`/${conversationId}/ideas/idea-1`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "dismiss", expectedRevision: 1 }),
    });

    const response = await route.request(`/${conversationId}/ideas/idea-1`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "park", expectedRevision: 1 }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: {
        status: "conflict",
        ideaMap: { revision: 2, ideas: [{ disposition: "dismissed" }] },
      },
    });
  });

  it("applies and undoes a structural correction through the temporary route", async () => {
    const conversationStore = createFakeConversationStore();
    const conversationId = conversationStore.createConversationId();
    await conversationStore.replaceIdeaMap({
      conversationId,
      operationId: "operation-1",
      expectedRevision: 0,
      ideaMap: {
        revision: 1,
        ideas: [
          structuralIdea("idea-1", "First meaning."),
          structuralIdea("idea-2", "Second meaning."),
        ],
      },
    });
    const route = createConversationRoute({ conversationStore });
    const merge = await route.request(`/${conversationId}/idea-structure`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
        expectedRevision: 1,
        ideaIds: ["idea-1", "idea-2"],
        result: {
          title: "Together",
          synthesis: "One concern.",
          assistantAssessment: { exploration: "developing", importance: "central" },
        },
        explanation: "These ideas overlap.",
      }),
    });
    expect(merge.status).toBe(200);
    await expect(merge.json()).resolves.toMatchObject({
      ok: true,
      data: {
        ideaMap: {
          revision: 2,
          structuralChange: { source: IDEA_STRUCTURE_CHANGE_SOURCES.user },
        },
      },
    });

    const undo = await route.request(`/${conversationId}/idea-structure`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: IDEA_STRUCTURE_COMMAND_TYPES.undo,
        expectedRevision: 2,
      }),
    });
    expect(undo.status).toBe(200);
    await expect(undo.json()).resolves.toMatchObject({
      ok: true,
      data: { ideaMap: { revision: 3, ideas: [{ id: "idea-1" }, { id: "idea-2" }] } },
    });
  });

  it("returns the stable unavailable result when an idea action targets a lost temporary workspace", async () => {
    const route = createConversationRoute({
      conversationStore: createFakeConversationStore(),
    });
    const response = await route.request("/lost-workspace/ideas/idea-1", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "park", expectedRevision: 1 }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: {
        code: "conversation_unavailable",
        message: "This temporary workspace is no longer available.",
      },
    });
  });
});

function structuralIdea(id: string, substance: string): Idea {
  return {
    id,
    title: id,
    synthesis: `${id} synthesis`,
    substance,
    unresolvedQuestions: [],
    assistantAssessment: { exploration: "developing", importance: "central" },
    userInterpretation: null,
    disposition: "active",
  };
}

function createFakeConversationStore(): TemporaryConversationStore {
  const conversations = new Map<string, ConversationMessage[]>();
  const ideaMaps = new Map<string, IdeaMap>();
  let nextEntryNumber = 1;

  return {
    createConversationId() {
      const conversationId = `conversation-${nextEntryNumber}`;
      nextEntryNumber += 1;
      conversations.set(conversationId, []);
      ideaMaps.set(conversationId, { revision: 0, ideas: [] });
      return conversationId;
    },

    async getConversationWorkspace(conversationId: string) {
      const messages = conversations.get(conversationId);
      const ideaMap = ideaMaps.get(conversationId);
      return messages && ideaMap ? { messages: [...messages], ideaMap } : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const existingMessages = conversations.get(input.conversationId) ?? [];
      conversations.set(input.conversationId, [
        ...existingMessages,
        input.userMessage,
        input.assistantMessage,
      ]);
      ideaMaps.set(
        input.conversationId,
        input.ideaMap,
      );
      return { status: "retained" };
    },

    async appendAssistantMessage(input) {
      const existingMessages = conversations.get(input.conversationId) ?? [];
      conversations.set(input.conversationId, [...existingMessages, input.assistantMessage]);
      ideaMaps.set(input.conversationId, input.ideaMap);
      return { status: "retained" };
    },

    async replaceIdeaMap(input) {
      const current = ideaMaps.get(input.conversationId);
      if (!current) return { status: "conversation_unavailable" };
      if (current.revision !== input.expectedRevision) return { status: "conflict" };
      ideaMaps.set(input.conversationId, input.ideaMap);
      return { status: "retained" };
    },

    async getCurrentConversation() {
      const entry = [...conversations.entries()].at(-1);

      return entry
        ? {
            conversation: {
              id: entry[0],
              label: "Temporary conversation",
              createdAt: "2026-08-01T12:00:00.000Z",
              updatedAt: "2026-08-01T12:00:00.000Z",
              messages: [...entry[1]],
              ideaMap: ideaMaps.get(entry[0]) ?? { revision: 0, ideas: [] },
            },
            expiresAt: "2026-08-02T12:00:00.000Z",
          }
        : null;
    },

    async clearCurrentConversation() {
      conversations.clear();
      ideaMaps.clear();
    },
  };
}
