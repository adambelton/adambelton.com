import { useEffect, useState } from "react";
import {
  WORKSPACE_PERSISTENCE_TYPES,
  type Conversation,
  type DraftingState,
} from "packages/products/src/thoughtform/shared";
import { ConversationEditor } from "packages/products/src/thoughtform/client/workspace/components/ConversationEditor";
import { sendPersistentConversationMessage } from "packages/products/src/thoughtform/client/workspace/actions/send-conversation-message";
import { sendPersistentIdeaAction } from "packages/products/src/thoughtform/client/workspace/actions/send-idea-action";
import { sendPersistentIdeaStructure } from "packages/products/src/thoughtform/client/workspace/actions/send-idea-structure";
import { loadConversation } from "packages/products/src/thoughtform/client/conversations/actions/load-conversations";
import { loadDraft } from "packages/products/src/thoughtform/client/workspace/actions/draft-client";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";

type EditorPageProps = {
  components: ProductAppComponents;
  conversationId: string;
};

export function EditorPage({
  components,
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
      Link={components.Link}
      draftPersistenceType={WORKSPACE_PERSISTENCE_TYPES.persistent}
      initialConversationId={conversation.id}
      initialMessages={conversation.messages}
      initialIdeaMap={conversation.ideaMap}
      initialDraftingState={draftingState}
      leaveHref="/products/thoughtform/conversations"
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
