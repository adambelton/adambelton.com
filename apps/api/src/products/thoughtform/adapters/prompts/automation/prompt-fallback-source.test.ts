import { describe, expect, it } from "vitest";
import { replacePromptFallback } from "apps/api/src/products/thoughtform/adapters/prompts/automation/prompt-fallback-source";

describe("prompt fallback source replacement", () => {
  it("replaces only the named fallback template literal", () => {
    const source = [
      "export const FIRST_FALLBACK = `first`;",
      "export const SECOND_FALLBACK = `second`;",
    ].join("\n");
    expect(replacePromptFallback(
      source,
      "SECOND_FALLBACK",
      "\n<role>changed</role>\n<output_contract>exact</output_contract>",
    )).toContain(
      "export const SECOND_FALLBACK = `\n<role>changed</role>\n<output_contract>exact</output_contract>`;",
    );
    expect(source).toContain("export const FIRST_FALLBACK = `first`;");
  });

  it("fails closed for an unknown export", () => {
    expect(() => replacePromptFallback("", "UNKNOWN", "content")).toThrow(
      "Could not find UNKNOWN",
    );
  });
});
