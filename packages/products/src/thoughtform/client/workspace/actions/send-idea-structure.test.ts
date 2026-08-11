import { describe, expect, it, vi } from "vitest";
import { sendTemporaryIdeaStructure } from "packages/products/src/thoughtform/client/workspace/actions/send-idea-structure";
import {
  IDEA_ACTION_RESULT_STATUSES,
  IDEA_STRUCTURE_COMMAND_TYPES,
} from "packages/products/src/thoughtform/shared";

describe("sendTemporaryIdeaStructure", () => {
  it("sends an optimistic structural command and returns the current map", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      ok: true,
      data: {
        status: IDEA_ACTION_RESULT_STATUSES.changed,
        ideaMap: { revision: 3, ideas: [] },
      },
    })));
    const result = await sendTemporaryIdeaStructure(
      "conversation/1",
      { type: IDEA_STRUCTURE_COMMAND_TYPES.undo, expectedRevision: 2 },
      fetcher,
    );
    expect(fetcher).toHaveBeenCalledWith(
      "/api/products/thoughtform/conversation/conversation%2F1/idea-structure",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          type: IDEA_STRUCTURE_COMMAND_TYPES.undo,
          expectedRevision: 2,
        }),
      }),
    );
    expect(result.ideaMap.revision).toBe(3);
  });
});
