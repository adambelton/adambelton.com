import { afterEach, describe, expect, it, vi } from "vitest";
import { hasDevelopmentFeatureAccess } from "apps/api/src/platform/access/has-development-feature-access";

describe("development feature access", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows authenticated sessions in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(hasDevelopmentFeatureAccess({ user: { isOwner: false } })).toBe(true);
    expect(hasDevelopmentFeatureAccess(null)).toBe(false);
  });

  it("allows only owners outside development", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(hasDevelopmentFeatureAccess({ user: { isOwner: true } })).toBe(true);
    expect(hasDevelopmentFeatureAccess({ user: { isOwner: false } })).toBe(false);
  });
});
