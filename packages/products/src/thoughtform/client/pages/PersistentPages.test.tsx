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

  it("forwards streamed assistant deltas and later Idea Map updates in the mounted editor", async () => {
    const stream = controlledConversationStream();
    stubFetch(
      success(conversation("conversation-1", [])),
      success(null),
      stream.response,
      success(null, 204),
      success(null, 204),
    );

    render(<EditorPage conversationId="conversation-1" />);
    await screen.findByText("No messages yet.");

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "Football is larger than FIFA." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    stream.send({ type: "accepted", conversationId: "conversation-1" });
    stream.send({ type: "assistant_delta", delta: "Football belongs" });
    expect(await screen.findByLabelText("Football belongs")).toBeTruthy();

    stream.send({
      type: "assistant_completed",
      response: {
        conversationId: "conversation-1",
        message: { role: "assistant", content: "Football belongs to everyone." },
        move: "probe",
        assistantReadiness: [],
        userIntention: null,
      },
    });
    expect(await screen.findByLabelText("Football belongs to everyone.")).toBeTruthy();
    expect(screen.queryByText("Football is larger than FIFA", { exact: true })).toBeNull();

    stream.send({
      type: "idea_map_completed",
      ideaMap: {
        revision: 1,
        ideas: [{
          id: "idea-football",
          title: "Football is larger than FIFA",
          synthesis: "The game's legitimacy comes from its communities.",
          substance: "Football exists beyond FIFA's leadership.",
          unresolvedQuestions: [],
          disposition: "active",
          assistantAssessment: {
            exploration: "emerging",
            importance: "supporting",
          },
          userInterpretation: null,
        }],
      },
    });
    stream.send({ type: "completed" });
    stream.close();

    await waitFor(() => {
      expect(screen.getAllByText("Football is larger than FIFA", { exact: true }))
        .toHaveLength(2);
    });
    expect(screen.getByText("Idea Map updated.")).toBeTruthy();
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

function controlledConversationStream() {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  const body = new ReadableStream<Uint8Array>({
    start(nextController) {
      controller = nextController;
    },
  });
  return {
    response: new Response(body, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    }),
    send(event: unknown) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    },
    close() {
      controller.close();
    },
  };
}
