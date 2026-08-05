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

import { OpenAiLlmClient } from "packages/ai/src/providers/openai-llm-client";

describe("OpenAI LLM client", () => {
  beforeEach(() => {
    openAiMocks.createResponse.mockReset();
    openAiMocks.createResponse.mockResolvedValue({
      model: "test-model",
      output_text: "A response",
      status: "completed",
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

  it("maps a provider-neutral output format to strict Responses structured output", async () => {
    const client = new OpenAiLlmClient({ apiKey: "test-key", model: "test-model" });
    const schema = { type: "object", properties: {}, additionalProperties: false };

    await client.createMessage({
      maxTokens: 1_024,
      system: "Return structured output.",
      messages: [{ role: "user", content: "A thought" }],
      outputFormat: { name: "test_output", schema },
    });

    expect(openAiMocks.createResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        text: {
          format: {
            type: "json_schema",
            name: "test_output",
            schema,
            strict: true,
          },
        },
      }),
    );
  });

  it("preserves the combined instruction and context text", async () => {
    const client = new OpenAiLlmClient({ apiKey: "test-key", model: "test-model" });

    await client.createMessage({
      maxTokens: 1_024,
      system: "Stable instructions.",
      context: "Changing workspace context.",
      messages: [{ role: "user", content: "A thought" }],
    });

    expect(openAiMocks.createResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: "Stable instructions.\n\nChanging workspace context.",
      }),
    );
  });

  it("rejects incomplete model responses", async () => {
    openAiMocks.createResponse.mockResolvedValue({
      model: "test-model",
      output_text: '{"response":"unfinished',
      status: "incomplete",
      usage: null,
    });
    const client = new OpenAiLlmClient({
      apiKey: "test-key",
      model: "test-model",
    });

    await expect(
      client.createMessage({
        maxTokens: 4_096,
        system: "A system instruction",
        messages: [{ role: "user", content: "A thought" }],
      }),
    ).rejects.toThrow("incomplete");
  });
});
