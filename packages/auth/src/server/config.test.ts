import { afterEach, describe, expect, it, vi } from "vitest";
import {
  developmentAuthSecret,
  developmentDatabaseUrl,
  getAuthClientIpHeaders,
  getAuthDatabaseUrl,
  getAuthSecret,
} from "packages/auth/src/server/config";

describe("auth config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses explicit auth secrets before development defaults", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "configured-secret");

    expect(getAuthSecret()).toBe("configured-secret");
  });

  it("uses an explicit database URL before development defaults", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://example.com/app");

    expect(getAuthDatabaseUrl()).toBe("postgresql://example.com/app");
  });

  it("normalizes configured client IP headers", () => {
    vi.stubEnv("AUTH_CLIENT_IP_HEADERS", " X-Real-IP, CF-Connecting-IP ");

    expect(getAuthClientIpHeaders()).toEqual([
      "x-real-ip",
      "cf-connecting-ip",
    ]);
  });

  it("allows development defaults outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("DATABASE_URL", "");

    expect(getAuthSecret()).toBe(developmentAuthSecret);
    expect(getAuthDatabaseUrl()).toBe(developmentDatabaseUrl);
  });

  it("requires auth config in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    vi.stubEnv("DATABASE_URL", "");

    expect(() => getAuthSecret()).toThrow("BETTER_AUTH_SECRET is required");
    expect(() => getAuthDatabaseUrl()).toThrow("DATABASE_URL is required");
  });
});
