import { beforeEach, describe, expect, it, vi } from "vitest";

const openAiMocks = vi.hoisted(() => ({
  createResponse: vi.fn(),
  streamResponse: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    responses = {
      create: openAiMocks.createResponse,
      stream: openAiMocks.streamResponse,
    };
  },
}));

import { OpenAiLlmClient } from "packages/ai/src/providers/openai-llm-client";
import { LLM_STREAM_EVENT_TYPES } from "packages/ai/src/contracts/types";

describe("OpenAI LLM client", () => {
  beforeEach(() => {
    openAiMocks.createResponse.mockReset();
    openAiMocks.streamResponse.mockReset();
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

  it("streams text deltas and a normalized completed response", async () => {
    openAiMocks.streamResponse.mockReturnValue({
      async *[Symbol.asyncIterator]() {
        yield { type: "response.output_text.delta", delta: "A " };
        yield { type: "response.output_text.delta", delta: "response" };
      },
      finalResponse: vi.fn().mockResolvedValue({
        model: "test-model",
        output_text: "A response",
        status: "completed",
        usage: {
          input_tokens: 20,
          output_tokens: 4,
          input_tokens_details: { cached_tokens: 5 },
          output_tokens_details: { reasoning_tokens: 2 },
        },
      }),
    });
    const client = new OpenAiLlmClient({ apiKey: "test-key", model: "test-model" });

    const events = [];
    for await (const event of client.streamMessage({
      maxTokens: 1_024,
      system: "Stable instructions.",
      context: "Changing workspace context.",
      messages: [{ role: "user", content: "A thought" }],
    })) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: LLM_STREAM_EVENT_TYPES.textDelta, text: "A " },
      { type: LLM_STREAM_EVENT_TYPES.textDelta, text: "response" },
      {
        type: LLM_STREAM_EVENT_TYPES.completed,
        response: {
          content: "A response",
          inputTokens: 20,
          outputTokens: 4,
          reasoningTokens: 2,
          cacheReadTokens: 5,
          model: "test-model",
        },
      },
    ]);
    expect(openAiMocks.streamResponse).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: "Stable instructions.\n\nChanging workspace context.",
        store: false,
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
