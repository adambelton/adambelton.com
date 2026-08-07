import { createLangfuseObservability } from "apps/api/src/platform/observability/langfuse-observability";
import { describe, expect, it } from "vitest";

describe("Langfuse observability configuration", () => {
  it("stays disabled unless every credential and base URL is explicit", () => {
    expect(createLangfuseObservability({})).toBeNull();
    expect(createLangfuseObservability({ publicKey: "public" })).toBeNull();
    expect(createLangfuseObservability({
      publicKey: "public",
      secretKey: "secret",
    })).toBeNull();
  });
});
