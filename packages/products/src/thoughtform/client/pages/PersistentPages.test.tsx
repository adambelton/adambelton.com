// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversationsPage } from "packages/products/src/thoughtform/client/pages/ConversationsPage";
import { EditorPage } from "packages/products/src/thoughtform/client/pages/EditorPage";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("persistent conversation pages", () => {
  it("creates a persistent conversation and navigates to its editor", async () => {
    const navigate = vi.fn();
    const components = createComponents(navigate);
    const fetcher = stubFetch(
      success([]),
      success(conversation("conversation-2", []), 201),
    );

    render(<ConversationsPage components={components} />);
    await screen.findByText("No saved conversations yet.");

    fireEvent.click(
      screen.getByRole("button", { name: "Create a new conversation" }),
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(
        "/products/thoughtform/conversations/conversation-2/editor",
      );
    });
    expect(fetcher).toHaveBeenLastCalledWith(
      "/api/products/thoughtform/conversations",
      { method: "POST" },
    );
  });

  it("clears stale errors and content when the persistent id changes", async () => {
    stubFetch(
      failure(
        "conversation_not_found",
        "The requested conversation was not found.",
        404,
      ),
      success(null),
      success(
        conversation("conversation-2", [
          { role: "user", content: "A valid saved thought" },
        ]),
      ),
      success(null),
    );

    const { rerender } = render(
      <EditorPage conversationId="missing-conversation" />,
    );
    expect(
      await screen.findByText("The requested conversation was not found."),
    ).toBeTruthy();

    rerender(<EditorPage conversationId="conversation-2" />);

    expect(await screen.findByText("A valid saved thought")).toBeTruthy();
    expect(
      screen.queryByText("The requested conversation was not found."),
    ).toBeNull();
  });

  it("preserves a persistent conversation and rejected text when hosted AI is unavailable", async () => {
    stubFetch(
      success(
        conversation("conversation-1", [
          { role: "user", content: "A retained saved thought" },
        ]),
      ),
      success(null),
      failure(
        "hosted_ai_unavailable",
        "ThoughtForm could not respond. Try again shortly.",
        503,
      ),
    );

    render(<EditorPage conversationId="conversation-1" />);
    await screen.findByText("A retained saved thought");

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "Retry this saved thought" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText(/could not respond/i),
    ).toBeTruthy();
    expect(screen.getByText("A retained saved thought")).toBeTruthy();
    expect(screen.getByDisplayValue("Retry this saved thought")).toBeTruthy();
  });
});

function createComponents(
  navigate: ProductAppComponents["navigate"],
): ProductAppComponents {
  return {
    Link: ({ children, href }) => <a href={href}>{children}</a>,
    navigate,
  };
}

function stubFetch(...responses: Response[]) {
  const fetcher = vi.fn<typeof fetch>();
  for (const response of responses) {
    fetcher.mockResolvedValueOnce(response);
  }
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}

function success(data: unknown, status = 200) {
  return new Response(JSON.stringify({ ok: true, data }), { status });
}

function failure(code: string, message: string, status: number) {
  return new Response(
    JSON.stringify({ ok: false, error: { code, message } }),
    { status },
  );
}

function conversation(id: string, messages: unknown[]) {
  return {
    id,
    label: "A conversation",
    createdAt: "2026-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
    messages,
  };
}
