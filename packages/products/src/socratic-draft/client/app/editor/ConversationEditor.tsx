"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";
import { ConversationComposer } from "packages/products/src/socratic-draft/client/app/editor/ConversationComposer";
import { ConversationEditorIntro } from "packages/products/src/socratic-draft/client/app/editor/ConversationEditorIntro";
import { ConversationMessageList } from "packages/products/src/socratic-draft/client/app/editor/ConversationMessageList";
import { sendConversationMessage } from "packages/products/src/socratic-draft/client/app/editor/send-conversation-message";

type ConversationStatus = "idle" | "sending";

type ConversationEditorProps = {
  initialConversationId?: string | null;
  initialMessages?: ConversationMessage[];
};

export function ConversationEditor({
  initialConversationId = null,
  initialMessages = [],
}: ConversationEditorProps) {
  const messageInputId = useId();
  const errorId = useId();
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [message, setMessage] = useState("");
  const [messages, setMessages] =
    useState<ConversationMessage[]>(initialMessages);
  const [status, setStatus] = useState<ConversationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length > 0 && status !== "sending";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const userMessage: ConversationMessage = {
      role: "user",
      content: trimmedMessage,
    };

    setStatus("sending");
    setError(null);
    setMessage("");
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const response = await sendConversationMessage({
        conversationId,
        message: trimmedMessage,
      });

      setConversationId(response.conversationId);
      setMessages((currentMessages) => [...currentMessages, response.message]);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The conversation could not continue.",
      );
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section aria-labelledby="editor-title">
      <ConversationEditorIntro />

      <div className="mt-12 grid gap-8">
        <ConversationMessageList messages={messages} />
        <ConversationComposer
          canSubmit={canSubmit}
          error={error}
          errorId={errorId}
          message={message}
          messageInputId={messageInputId}
          onMessageChange={setMessage}
          onSubmit={handleSubmit}
          status={status}
        />
      </div>
    </section>
  );
}
