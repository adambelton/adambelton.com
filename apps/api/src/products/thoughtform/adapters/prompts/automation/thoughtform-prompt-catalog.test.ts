import { describe, expect, it } from "vitest";
import { thoughtFormPromptCatalog } from "apps/api/src/products/thoughtform/adapters/prompts/automation/thoughtform-prompt-catalog";

describe("ThoughtForm managed prompt fallbacks", () => {
  it("keeps one non-empty reviewed fallback for every managed prompt", () => {
    const prompts = thoughtFormPromptCatalog.map((entry) => entry.definition);

    expect(new Set(prompts.map((prompt) => prompt.name)).size).toBe(
      prompts.length,
    );
    expect(prompts.every((prompt) => prompt.fallback.trim().length > 0)).toBe(
      true,
    );
    expect(prompts.every((prompt) => prompt.fallback.startsWith("\n"))).toBe(
      true,
    );
  });
});
