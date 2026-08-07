// @vitest-environment happy-dom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversationMessageList } from "packages/products/src/thoughtform/client/workspace/components/ConversationMessageList";
import type { ConversationMessage } from "packages/products/src/thoughtform/shared";

const messages: ConversationMessage[] = [
  { role: "user", content: "My first thought." },
  { role: "assistant", content: "What feels important about it?" },
];

describe("ConversationMessageList", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("follows the latest message until the user deliberately scrolls upward", () => {
    const { rerender } = render(<ConversationMessageList messages={messages.slice(0, 1)} />);
    const history = screen.getByTestId("conversation-history");
    Object.defineProperties(history, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 600 },
    });

    rerender(<ConversationMessageList messages={messages} />);
    expect(history.scrollTop).toBe(600);

    history.scrollTop = 100;
    fireEvent.scroll(history);
    rerender(<ConversationMessageList messages={[
      ...messages,
      { role: "user", content: "A newer thought." },
    ]} />);

    expect(history.scrollTop).toBe(100);
  });

  it("keeps following content growth and resumes following after a new send", () => {
    const { rerender } = render(<ConversationMessageList messages={messages} />);
    const history = screen.getByTestId("conversation-history");
    Object.defineProperties(history, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 600 },
    });
    history.scrollTop = 100;
    fireEvent.scroll(history);

    rerender(<ConversationMessageList messages={[
      messages[0]!,
      { role: "assistant", content: "A longer response that is still growing." },
    ]} />);
    expect(history.scrollTop).toBe(100);

    rerender(<ConversationMessageList followLatestRequest={1} messages={messages} />);
    expect(history.scrollTop).toBe(600);
  });

  it("reveals a large assistant chunk at the target character rate", () => {
    let nextFrame: FrameRequestCallback | undefined;
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      nextFrame = callback;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    render(<ConversationMessageList
      shouldAnimateLatestAssistant
      messages={[{
        role: "assistant",
        content: "This arrived in one large chunk and should remain buffered beyond one second.",
      }]}
    />);
    const visualText = screen.getByText("Assistant").nextElementSibling
      ?.querySelector("[aria-hidden='true']");
    expect(visualText?.textContent).toBe("▍");

    for (let timestamp = 0; timestamp <= 1_000; timestamp += 100) {
      act(() => nextFrame?.(timestamp));
    }
    const revealed = visualText?.textContent?.replace("▍", "") ?? "";
    expect(revealed).toHaveLength(36);
    expect(revealed).not.toBe(
      "This arrived in one large chunk and should remain buffered beyond one second.",
    );
  });

  it("follows rendered height changes while the reader remains at the bottom", () => {
    let onResize: ResizeObserverCallback | undefined;
    vi.stubGlobal("ResizeObserver", class {
      constructor(callback: ResizeObserverCallback) {
        onResize = callback;
      }
      observe() {}
      disconnect() {}
    });
    render(<ConversationMessageList messages={messages} />);
    const history = screen.getByTestId("conversation-history");
    Object.defineProperties(history, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 600 },
    });

    act(() => onResize?.([], {} as ResizeObserver));
    expect(history.scrollTop).toBe(600);

    history.scrollTop = 100;
    fireEvent.scroll(history);
    act(() => onResize?.([], {} as ResizeObserver));
    expect(history.scrollTop).toBe(100);
  });

  it("shows canonical text immediately when reduced motion is preferred", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<ConversationMessageList
      shouldAnimateLatestAssistant
      messages={[{ role: "assistant", content: "Canonical response." }]}
    />);

    const visualText = screen.getByText("Assistant").nextElementSibling
      ?.querySelector("[aria-hidden='true']");
    expect(visualText?.textContent).toBe("Canonical response.");
  });

  it("decodes escaped Unicode in previously retained assistant text", () => {
    render(<ConversationMessageList messages={[{
      role: "assistant",
      content: "Concrete material \\u2014 what recently changed?",
    }]} />);

    expect(screen.getByLabelText("Concrete material — what recently changed?"))
      .toBeTruthy();
    expect(screen.queryByText(/\\u2014/)).toBeNull();
  });
});
