import { useEffect, useState } from "react";
import {
  WORKSPACE_PERSISTENCE_TYPES,
  type Conversation,
  type DraftingState,
} from "packages/products/src/thoughtform/shared";
import { ConversationEditor } from "packages/products/src/thoughtform/client/workspace/components/ConversationEditor";
import { sendPersistentConversationMessage } from "packages/products/src/thoughtform/client/workspace/actions/send-conversation-message";
import { sendPersistentIdeaAction } from "packages/products/src/thoughtform/client/workspace/actions/send-idea-action";
import { loadConversation } from "packages/products/src/thoughtform/client/conversations/actions/load-conversations";
import { loadDraft } from "packages/products/src/thoughtform/client/workspace/actions/draft-client";

type EditorPageProps = {
  conversationId: string;
};

export function EditorPage({
  conversationId,
}: EditorPageProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftingState, setDraftingState] = useState<DraftingState | null>(null);

  useEffect(() => {
    let isCurrent = true;

    setConversation(null);
    setError(null);

    Promise.all([
      loadConversation(conversationId),
      loadDraft(WORKSPACE_PERSISTENCE_TYPES.persistent, conversationId),
    ])
      .then(([loadedConversation, loadedDraftingState]) => {
        if (isCurrent) {
          setConversation(loadedConversation);
          setDraftingState(loadedDraftingState);
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
      draftPersistenceType={WORKSPACE_PERSISTENCE_TYPES.persistent}
      initialConversationId={conversation.id}
      initialMessages={conversation.messages}
      initialIdeaMap={conversation.ideaMap}
      initialDraftingState={draftingState}
      sendIdeaAction={sendPersistentIdeaAction}
      sendMessage={(request, callbacks) =>
        sendPersistentConversationMessage({
          ...request,
          conversationId: conversation.id,
        }, callbacks)
      }
    />
  );
}
