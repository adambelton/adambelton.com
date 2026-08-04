import { describe, expect, it } from "vitest";
import { formatConversationDate } from "packages/products/src/thoughtform/client/conversations/actions/format-conversation-date";

describe("formatConversationDate", () => {
  it("formats conversation activity consistently in the site timezone", () => {
    expect(formatConversationDate("2026-07-31T17:05:00.000Z")).toBe(
      "31 Jul 2026, 18:05",
    );
  });
});
