import {
  CONVERSATION_MESSAGE_ROLES,
  type ConversationMessage,
} from "packages/products/src/socratic-draft/shared";

type ConversationMessageListProps = {
  messages: ConversationMessage[];
};

export function ConversationMessageList({
  messages,
}: ConversationMessageListProps) {
  return (
    <ol className="m-0 grid list-none gap-5 p-0" aria-label="Conversation">
      {messages.length === 0 ? (
        <li className="border-t border-[var(--line)] pt-5 text-base leading-7 text-[var(--muted)]">
          No messages yet.
        </li>
      ) : (
        messages.map((message, index) => (
          <ConversationMessageItem
            key={`${message.role}-${index}`}
            message={message}
          />
        ))
      )}
    </ol>
  );
}

type ConversationMessageItemProps = {
  message: ConversationMessage;
};

function ConversationMessageItem({ message }: ConversationMessageItemProps) {
  return (
    <li className="border-t border-[var(--line)] pt-5">
      <p className="m-0 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        {message.role === CONVERSATION_MESSAGE_ROLES.user ? "You" : "Assistant"}
      </p>
      <p className="mt-3 max-w-3xl text-base leading-7">{message.content}</p>
    </li>
  );
}
