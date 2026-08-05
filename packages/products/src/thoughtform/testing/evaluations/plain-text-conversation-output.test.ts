import { describe, expect, it } from "vitest";
import {
  parsePlainTextConversationOutput,
  replaceStructuredOutputContract,
  summariseConversationOutputMeasurements,
  PlainResponseDeltaDecoder,
  type ConversationOutputMeasurement,
} from "packages/products/src/thoughtform/testing/evaluations/plain-text-conversation-output";

describe("plain-text conversation output evaluation", () => {
  it("emits response text incrementally before the metadata boundary", () => {
    const decoder = new PlainResponseDeltaDecoder();
    expect(decoder.push("Hello, thoughtful ")).toBe("Hello, t");
    expect(decoder.push("world.<meta")).toBe("houghtful w");
    expect(decoder.push("data>{}")).toBe("orld.");
    expect(decoder.finish()).toBe("");
  });

  it("parses a valid envelope into the canonical product contract", () => {
    const result = parsePlainTextConversationOutput(`A useful distinction?
<metadata>{"move":"distinguish","assistantReadiness":[{"action":"reflect","assessment":"ready","explanation":null},{"action":"compose","assessment":"ready_with_uncertainty","explanation":"The practical route remains open."}],"userIntention":"reflect"}</metadata>`);

    expect(result.issues).toEqual([]);
    expect(JSON.parse(result.canonicalContent)).toMatchObject({
      response: "A useful distinction?",
      move: "distinguish",
      userIntention: "reflect",
    });
  });

  it("records malformed metadata while retaining visible response text", () => {
    const result = parsePlainTextConversationOutput(
      "Keep this response.<metadata>{bad}</metadata>",
    );
    expect(result.response).toBe("Keep this response.");
    expect(result.issues).toContain("metadata is not valid JSON");
    expect(result.issues).toContain("invalid move");
  });

  it("replaces only the output contract in the provider prompt", () => {
    const result = replaceStructuredOutputContract(
      "before<output_contract>structured</output_contract>after",
    );
    expect(result).toContain("Begin immediately with user-facing prose");
    expect(result).toMatch(/^before<output_contract>/);
    expect(result).toMatch(/<\/output_contract>after$/);
  });

  it("summarises comparable latency, usage, and contract failures", () => {
    const measurements = [
      measurement(4_000, 4_200, 8_000, []),
      measurement(6_000, 6_400, 9_000, ["invalid move"]),
    ];
    expect(summariseConversationOutputMeasurements(measurements)).toEqual({
      calls: 2,
      firstUsefulTextRangeMs: { minimum: 4_200, maximum: 6_400 },
      medianFirstProviderTokenMs: 5_000,
      medianFirstUsefulTextMs: 5_300,
      medianCompleteMs: 8_500,
      totalInputTokens: 4_000,
      totalOutputTokens: 800,
      totalReasoningTokens: 100,
      totalCacheReadTokens: 2_000,
      totalCacheWriteTokens: 2_000,
      contractFailureCount: 1,
    });
  });
});

function measurement(
  firstProviderTokenMs: number,
  firstUsefulTextMs: number,
  completeMs: number,
  contractIssues: string[],
): ConversationOutputMeasurement {
  return {
    variant: "structured",
    repetition: 1,
    turn: 1,
    firstProviderTokenMs,
    firstUsefulTextMs,
    completeMs,
    inputTokens: 2_000,
    outputTokens: 400,
    reasoningTokens: 50,
    cacheReadTokens: 1_000,
    cacheWriteTokens: 1_000,
    outputCharacters: 1_000,
    usefulCharacters: 500,
    cacheState: "read",
    contractIssues,
    model: "claude-sonnet-5",
  };
}
