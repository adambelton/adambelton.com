import { describe, expect, it } from "vitest";
import { createAdminRoute } from "apps/api/src/platform/admin/delivery/admin-route";
import { ReadThoughtFormOperations } from "apps/api/src/platform/admin/application/read-thoughtform-operations";

describe("admin route", () => {
  it("conceals the route from logged-out and non-owner users", async () => {
    for (const session of [null, { user: { id: "user", email: "u@example.com", name: "U", isOwner: false } }]) {
      const route = createAdminRoute({
        getSession: async () => session,
        readThoughtFormOperations: new ReadThoughtFormOperations(null),
      });
      expect((await route.request("/thoughtform/operations")).status).toBe(404);
    }
  });

  it("returns only the reader allowlist to the owner", async () => {
    const overview = {
      generatedAt: "2026-08-13T12:00:00.000Z",
      currentGlobal: { operations: 0, tokens: 0, outcomes: outcomes(), resetsAt: "2026-08-14T00:00:00.000Z" },
      accounts: [],
      nextCursor: null,
    };
    const route = createAdminRoute({
      getSession: async () => ({ user: { id: "owner", email: "owner@example.com", name: "Owner", isOwner: true } }),
      readThoughtFormOperations: new ReadThoughtFormOperations({
        async readPage() { return { status: "found", overview }; },
      }),
    });
    const response = await route.request("/thoughtform/operations");
    expect(response.status).toBe(200);
    expect(JSON.stringify(await response.json())).not.toMatch(/message|draft|prompt|idea/i);
  });
});

function outcomes() {
  return { succeeded: 0, providerFailed: 0, persistenceFailed: 0, interrupted: 0, inProgress: 0 };
}
