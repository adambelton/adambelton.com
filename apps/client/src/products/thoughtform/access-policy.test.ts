import { describe, expect, it } from "vitest";
import { isThoughtFormNonOwnerTemporaryAccessEnabled } from "apps/client/src/products/thoughtform/access-policy";

describe("ThoughtForm host access policy", () => {
  it("enables non-owner temporary work only in development", () => {
    expect(isThoughtFormNonOwnerTemporaryAccessEnabled({ development: true }))
      .toBe(true);
    expect(isThoughtFormNonOwnerTemporaryAccessEnabled({ development: false }))
      .toBe(false);
  });
});
