import type { Conversation } from "packages/products/src/thoughtform/shared";
import { ConversationEditor } from "packages/products/src/thoughtform/client/workspace/components/ConversationEditor";
import { sendPersistentIdeaAction } from "packages/products/src/thoughtform/client/workspace/actions/send-idea-action";
import { sendPersistentIdeaStructure } from "packages/products/src/thoughtform/client/workspace/actions/send-idea-structure";
import { sendPersistentConversationMessage } from "packages/products/src/thoughtform/client/workspace/actions/send-conversation-message";

type ConversationPageStateProps = {
  conversation: Conversation | null;
  error: string | null;
};

export function ConversationPageState({
  conversation,
  error,
}: ConversationPageStateProps) {
  if (error) {
    return (
      <p
        className="max-w-2xl text-base leading-7 text-red-700"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (!conversation) {
    return (
      <p
        aria-live="polite"
        className="max-w-2xl text-base leading-7 text-[var(--muted)]"
        role="status"
      >
        Loading saved conversation.
      </p>
    );
  }

  return (
    <ConversationEditor
      key={conversation.id}
      initialConversationId={conversation.id}
      initialMessages={conversation.messages}
      initialIdeaMap={conversation.ideaMap}
      sendIdeaAction={sendPersistentIdeaAction}
      sendIdeaStructure={sendPersistentIdeaStructure}
      sendMessage={(request, callbacks) =>
        sendPersistentConversationMessage({
          ...request,
          conversationId: conversation.id,
        }, callbacks)
      }
    />
  );
}
