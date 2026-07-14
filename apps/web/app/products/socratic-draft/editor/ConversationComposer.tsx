import type { FormEvent } from "react";

type ConversationComposerProps = {
  canSubmit: boolean;
  error: string | null;
  errorId: string;
  message: string;
  messageInputId: string;
  onMessageChange: (message: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  status: "idle" | "sending";
};

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
      className="grid gap-4 border-t border-[var(--line)] pt-6"
      onSubmit={onSubmit}
    >
      <label className="text-sm font-semibold" htmlFor={messageInputId}>
        Your next thought
      </label>
      <textarea
        className="min-h-36 resize-y border border-[var(--line)] bg-transparent p-4 text-base leading-7 text-[var(--foreground)]"
        disabled={status === "sending"}
        id={messageInputId}
        onChange={(event) => onMessageChange(event.target.value)}
        placeholder="Write the thought you want to examine."
        value={message}
      />
      {error ? (
        <p className="m-0 text-sm font-semibold text-[var(--accent)]" id={errorId}>
          {error}
        </p>
      ) : null}
      <button
        className="w-fit border border-[var(--foreground)] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)] disabled:hover:bg-transparent disabled:hover:text-[var(--muted)]"
        disabled={!canSubmit}
        type="submit"
      >
        {status === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
