import { describe, expect, it } from "vitest";
import { app } from "apps/api/src/bootstrap/create-api";
import {
  createConversationModel,
  createDraftModel,
  getPersistentConversationAccess,
  getTemporaryConversationAccess,
} from "apps/api/src/products/socratic-draft/mount";
import {
  DisabledConversationModelAdapter,
  LlmConversationModelAdapter,
} from "apps/api/src/products/socratic-draft/adapters/ai/conversation-model-adapter";
import {
  DisabledDraftModelAdapter,
  LlmDraftModelAdapter,
} from "apps/api/src/products/socratic-draft/adapters/ai/draft-model-adapter";
import type { ApiResponse } from "packages/shared/src";

describe("products API route mount", () => {
  it("enables OpenAI only with the exact kill-switch value and a non-empty key", () => {
    expect(
      createConversationModel({
        hostedAiEnabled: "true",
        openAiApiKey: "test-key",
      }),
    ).toBeInstanceOf(LlmConversationModelAdapter);
    expect(
      createConversationModel({
        hostedAiEnabled: "false",
        openAiApiKey: "test-key",
      }),
    ).toBeInstanceOf(DisabledConversationModelAdapter);
    expect(createDraftModel({
      hostedAiEnabled: "true",
      openAiApiKey: "test-key",
    })).toBeInstanceOf(LlmDraftModelAdapter);
    expect(createDraftModel({
      hostedAiEnabled: "false",
      openAiApiKey: "test-key",
    })).toBeInstanceOf(DisabledDraftModelAdapter);
    expect(
      createConversationModel({
        hostedAiEnabled: "true",
        openAiApiKey: "   ",
      }),
    ).toBeInstanceOf(DisabledConversationModelAdapter);
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

  it("routes Socratic Draft conversation requests through the product API entrypoint", async () => {
    const response = await app.request(
      "/products/socratic-draft/conversation/respond",
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

  it("does not expose persistent conversations without owner access", async () => {
    const response = await app.request("/products/socratic-draft/conversations");
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
