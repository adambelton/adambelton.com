import { beforeEach, describe, expect, it, vi } from "vitest";

const anthropicMocks = vi.hoisted(() => ({
  createMessage: vi.fn(),
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class Anthropic {
    messages = {
      create: anthropicMocks.createMessage,
    };
  },
}));

import { AnthropicLlmClient } from "packages/ai/src/providers/anthropic-llm-client";

function completedResponse() {
  return {
    content: [{ type: "text", text: '{"response":"A response"}' }],
    model: "claude-test-model",
    stop_reason: "end_turn",
    usage: {
      cache_creation_input_tokens: 3,
      cache_read_input_tokens: 5,
      input_tokens: 20,
      output_tokens: 12,
      output_tokens_details: { thinking_tokens: 4 },
    },
  };
}

describe("Anthropic LLM client", () => {
  beforeEach(() => {
    anthropicMocks.createMessage.mockReset();
    anthropicMocks.createMessage.mockResolvedValue(completedResponse());
  });

  it("maps provider-neutral messages and structured output to the Messages API", async () => {
    const client = new AnthropicLlmClient({
      apiKey: "test-key",
      model: "claude-test-model",
    });
    const schema = {
      type: "object",
      properties: {
        response: { type: "string" },
        intention: {
          type: ["string", "null"],
          enum: ["explore", "compose", null],
        },
        readiness: {
          type: "array",
          minItems: 2,
          maxItems: 2,
          items: { type: "string" },
        },
      },
      required: ["response"],
      additionalProperties: false,
    };

    await client.createMessage({
      maxTokens: 1_024,
      system: "Return structured output.",
      messages: [{ role: "user", content: "A thought" }],
      outputFormat: { name: "thoughtform_response", schema },
      temperature: 0.2,
    });

    expect(anthropicMocks.createMessage).toHaveBeenCalledWith({
      max_tokens: 1_024,
      messages: [{ role: "user", content: "A thought" }],
      model: "claude-test-model",
      output_config: {
        format: {
          type: "json_schema",
          schema,
        },
      },
      system: "Return structured output.",
    });
  });

  it("normalizes content and inclusive provider usage", async () => {
    const client = new AnthropicLlmClient({ apiKey: "test-key" });

    await expect(client.createMessage({
      maxTokens: 1_024,
      system: "Respond.",
      messages: [{ role: "user", content: "A thought" }],
    })).resolves.toEqual({
      content: '{"response":"A response"}',
      inputTokens: 28,
      outputTokens: 12,
      reasoningTokens: 4,
      cacheReadTokens: 5,
      cacheWriteTokens: 3,
      model: "claude-test-model",
    });
  });

  it.each(["max_tokens", "refusal", "model_context_window_exceeded"])(
    "rejects a response stopped by %s",
    async (stopReason) => {
      anthropicMocks.createMessage.mockResolvedValue({
        ...completedResponse(),
        stop_reason: stopReason,
      });
      const client = new AnthropicLlmClient({ apiKey: "test-key" });

      await expect(client.createMessage({
        maxTokens: 1_024,
        system: "Respond.",
        messages: [{ role: "user", content: "A thought" }],
      })).rejects.toThrow(stopReason);
    },
  );

  it("rejects a completed response without text", async () => {
    anthropicMocks.createMessage.mockResolvedValue({
      ...completedResponse(),
      content: [],
    });
    const client = new AnthropicLlmClient({ apiKey: "test-key" });

    await expect(client.createMessage({
      maxTokens: 1_024,
      system: "Respond.",
      messages: [{ role: "user", content: "A thought" }],
    })).rejects.toThrow("did not contain text");
  });
});
