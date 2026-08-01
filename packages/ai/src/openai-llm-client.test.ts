import { beforeEach, describe, expect, it, vi } from "vitest";

const openAiMocks = vi.hoisted(() => ({
  createResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    responses = {
      create: openAiMocks.createResponse,
    };
  },
}));

import { OpenAiLlmClient } from "packages/ai/src/openai-llm-client";

describe("OpenAI LLM client", () => {
  beforeEach(() => {
    openAiMocks.createResponse.mockReset();
    openAiMocks.createResponse.mockResolvedValue({
      model: "test-model",
      output_text: "A response",
      usage: null,
    });
  });

  it("explicitly disables Responses API application-state storage", async () => {
    const client = new OpenAiLlmClient({
      apiKey: "test-key",
      model: "test-model",
    });

    await client.createMessage({
      maxTokens: 1024,
      system: "A system instruction",
      messages: [{ role: "user", content: "A thought" }],
    });

    expect(openAiMocks.createResponse).toHaveBeenCalledWith(
      expect.objectContaining({ max_output_tokens: 1024, store: false }),
    );
  });
});
