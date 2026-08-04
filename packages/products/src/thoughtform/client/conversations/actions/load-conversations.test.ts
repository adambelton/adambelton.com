import { describe, expect, it, vi } from "vitest";
import {
  loadConversation,
  loadConversations,
} from "packages/products/src/thoughtform/client/conversations/actions/load-conversations";

describe("ThoughtForm conversation requests", () => {
  it("loads the owner conversation list", async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        ok: true,
        data: [
          {
            id: "conversation-1",
            label: "A saved thought",
            createdAt: "2026-07-31T10:00:00.000Z",
            updatedAt: "2026-07-31T10:05:00.000Z",
          },
        ],
      }),
    );

    await expect(loadConversations(fetcher)).resolves.toMatchObject([
      { id: "conversation-1", label: "A saved thought" },
    ]);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/products/thoughtform/conversations",
    );
  });

  it("loads an encoded conversation detail URL", async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        ok: true,
        data: {
          id: "conversation/one",
          label: "A saved thought",
          createdAt: "2026-07-31T10:00:00.000Z",
          updatedAt: "2026-07-31T10:05:00.000Z",
          messages: [{ role: "user", content: "A saved thought" }],
        },
      }),
    );

    await loadConversation("conversation/one", fetcher);

    expect(fetcher).toHaveBeenCalledWith(
      "/api/products/thoughtform/conversations/conversation%2Fone",
    );
  });

  it("surfaces an API failure", async () => {
    const fetcher = vi.fn(async () =>
      Response.json(
        {
          ok: false,
          error: {
            code: "conversation_not_found",
            message: "The requested conversation was not found.",
          },
        },
        { status: 404 },
      ),
    );

    await expect(loadConversation("missing", fetcher)).rejects.toThrow(
      "The requested conversation was not found.",
    );
  });
});
