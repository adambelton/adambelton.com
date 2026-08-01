import { useEffect, useState } from "react";
import type { Conversation } from "packages/products/src/socratic-draft/shared";
import { ConversationEditor } from "packages/products/src/socratic-draft/client/app/components/editor/ConversationEditor";
import { sendPersistentConversationMessage } from "packages/products/src/socratic-draft/client/app/modules/editor/send-conversation-message";
import { loadConversation } from "packages/products/src/socratic-draft/client/app/modules/conversations/load-conversations";

type EditorPageProps = {
  conversationId: string;
};

export function EditorPage({
  conversationId,
}: EditorPageProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    setConversation(null);
    setError(null);

    loadConversation(conversationId)
      .then((loadedConversation) => {
        if (isCurrent) {
          setConversation(loadedConversation);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "The saved conversation could not be loaded.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [conversationId]);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  if (!conversation) {
    return <p role="status">Loading the saved conversation.</p>;
  }

  return (
    <ConversationEditor
      initialConversationId={conversation.id}
      initialMessages={conversation.messages}
      sendMessage={(request) =>
        sendPersistentConversationMessage({
          ...request,
          conversationId: conversation.id,
        })
      }
    />
  );
}
