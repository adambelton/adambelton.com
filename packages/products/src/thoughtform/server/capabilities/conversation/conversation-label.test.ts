import { describe, expect, it } from "vitest";
import { createConversationLabel } from "packages/products/src/thoughtform/server/capabilities/conversation/conversation-label";

describe("createConversationLabel", () => {
  it("uses a trimmed first user message", () => {
    expect(
      createConversationLabel([
        { role: "assistant", content: "What are you thinking about?" },
        { role: "user", content: "  A clearer opening  " },
      ]),
    ).toBe("A clearer opening");
  });

  it("provides a fallback when there is no user content", () => {
    expect(createConversationLabel([])).toBe("Untitled conversation");
  });

  it("truncates long labels consistently", () => {
    expect(
      createConversationLabel([{ role: "user", content: "a".repeat(100) }]),
    ).toBe(`${"a".repeat(79)}…`);
  });
});
