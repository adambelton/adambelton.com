import { describe, expect, it } from "vitest";
import { getThoughtFormPromptFallbackIssues } from "apps/api/src/products/thoughtform/adapters/prompts/automation/validate-thoughtform-prompt-fallbacks";
import {
  createAssignablePromptLabels,
  validatePromptContent,
} from "apps/api/src/products/thoughtform/adapters/prompts/automation/thoughtform-prompt-catalog";

describe("ThoughtForm prompt fallback validation", () => {
  it("accepts the complete checked-in catalog", () => {
    expect(getThoughtFormPromptFallbackIssues()).toEqual([]);
  });

  it("rejects missing structure, an absent leading newline, and new variables", () => {
    expect(validatePromptContent(
      "thoughtform/discovery",
      "<role>Prompt {{unexpected}}</role>",
      [],
    )).toEqual(expect.arrayContaining([
      expect.stringContaining("start with a newline"),
      expect.stringContaining("<output_contract>"),
      expect.stringContaining("variables"),
    ]));
  });

  it("does not submit Langfuse's system-managed latest label", () => {
    expect(createAssignablePromptLabels(
      ["latest", "development"],
      ["review"],
    )).toEqual(["development", "review"]);
  });
});
