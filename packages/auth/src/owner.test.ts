import { describe, expect, it } from "vitest";
import { isOwnerEmail } from "packages/auth/src/owner";

describe("isOwnerEmail", () => {
  it("matches owner emails case-insensitively", () => {
    expect(isOwnerEmail("Hello@AdamBelton.com", "hello@adambelton.com")).toBe(
      true,
    );
  });

  it("does not match a different email address", () => {
    expect(isOwnerEmail("reader@example.com", "hello@adambelton.com")).toBe(
      false,
    );
  });
});
