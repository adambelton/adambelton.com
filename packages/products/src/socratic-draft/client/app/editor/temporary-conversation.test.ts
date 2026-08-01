import { describe, expect, it, vi } from "vitest";
import {
  clearTemporaryConversation,
  loadTemporaryConversation,
} from "packages/products/src/socratic-draft/client/app/editor/temporary-conversation";

describe("temporary conversation client", () => {
  it("loads the authenticated user's current conversation", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            id: "conversation-1",
            label: "A thought",
            createdAt: "2026-08-01T12:00:00.000Z",
            updatedAt: "2026-08-01T12:01:00.000Z",
            messages: [{ role: "user", content: "A thought" }],
          },
        }),
        { status: 200 },
      ),
    );

    await expect(loadTemporaryConversation(fetcher)).resolves.toMatchObject({
      id: "conversation-1",
    });
  });

  it("uses an authenticated delete request to clear the conversation", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: null }), { status: 200 }),
    );

    await clearTemporaryConversation(fetcher);

    expect(fetcher).toHaveBeenCalledWith(
      "/api/products/socratic-draft/temporary-conversation/current",
      { method: "DELETE" },
    );
  });
});
