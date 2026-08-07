import { describe, expect, it } from "vitest";
import { hasUserSession } from "apps/api/src/platform/access/has-user-session";

describe("user session access", () => {
  it("distinguishes authenticated and anonymous requests", () => {
    expect(hasUserSession({ user: { isOwner: false } })).toBe(true);
    expect(hasUserSession(null)).toBe(false);
  });
});
