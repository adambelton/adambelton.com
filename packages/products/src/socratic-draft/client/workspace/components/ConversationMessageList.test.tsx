// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ConversationMessageList } from "packages/products/src/socratic-draft/client/workspace/components/ConversationMessageList";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

const messages: ConversationMessage[] = [
  { role: "user", content: "My first thought." },
  { role: "assistant", content: "What feels important about it?" },
];

describe("ConversationMessageList", () => {
  afterEach(cleanup);

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
});
