import { describe, expect, it, vi } from "vitest";
import { createPersistentConversation } from "packages/products/src/thoughtform/client/conversations/actions/create-conversation";

describe("createPersistentConversation", () => {
  it("creates the persistent identity before the editor is opened", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            id: "conversation-2",
            label: "New conversation",
            createdAt: "2026-08-01T12:00:00.000Z",
            updatedAt: "2026-08-01T12:00:00.000Z",
            messages: [],
          },
        }),
        { status: 201 },
      ),
    );

    await expect(createPersistentConversation(fetcher)).resolves.toMatchObject({
      id: "conversation-2",
      messages: [],
    });
    expect(fetcher).toHaveBeenCalledWith(
      "/api/products/thoughtform/conversations",
      { method: "POST" },
    );
  });
});
