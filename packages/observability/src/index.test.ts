import { describe, expect, it } from "vitest";
import {
  noOpObservability,
  OBSERVATION_ATTRIBUTE_NAMES,
} from "packages/observability/src";

describe("observability boundary", () => {
  it("is harmless until a host configures it", async () => {
    await expect(noOpObservability.observe("operation", {}, async () => "result"))
      .resolves.toBe("result");
  });

  it("defines provider-neutral metadata names separately from content", () => {
    expect(OBSERVATION_ATTRIBUTE_NAMES).toMatchObject({
      inputTokens: "input_tokens",
      cacheReadTokens: "cache_read_tokens",
      reasoningTokens: "reasoning_tokens",
    });
    expect(OBSERVATION_ATTRIBUTE_NAMES).not.toHaveProperty("input");
    expect(OBSERVATION_ATTRIBUTE_NAMES).not.toHaveProperty("output");
  });
});
