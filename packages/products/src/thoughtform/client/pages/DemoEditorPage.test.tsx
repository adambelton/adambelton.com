// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoEditorPage } from "packages/products/src/thoughtform/client/pages/DemoEditorPage";
import { PRIVACY_ACKNOWLEDGEMENT_KEY } from "packages/products/src/thoughtform/client/workspace/actions/privacy-acknowledgement";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";

const components: ProductAppComponents = {
  Link: ({ children, href }) => <a href={href}>{children}</a>,
  navigate: () => undefined,
};

describe("DemoEditorPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem(PRIVACY_ACKNOWLEDGEMENT_KEY, "true");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("presents the empty temporary lifecycle without treating absence as an error", async () => {
    stubFetch(success(null));

    render(<DemoEditorPage components={components} />);

    expect(
      await screen.findByText(/24-hour lifetime begins with your first submission/i),
    ).toBeTruthy();
    expect(screen.getByText("No messages yet.")).toBeTruthy();
    expect(screen.queryByText(/could not be restored/i)).toBeNull();
  });

  it("shows a restored conversation and its fixed expiry", async () => {
    stubFetch(success(temporaryConversation()));

    render(<DemoEditorPage components={components} />);

    expect(await screen.findByText("Restored thought")).toBeTruthy();
    expect(screen.getByText(/scheduled to expire/i)).toBeTruthy();
    expect(screen.getByText(/restart or deployment may remove it sooner/i)).toBeTruthy();
  });

  it("shows expiry immediately after the first retained turn", async () => {
    stubFetch(
      success(null),
      conversationStreamResponse(),
    );

    render(<DemoEditorPage components={components} />);
    await screen.findByText(/24-hour lifetime begins/i);

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "A first thought" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("A first thought")).toBeTruthy();
    expect(await screen.findByText("A response")).toBeTruthy();
    expect(screen.getByText(/scheduled to expire/i)).toBeTruthy();
  });

  it("replaces an optimistic turn when the temporary conversation becomes unavailable", async () => {
    stubFetch(
      success(temporaryConversation()),
      failure(
        "conversation_unavailable",
        "This temporary conversation is no longer available.",
        409,
      ),
    );

    render(<DemoEditorPage components={components} />);
    await screen.findByText("Restored thought");

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "An expiring thought" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText(/temporary conversation is no longer available/i),
    ).toBeTruthy();
    expect(screen.queryByText("Restored thought")).toBeNull();
    expect(screen.queryByText("An expiring thought")).toBeNull();
    expect(screen.getByText("No messages yet.")).toBeTruthy();
    expect(screen.getByText(/24-hour lifetime begins/i)).toBeTruthy();
  });

  it("preserves the active conversation for unrelated request failures", async () => {
    stubFetch(
      success(temporaryConversation()),
      failure("model_failed", "The model could not respond.", 502),
    );

    render(<DemoEditorPage components={components} />);
    await screen.findByText("Restored thought");

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "Keep this context" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("The model could not respond.")).toBeTruthy();
    expect(screen.getByText("Restored thought")).toBeTruthy();
    expect(screen.getByDisplayValue("Keep this context")).toBeTruthy();
    expect(screen.getByText(/scheduled to expire/i)).toBeTruthy();
  });

  it("disables composition without losing work when hosted AI is disabled", async () => {
    stubFetch(
      success(temporaryConversation()),
      failure(
        "hosted_ai_disabled",
        "ThoughtForm is currently disabled.",
        503,
      ),
    );

    render(<DemoEditorPage components={components} />);
    await screen.findByText("Restored thought");

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "Keep this disabled thought" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(
      await screen.findByText("ThoughtForm is currently disabled."),
    ).toBeTruthy();
    expect(screen.getByText("Restored thought")).toBeTruthy();
    expect(screen.getByDisplayValue("Keep this disabled thought")).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Unavailable" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(screen.getByText(/scheduled to expire/i)).toBeTruthy();
  });

  it("clears messages, identity, and expiry metadata", async () => {
    stubFetch(success(temporaryConversation()), success(null));
    vi.stubGlobal("confirm", () => true);

    render(<DemoEditorPage components={components} />);
    await screen.findByText("Restored thought");

    fireEvent.click(screen.getByRole("button", { name: "Clear this conversation" }));

    await waitFor(() => {
      expect(screen.queryByText("Restored thought")).toBeNull();
    });
    expect(screen.getByText("No messages yet.")).toBeTruthy();
    expect(screen.getByText(/24-hour lifetime begins/i)).toBeTruthy();
    expect(screen.queryByText(/scheduled to expire/i)).toBeNull();
  });
});

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

function temporaryConversation() {
  return {
    conversation: {
      id: "conversation-1",
      label: "Restored thought",
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:01:00.000Z",
      messages: [{ role: "user", content: "Restored thought" }],
    },
    expiresAt: "2026-08-02T12:00:00.000Z",
  };
}

function conversationResponse(conversationId: string) {
  return {
    conversationId,
    message: { role: "assistant", content: "A response" },
    activity: "discovery",
    move: "probe",
    assistantReadiness: [],
    userIntention: null,
  };
}

function conversationStreamResponse() {
  const response = conversationResponse("conversation-1");
  const events = [
    { type: "accepted", conversationId: "conversation-1" },
    { type: "assistant_delta", delta: "A response" },
    {
      type: "assistant_completed",
      response,
      expiresAt: "2026-08-02T12:00:00.000Z",
    },
    { type: "idea_map_completed", ideaMap: { revision: 0, ideas: [] } },
    { type: "completed" },
  ];
  return new Response(events.map((event) =>
    `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
  ).join(""), {
    headers: { "content-type": "text/event-stream" },
  });
}
