"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import type {
  ConversationMessage,
  ConversationRequest,
  ConversationResponse,
  IdeaActionRequest,
  IdeaActionResult,
  IdeaMap,
} from "packages/products/src/socratic-draft/shared";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  EMPTY_IDEA_MAP,
  IDEA_ACTION_RESULT_STATUSES,
} from "packages/products/src/socratic-draft/shared";
import {
  CONVERSATION_STATUSES,
  ConversationComposer,
  type ConversationStatus,
} from "packages/products/src/socratic-draft/client/app/components/editor/ConversationComposer";
import { ConversationEditorIntro } from "packages/products/src/socratic-draft/client/app/components/editor/ConversationEditorIntro";
import { ConversationMessageList } from "packages/products/src/socratic-draft/client/app/components/editor/ConversationMessageList";
import { IdeaMapTracker } from "packages/products/src/socratic-draft/client/app/components/editor/IdeaMapTracker";
import {
  ConversationRequestError,
  sendConversationMessage,
} from "packages/products/src/socratic-draft/client/app/modules/editor/send-conversation-message";
import { sendTemporaryIdeaAction } from "packages/products/src/socratic-draft/client/app/modules/editor/send-idea-action";

interface ConversationEditorProps {
  canClear?: boolean;
  initialConversationId?: string | null;
  initialMessages?: ConversationMessage[];
  initialIdeaMap?: IdeaMap;
  onClear?: () => Promise<void>;
  onResponse?: (response: ConversationResponse & { expiresAt?: string }) => void;
  onUnavailable?: () => void;
  sendMessage?: (
    request: ConversationRequest,
  ) => Promise<ConversationResponse & { expiresAt?: string }>;
  sendIdeaAction?: (
    conversationId: string,
    ideaId: string,
    request: IdeaActionRequest,
  ) => Promise<IdeaActionResult>;
}

export function ConversationEditor({
  canClear = false,
  initialConversationId = null,
  initialMessages = [],
  initialIdeaMap = EMPTY_IDEA_MAP,
  onClear,
  onResponse,
  onUnavailable,
  sendMessage = sendConversationMessage,
  sendIdeaAction = sendTemporaryIdeaAction,
}: ConversationEditorProps) {
  const messageInputId = useId();
  const errorId = useId();
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [message, setMessage] = useState("");
  const [messages, setMessages] =
    useState<ConversationMessage[]>(initialMessages);
  const [ideaMap, setIdeaMap] = useState<IdeaMap>(initialIdeaMap);
  const [ideaStatus, setIdeaStatus] = useState<string | null>(null);
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
      if (response.ideaMap) {
        setIdeaMap(response.ideaMap);
      }
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
      setIdeaMap(EMPTY_IDEA_MAP);
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
        <IdeaMapTracker
          ideaMap={ideaMap}
          isBusy={status === CONVERSATION_STATUSES.sending}
          onAction={async (ideaId, request) => {
            if (!conversationId || status === CONVERSATION_STATUSES.sending) return false;
            setStatus(CONVERSATION_STATUSES.sending);
            setError(null);
            setIdeaStatus(null);
            try {
              const result = await sendIdeaAction(
                conversationId,
                ideaId,
                request,
              );
              setIdeaMap(result.ideaMap);
              if (result.status === IDEA_ACTION_RESULT_STATUSES.conflict) {
                setIdeaStatus(
                  "The idea map changed elsewhere, so it has been refreshed. Review it and try again.",
                );
                return false;
              }
              setIdeaStatus("Idea map updated.");
              return true;
            } catch (actionError) {
              setError(
                actionError instanceof Error
                  ? actionError.message
                  : "The idea could not be updated.",
              );
              return false;
            } finally {
              setStatus(CONVERSATION_STATUSES.idle);
            }
          }}
        />
        {ideaStatus ? <p className="text-sm text-[var(--muted)]" role="status">{ideaStatus}</p> : null}
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
