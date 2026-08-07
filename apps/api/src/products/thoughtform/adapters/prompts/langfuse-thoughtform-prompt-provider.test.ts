import { createLangfuseThoughtFormPromptProvider } from "apps/api/src/products/thoughtform/adapters/prompts/langfuse-thoughtform-prompt-provider";
import { describe, expect, it } from "vitest";

describe("Langfuse ThoughtForm prompt provider configuration", () => {
  const defaults = { label: "development", cacheTtlSeconds: 0 };

  it("stays disabled unless every credential and base URL is explicit", () => {
    expect(createLangfuseThoughtFormPromptProvider(defaults)).toBeNull();
    expect(createLangfuseThoughtFormPromptProvider({
      ...defaults,
      publicKey: "public",
    })).toBeNull();
    expect(createLangfuseThoughtFormPromptProvider({
      ...defaults,
      publicKey: "public",
      secretKey: "secret",
    })).toBeNull();
  });
});
