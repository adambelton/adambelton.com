import { describe, expect, it } from "vitest";
import { sendTemporaryIdeaAction } from "packages/products/src/thoughtform/client/workspace/actions/send-idea-action";

describe("sendTemporaryIdeaAction", () => {
  it("sends the product action with its expected map revision", async () => {
    let endpoint = "";
    let requestBody = "";
    const fetcher = async (input: string | URL | Request, init?: RequestInit) => {
      endpoint = String(input);
      requestBody = String(init?.body ?? "");
      return new Response(
        JSON.stringify({
          ok: true,
          data: { status: "changed", ideaMap: { revision: 3, ideas: [] } },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };
    const result = await sendTemporaryIdeaAction(
      "conversation-1",
      "idea-1",
      { action: "park", expectedRevision: 2 },
      fetcher,
    );
    expect(result.ideaMap.revision).toBe(3);
    expect(endpoint).toContain(
      "/conversation/conversation-1/ideas/idea-1",
    );
    expect(JSON.parse(requestBody)).toEqual({
      action: "park",
      expectedRevision: 2,
    });
  });

  it("returns the latest map when the expected revision is stale", async () => {
    const result = await sendTemporaryIdeaAction(
      "conversation-1",
      "idea-1",
      { action: "park", expectedRevision: 2 },
      async () =>
        new Response(
          JSON.stringify({
            ok: true,
            data: { status: "conflict", ideaMap: { revision: 3, ideas: [] } },
          }),
          { status: 409, headers: { "content-type": "application/json" } },
        ),
    );

    expect(result).toEqual({
      status: "conflict",
      ideaMap: { revision: 3, ideas: [] },
    });
  });
});
