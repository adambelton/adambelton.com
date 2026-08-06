import { describe, expect, it } from "vitest";
import { formatPublicDate } from "apps/client/src/website/content/formatPublicDate";

describe("formatPublicDate", () => {
  it("formats an ISO date for public display without changing timezone", () => {
    expect(formatPublicDate("2026-08-06")).toBe("6 August 2026");
  });
});
