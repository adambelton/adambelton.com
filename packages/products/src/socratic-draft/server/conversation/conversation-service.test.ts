import { describe, expect, it } from "vitest";

import { ConversationService } from "packages/products/src/socratic-draft/server/conversation/conversation-service";

describe("ConversationService", () => {
  it("returns a minimal assistant response for a new entry", () => {
    const service = new ConversationService();

    const response = service.respond({
      entryId: null,
      message: "I keep changing my mind about what this essay is really about.",
      previousMessages: [],
    });

    expect(response).toMatchObject({
      entryId: "draft-entry",
      message: {
        role: "assistant",
      },
      move: "probe",
      state: {
        phase: "new_entry",
        exploredEnough: false,
        nearReadyToReflect: false,
        readyToReflect: false,
        shouldOfferComposition: false,
        threads: [],
        claims: [],
      },
    });
    expect(response.message.content).toContain("Share the thought");
    expect(response.suggestedReplies).toEqual([
      {
        label: "Start with a thought",
        message: "I keep changing my mind about what this essay is really about.",
      },
    ]);
  });

  it("preserves an existing entry id", () => {
    const service = new ConversationService();

    const response = service.respond({
      entryId: "entry-123",
      message: "This section feels dishonest.",
      previousMessages: [],
    });

    expect(response.entryId).toBe("entry-123");
  });
});
