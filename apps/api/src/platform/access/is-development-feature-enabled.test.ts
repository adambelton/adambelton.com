import { afterEach, describe, expect, it, vi } from "vitest";
import { isDevelopmentFeatureEnabled } from "apps/api/src/platform/access/is-development-feature-enabled";

describe("development feature gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enables features in development without imposing authentication", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(isDevelopmentFeatureEnabled(null)).toBe(true);
    expect(isDevelopmentFeatureEnabled({ user: { isOwner: false } })).toBe(true);
  });

  it("enables features only for owners outside development", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(isDevelopmentFeatureEnabled({ user: { isOwner: true } })).toBe(true);
    expect(isDevelopmentFeatureEnabled({ user: { isOwner: false } })).toBe(false);
    expect(isDevelopmentFeatureEnabled(null)).toBe(false);
  });
});
