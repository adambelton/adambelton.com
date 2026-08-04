import { describe, expect, it } from "vitest";
import {
  isSupportedThoughtFormAiProfile,
  projectThoughtFormOutputSchema,
} from "packages/products/src/thoughtform/server/capabilities/hosted-ai-profile";

describe("ThoughtForm hosted AI profiles", () => {
  it("accepts only explicitly tuned provider and model profiles", () => {
    expect(isSupportedThoughtFormAiProfile("anthropic", "claude-sonnet-5")).toBe(true);
    expect(isSupportedThoughtFormAiProfile("openai", "gpt-5.6-terra")).toBe(true);
    expect(isSupportedThoughtFormAiProfile("openai", "gpt-5-mini")).toBe(false);
    expect(isSupportedThoughtFormAiProfile("anthropic", "claude-unknown")).toBe(false);
    expect(isSupportedThoughtFormAiProfile("other", "model")).toBe(false);
  });

  it("owns Anthropic transport projection outside the generic client", () => {
    expect(projectThoughtFormOutputSchema("anthropic", {
      type: "object",
      properties: {
        value: { type: ["string", "null"], enum: ["one", null] },
        values: { type: "array", minItems: 2, maxItems: 2 },
      },
    })).toEqual({
      type: "object",
      properties: {
        value: { anyOf: [{ type: "string", enum: ["one"] }, { type: "null", enum: [null] }] },
        values: { type: "array", minItems: 1 },
      },
    });
  });
});
