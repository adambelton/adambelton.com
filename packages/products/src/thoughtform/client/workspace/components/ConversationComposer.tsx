import type { FormEvent } from "react";
import { WorkspaceButton } from "packages/products/src/thoughtform/client/workspace/components/WorkspaceButton";

export const CONVERSATION_STATUSES = {
  disabled: "disabled",
  idle: "idle",
  sending: "sending",
} as const;

export type ConversationStatus =
  (typeof CONVERSATION_STATUSES)[keyof typeof CONVERSATION_STATUSES];

export interface ConversationComposerProps {
  canSubmit: boolean;
  error: string | null;
  errorId: string;
  message: string;
  messageInputId: string;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: ConversationStatus;
}

export function ConversationComposer({
  canSubmit,
  error,
  errorId,
  message,
  messageInputId,
  onMessageChange,
  onSubmit,
  status,
}: ConversationComposerProps) {
  return (
    <form
      aria-describedby={error ? errorId : undefined}
      className="grid gap-[min(0.75rem,1.5vh)] border-t border-[var(--line)] pt-[min(1rem,2vh)]"
      onSubmit={onSubmit}
    >
      <label className="text-sm font-semibold" htmlFor={messageInputId}>
        What are you thinking?
      </label>
      <textarea
        className="field-control min-h-[min(6rem,12vh)] resize-y p-3 text-base leading-[min(1.75rem,4vh)]"
        disabled={status !== CONVERSATION_STATUSES.idle}
        id={messageInputId}
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder="Say what you would like to think through."
        value={message}
      />
      {error ? (
        <p
          className="m-0 text-sm font-semibold text-[var(--accent)]"
          id={errorId}
        >
          {error}
        </p>
      ) : null}
      <WorkspaceButton
        className="text-sm"
        disabled={!canSubmit}
        type="submit"
      >
        {status === CONVERSATION_STATUSES.disabled
            ? "Unavailable"
            : "Send"}
      </WorkspaceButton>
    </form>
  );
}
