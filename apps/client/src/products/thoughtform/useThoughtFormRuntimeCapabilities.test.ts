import { describe, expect, it } from "vitest";
import {
  loadThoughtFormRuntimeCapabilities,
  shouldLoadThoughtFormRuntimeCapabilities,
} from "apps/client/src/products/thoughtform/useThoughtFormRuntimeCapabilities";

describe("ThoughtForm runtime capabilities", () => {
  it.each([
    ["", true],
    ["editor", true],
    ["privacy", false],
    ["conversations", false],
    ["conversations/conversation-1/editor", false],
  ])("scopes loading for the %s path", (productPath, expected) => {
    expect(
      shouldLoadThoughtFormRuntimeCapabilities({
        productPath,
        productSlug: "thoughtform",
      }),
    ).toBe(expected);
  });

  it("does not load capabilities for another product", () => {
    expect(
      shouldLoadThoughtFormRuntimeCapabilities({
        productPath: "",
        productSlug: "the-blackout",
      }),
    ).toBe(false);
  });

  it("loads the server-derived temporary-workspace availability", async () => {
    const fetcher = async () => new Response(JSON.stringify({
      ok: true,
      data: { temporaryWorkspaceAvailable: true },
    }), { status: 200 });

    await expect(
      loadThoughtFormRuntimeCapabilities(fetcher as typeof fetch),
    ).resolves.toEqual({ temporaryWorkspaceAvailable: true });
  });

  it("fails closed when capability delivery is unavailable", async () => {
    const fetcher = async () => new Response(JSON.stringify({
      ok: false,
      error: { code: "unavailable", message: "Unavailable" },
    }), { status: 503 });

    await expect(
      loadThoughtFormRuntimeCapabilities(fetcher as typeof fetch),
    ).rejects.toThrow("ThoughtForm availability is unavailable.");
  });
});
