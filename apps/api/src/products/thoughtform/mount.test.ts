import { describe, expect, it } from "vitest";
import { app } from "apps/api/src/bootstrap/create-api";
import {
  AI_PROVIDERS,
  createAnthropicLlmClientOptions,
  createConversationModel,
  createConversationServices,
  createDraftModel,
  getPersistentConversationAccess,
  getTemporaryConversationAccess,
  parseOwnerClientObservation,
} from "apps/api/src/products/thoughtform/mount";
import {
  DisabledConversationModelAdapter,
  LlmConversationModelAdapter,
} from "apps/api/src/products/thoughtform/adapters/ai/conversation-model-adapter";
import {
  DisabledDraftModelAdapter,
  LlmDraftModelAdapter,
} from "apps/api/src/products/thoughtform/adapters/ai/draft-model-adapter";
import type { ApiResponse } from "packages/shared/src";
import type {
  ObservationContent,
  Observability,
} from "packages/observability/src";

describe("products API route mount", () => {
  it("accepts only bounded owner client timing observations", () => {
    expect(parseOwnerClientObservation({
      observationId: "123e4567-e89b-12d3-a456-426614174000",
      operation: "conversation_response",
      durationMs: 4321,
      succeeded: true,
    })).toEqual({
      observationId: "123e4567-e89b-12d3-a456-426614174000",
      operation: "conversation_response",
      durationMs: 4321,
      succeeded: true,
    });
    expect(parseOwnerClientObservation({ operation: "conversation_response", durationMs: -1 })).toBeNull();
  });

  it("traces complete owner evaluations while leaving the demo entirely unobserved", async () => {
    const observedContent: ObservationContent[] = [];
    const observability: Observability = {
      observe: (_name, _attributes, operation) => operation(),
      record() {},
      recordContent: (content) => observedContent.push(content),
    };
    const services = createConversationServices({
      async createMessage() {
        return { content: "A response", model: "model", inputTokens: 10, outputTokens: 2 };
      },
    }, observability, "anthropic");
    const request = {
      conversationId: "conversation-1",
      message: "A private thought",
      previousMessages: [],
    };

    await services.temporary.respond(request);
    expect(observedContent).toEqual([]);

    await services.persistent.respond(request);
    expect(observedContent).toEqual(expect.arrayContaining([
      expect.objectContaining({ input: expect.objectContaining({ currentMessage: "A private thought" }) }),
      expect.objectContaining({ output: expect.objectContaining({ message: expect.any(Object) }) }),
    ]));
  });

  it("selects Anthropic only with the exact kill-switch value and its own key", () => {
    expect(
      createConversationModel({
        hostedAiEnabled: "true",
        provider: AI_PROVIDERS.anthropic,
        anthropicApiKey: "test-key",
      }),
    ).toBeInstanceOf(LlmConversationModelAdapter);
    expect(
      createConversationModel({
        hostedAiEnabled: "false",
        provider: AI_PROVIDERS.anthropic,
        anthropicApiKey: "test-key",
      }),
    ).toBeInstanceOf(DisabledConversationModelAdapter);
    expect(createDraftModel({
      hostedAiEnabled: "true",
      provider: AI_PROVIDERS.anthropic,
      anthropicApiKey: "test-key",
    })).toBeInstanceOf(LlmDraftModelAdapter);
    expect(createDraftModel({
      hostedAiEnabled: "false",
      provider: AI_PROVIDERS.anthropic,
      anthropicApiKey: "test-key",
    })).toBeInstanceOf(DisabledDraftModelAdapter);
    expect(
      createConversationModel({
        hostedAiEnabled: "true",
        provider: AI_PROVIDERS.anthropic,
        anthropicApiKey: "   ",
      }),
    ).toBeInstanceOf(DisabledConversationModelAdapter);
  });

  it("maps an explicit supported Anthropic effort into the mounted client", () => {
    expect(createAnthropicLlmClientOptions({
      anthropicApiKey: "test-key",
      anthropicModel: "claude-sonnet-5",
      anthropicEffort: "medium",
    })).toEqual({
      apiKey: "test-key",
      model: "claude-sonnet-5",
      effort: "medium",
    });
    expect(createAnthropicLlmClientOptions({
      anthropicApiKey: "test-key",
      anthropicEffort: "unsupported",
    })).toBeNull();
  });

  it("retains explicitly selected OpenAI without falling back between providers", () => {
    expect(createConversationModel({
      hostedAiEnabled: "true",
      provider: AI_PROVIDERS.openAi,
      openAiApiKey: "test-key",
    })).toBeInstanceOf(LlmConversationModelAdapter);
    expect(createConversationModel({
      hostedAiEnabled: "true",
      provider: AI_PROVIDERS.anthropic,
      openAiApiKey: "test-key",
    })).toBeInstanceOf(DisabledConversationModelAdapter);
    expect(createConversationModel({
      hostedAiEnabled: "true",
      provider: "unknown",
      anthropicApiKey: "test-key",
      openAiApiKey: "test-key",
    })).toBeInstanceOf(DisabledConversationModelAdapter);
  });

  it("rejects model slugs outside ThoughtForm's explicitly supported profiles", () => {
    expect(createConversationModel({
      hostedAiEnabled: "true",
      provider: AI_PROVIDERS.anthropic,
      anthropicApiKey: "test-key",
      anthropicModel: "claude-unknown",
    })).toBeInstanceOf(DisabledConversationModelAdapter);
  });

  it("selects temporary and persistent operations only for the owner", () => {
    const ownerSession = { user: { id: "owner-1", isOwner: true } };
    const demoSession = { user: { id: "demo-1", isOwner: false } };

    expect(getTemporaryConversationAccess(ownerSession)).toEqual({
      isSignedIn: true,
      isOwner: false,
      userId: "owner-1",
    });
    expect(getPersistentConversationAccess(ownerSession)).toEqual({
      isSignedIn: true,
      isOwner: true,
      userId: "owner-1",
    });
    expect(getTemporaryConversationAccess(demoSession)).toBeNull();
    expect(getPersistentConversationAccess(demoSession)).toBeNull();
  });

  it("routes ThoughtForm conversation requests through the product API entrypoint", async () => {
    const response = await app.request(
      "/products/thoughtform/conversation/respond",
      {
        method: "POST",
        body: JSON.stringify({
          conversationId: null,
          message: "This route should be product-mounted.",
        }),
        headers: {
          "content-type": "application/json",
        },
      },
    );

    const body = (await response.json()) as ApiResponse<unknown>;

    expect(response.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "unauthorized",
        message: "Sign in to continue the conversation.",
      },
    });
  });

  it("exposes supported-provider disclosure without exposing configuration secrets", async () => {
    const response = await app.request("/products/thoughtform/ai-disclosure");
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(JSON.stringify(body)).toContain("Anthropic");
    expect(JSON.stringify(body)).toContain("OpenAI");
    expect(JSON.stringify(body)).not.toContain("apiKey");
  });

  it("does not expose persistent conversations without owner access", async () => {
    const response = await app.request("/products/thoughtform/conversations");
    const body = (await response.json()) as ApiResponse<unknown>;

    expect(response.status).toBe(404);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "not_found",
        message: "The requested resource was not found.",
      },
    });
  });

  it("does not accept client observations without owner access", async () => {
    const response = await app.request(
      "/products/thoughtform/owner-observations/client",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          observationId: "123e4567-e89b-12d3-a456-426614174000",
          operation: "conversation_response",
          durationMs: 100,
          succeeded: true,
        }),
      },
    );

    expect(response.status).toBe(404);
  });
});
