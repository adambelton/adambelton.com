import { afterEach, describe, expect, it, vi } from "vitest";
import {
  composeDraft,
  DraftClientError,
} from "packages/products/src/thoughtform/client/workspace/actions/draft-client";
import { WORKSPACE_PERSISTENCE_TYPES } from "packages/products/src/thoughtform/shared";

describe("draft client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("presents only the safe allowance from a hosted limit response", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({
      ok: false,
      error: {
        code: "hosted_usage_limited",
        message: "This workspace has reached its current hosted usage allowance.",
      },
      allowance: {
        remainingOperations: 0,
        resetsAt: "2026-08-14T00:00:00.000Z",
      },
    }), { status: 429 }));

    const error = await composeDraft(
      WORKSPACE_PERSISTENCE_TYPES.temporary,
      "conversation-1",
      { selectedIdeaIds: ["idea-1"], instruction: "Compose." },
    ).catch((requestError: unknown) => requestError);

    expect(error).toBeInstanceOf(DraftClientError);
    expect(error).toMatchObject({
      code: "hosted_usage_limited",
      allowance: { remainingOperations: 0 },
    });
    expect((error as Error).message).toContain("0 hosted operations remain");
  });
});
