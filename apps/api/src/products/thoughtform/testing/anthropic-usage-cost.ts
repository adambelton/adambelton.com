export interface AnthropicUsageForCost {
  inputTokens: number | null;
  outputTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
}

export interface AnthropicTokenPricesPerMillion {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export function estimateAnthropicUsageCost(
  attempts: readonly AnthropicUsageForCost[],
  prices: AnthropicTokenPricesPerMillion,
) {
  return attempts.reduce((total, attempt) => {
    if (attempt.inputTokens === null || attempt.outputTokens === null) {
      throw new Error("Cannot estimate hosted usage cost without complete input and output totals.");
    }
    const cacheReadTokens = attempt.cacheReadTokens ?? 0;
    const cacheWriteTokens = attempt.cacheWriteTokens ?? 0;
    const ordinaryInputTokens = Math.max(
      0,
      attempt.inputTokens - cacheReadTokens - cacheWriteTokens,
    );
    return total + (
      ordinaryInputTokens * prices.input +
      attempt.outputTokens * prices.output +
      cacheReadTokens * prices.cacheRead +
      cacheWriteTokens * prices.cacheWrite
    ) / 1_000_000;
  }, 0);
}
