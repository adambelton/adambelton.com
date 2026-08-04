import { describe, expect, it } from "vitest";
import { TestConversationModel } from "packages/products/src/thoughtform/testing/fakes";
import type { ConversationModelRequest } from "packages/products/src/thoughtform/server/capabilities/conversation";

const request: ConversationModelRequest = {
  maxOutputTokens: 100,
  messages: [{ role: "user", content: "A thought" }],
  outputFormat: { name: "test", schema: {} },
  system: "Test system",
};

describe("TestConversationModel", () => {
  it("returns scripted responses in order and reuses the final response", async () => {
    const model = new TestConversationModel([
      { content: "first" },
      (receivedRequest) => ({
        content: `second: ${receivedRequest.messages[0]?.content}`,
      }),
    ]);

    await expect(model.createResponse(request)).resolves.toEqual({
      content: "first",
    });
    await expect(model.createResponse(request)).resolves.toEqual({
      content: "second: A thought",
    });
    await expect(model.createResponse(request)).resolves.toEqual({
      content: "second: A thought",
    });
  });

  it("rejects an empty script", () => {
    expect(() => new TestConversationModel([])).toThrow(
      "requires at least one response",
    );
  });
});
