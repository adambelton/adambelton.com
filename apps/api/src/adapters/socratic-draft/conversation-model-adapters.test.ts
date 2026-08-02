import { describe, expect, it } from "vitest";
import {
  DisabledConversationModelAdapter,
  LlmConversationModelAdapter,
} from "apps/api/src/adapters/socratic-draft/conversation-model-adapters";
import type { LlmRequest } from "packages/ai/src";
import {
  HostedAiDisabledError,
  HostedAiUnavailableError,
} from "packages/products/src/socratic-draft/server/conversation";

const modelRequest = {
  maxOutputTokens: 1_024,
  messages: [{ role: "user" as const, content: "A bounded thought" }],
  outputFormat: { name: "test", schema: { type: "object" } },
  system: "System instructions",
};

describe("conversation model adapters", () => {
  it("passes the product output cap through the provider-neutral client", async () => {
    const requests: LlmRequest[] = [];
    const adapter = new LlmConversationModelAdapter({
      async createMessage(request) {
        requests.push(request);
        return { content: "A response", model: "test-model" };
      },
    });

    await adapter.createResponse(modelRequest);

    expect(requests).toEqual([
      {
        maxTokens: 1_024,
        messages: modelRequest.messages,
        outputFormat: modelRequest.outputFormat,
        system: modelRequest.system,
      },
    ]);
  });

  it("maps provider failures to a product-owned unavailable error", async () => {
    const adapter = new LlmConversationModelAdapter({
      async createMessage() {
        throw new Error("Provider detail");
      },
    });

    await expect(adapter.createResponse(modelRequest)).rejects.toBeInstanceOf(
      HostedAiUnavailableError,
    );
  });

  it("fails closed without invoking a provider when disabled", async () => {
    const adapter = new DisabledConversationModelAdapter();

    await expect(adapter.createResponse(modelRequest)).rejects.toBeInstanceOf(
      HostedAiDisabledError,
    );
  });
});
