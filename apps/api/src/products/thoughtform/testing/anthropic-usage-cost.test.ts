import { describe, expect, it } from "vitest";
import { estimateAnthropicUsageCost } from "apps/api/src/products/thoughtform/testing/anthropic-usage-cost";

const prices = { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 };

describe("Anthropic usage cost", () => {
  it("prices cache and output categories once", () => {
    expect(estimateAnthropicUsageCost([{
      inputTokens: 100,
      outputTokens: 20,
      cacheReadTokens: 60,
      cacheWriteTokens: 10,
    }], prices)).toBeCloseTo(0.000297);
  });

  it("requires complete provider totals", () => {
    expect(() => estimateAnthropicUsageCost([{
      inputTokens: null,
      outputTokens: 20,
      cacheReadTokens: null,
      cacheWriteTokens: null,
    }], prices)).toThrow("complete input and output totals");
  });
});
