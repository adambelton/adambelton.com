// @vitest-environment happy-dom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ThoughtFormOperationsPage } from "apps/client/src/platform/admin/ThoughtFormOperationsPage";

vi.mock("apps/client/src/auth", () => ({
  useAuthSession: () => ({ isPending: false, data: { user: { isOwner: true } } }),
}));

describe("ThoughtFormOperationsPage", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("shows the empty operational state", async () => {
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({
      ok: true,
      data: {
        generatedAt: "2026-08-13T12:00:00.000Z",
        currentGlobal: { operations: 0, tokens: 0, outcomes: outcomes(), resetsAt: "2026-08-14T00:00:00.000Z" },
        accounts: [],
        nextCursor: null,
      },
    })));
    render(<MemoryRouter><ThoughtFormOperationsPage /></MemoryRouter>);
    expect(await screen.findByText("No accounts are available.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Current UTC day" })).toBeTruthy();
  });
});

function outcomes() {
  return { succeeded: 0, providerFailed: 0, persistenceFailed: 0, interrupted: 0, inProgress: 0 };
}
