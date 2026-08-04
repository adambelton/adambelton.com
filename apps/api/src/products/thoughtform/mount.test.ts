import { describe, expect, it } from "vitest";
import { app } from "apps/api/src/bootstrap/create-api";
import {
  AI_PROVIDERS,
  createConversationModel,
  createDraftModel,
  getPersistentConversationAccess,
  getTemporaryConversationAccess,
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

describe("products API route mount", () => {
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

  it("selects temporary operations for the owner without granting persistence to demo users", () => {
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
    expect(getTemporaryConversationAccess(demoSession)).toEqual({
      isSignedIn: true,
      isOwner: false,
      userId: "demo-1",
    });
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
});
