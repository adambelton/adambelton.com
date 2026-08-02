import { useEffect, useState } from "react";
import type { Conversation, DraftWorkspace } from "packages/products/src/socratic-draft/shared";
import { ConversationEditor } from "packages/products/src/socratic-draft/client/app/components/editor/ConversationEditor";
import { sendPersistentConversationMessage } from "packages/products/src/socratic-draft/client/app/modules/editor/send-conversation-message";
import { sendPersistentIdeaAction } from "packages/products/src/socratic-draft/client/app/modules/editor/send-idea-action";
import { loadConversation } from "packages/products/src/socratic-draft/client/app/modules/conversations/load-conversations";
import { loadDraft } from "packages/products/src/socratic-draft/client/app/modules/editor/draft-client";

type EditorPageProps = {
  conversationId: string;
};

export function EditorPage({
  conversationId,
}: EditorPageProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftWorkspace, setDraftWorkspace] = useState<DraftWorkspace | null>(null);

  useEffect(() => {
    let isCurrent = true;

    setConversation(null);
    setError(null);

    Promise.all([
      loadConversation(conversationId),
      loadDraft("persistent", conversationId),
    ])
      .then(([loadedConversation, loadedDraftWorkspace]) => {
        if (isCurrent) {
          setConversation(loadedConversation);
          setDraftWorkspace(loadedDraftWorkspace);
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
      draftPersistenceKind="persistent"
      initialConversationId={conversation.id}
      initialMessages={conversation.messages}
      initialIdeaMap={conversation.ideaMap}
      initialDraftWorkspace={draftWorkspace}
      sendIdeaAction={sendPersistentIdeaAction}
      sendMessage={(request) =>
        sendPersistentConversationMessage({
          ...request,
          conversationId: conversation.id,
        })
      }
    />
  );
}
