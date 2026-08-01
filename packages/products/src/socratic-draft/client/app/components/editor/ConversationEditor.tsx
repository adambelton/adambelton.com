"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import type {
  ConversationMessage,
  ConversationRequest,
  ConversationResponse,
} from "packages/products/src/socratic-draft/shared";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
} from "packages/products/src/socratic-draft/shared";
import {
  CONVERSATION_STATUSES,
  ConversationComposer,
  type ConversationStatus,
} from "packages/products/src/socratic-draft/client/app/components/editor/ConversationComposer";
import { ConversationEditorIntro } from "packages/products/src/socratic-draft/client/app/components/editor/ConversationEditorIntro";
import { ConversationMessageList } from "packages/products/src/socratic-draft/client/app/components/editor/ConversationMessageList";
import {
  ConversationRequestError,
  sendConversationMessage,
} from "packages/products/src/socratic-draft/client/app/modules/editor/send-conversation-message";

type ConversationEditorProps = {
  canClear?: boolean;
  initialConversationId?: string | null;
  initialMessages?: ConversationMessage[];
  onClear?: () => Promise<void>;
  onResponse?: (response: ConversationResponse & { expiresAt?: string }) => void;
  onUnavailable?: () => void;
  sendMessage?: (
    request: ConversationRequest,
  ) => Promise<ConversationResponse & { expiresAt?: string }>;
};

export function ConversationEditor({
  canClear = false,
  initialConversationId = null,
  initialMessages = [],
  onClear,
  onResponse,
  onUnavailable,
  sendMessage = sendConversationMessage,
}: ConversationEditorProps) {
  const messageInputId = useId();
  const errorId = useId();
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [message, setMessage] = useState("");
  const [messages, setMessages] =
    useState<ConversationMessage[]>(initialMessages);
  const [status, setStatus] = useState<ConversationStatus>(
    CONVERSATION_STATUSES.idle,
  );
  const [error, setError] = useState<string | null>(null);

  const trimmedMessage = message.trim();
  const canSubmit =
    trimmedMessage.length > 0 && status === CONVERSATION_STATUSES.idle;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const userMessage: ConversationMessage = {
      role: CONVERSATION_MESSAGE_ROLES.user,
      content: trimmedMessage,
    };

    setStatus(CONVERSATION_STATUSES.sending);
    setError(null);
    setMessage("");
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    let disableAfterRequest = false;

    try {
      const response = await sendMessage({
        conversationId,
        message: trimmedMessage,
      });

      setConversationId(response.conversationId);
      setMessages((currentMessages) => [...currentMessages, response.message]);
      onResponse?.(response);
    } catch (sendError) {
      if (
        sendError instanceof ConversationRequestError &&
        onUnavailable &&
        (sendError.code === CONVERSATION_ERROR_CODES.notFound ||
          sendError.code === CONVERSATION_ERROR_CODES.unavailable)
      ) {
        setConversationId(null);
        setMessages([]);
        onUnavailable();
        setError(
          "This temporary conversation is no longer available. You can start a new conversation.",
        );
        return;
      }

      setMessage(trimmedMessage);
      setMessages((currentMessages) => currentMessages.slice(0, -1));
      if (
        sendError instanceof ConversationRequestError &&
        sendError.code === CONVERSATION_ERROR_CODES.hostedAiDisabled
      ) {
        disableAfterRequest = true;
      }
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The conversation could not continue.",
      );
    } finally {
      setStatus(
        disableAfterRequest
          ? CONVERSATION_STATUSES.disabled
          : CONVERSATION_STATUSES.idle,
      );
    }
  }

  async function handleClear() {
    if (
      !onClear ||
      !globalThis.confirm(
        "Clear this temporary conversation? This cannot be undone.",
      )
    ) {
      return;
    }

    setStatus(CONVERSATION_STATUSES.sending);
    setError(null);

    try {
      await onClear();
      setConversationId(null);
      setMessages([]);
      setMessage("");
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "The temporary conversation could not be cleared.",
      );
    } finally {
      setStatus(CONVERSATION_STATUSES.idle);
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
        {canClear && messages.length > 0 ? (
          <button
            className="w-fit text-sm underline decoration-[var(--line)] underline-offset-4"
            disabled={status === CONVERSATION_STATUSES.sending}
            onClick={handleClear}
            type="button"
          >
            Clear this conversation
          </button>
        ) : null}
      </div>
    </section>
  );
}
