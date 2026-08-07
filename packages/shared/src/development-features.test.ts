import { describe, expect, it } from "vitest";
import { isDevelopmentFeatureEnabled } from "packages/shared/src/development-features";

describe("development feature policy", () => {
  it("enables gated features only in development", () => {
    expect(isDevelopmentFeatureEnabled(true)).toBe(true);
    expect(isDevelopmentFeatureEnabled(false)).toBe(false);
  });
});
