import { useEffect, useState } from "react";
import type { Conversation } from "packages/products/src/socratic-draft/shared";
import { ConversationPageState } from "packages/products/src/socratic-draft/client/app/conversations/ConversationPageState";
import { loadConversation } from "packages/products/src/socratic-draft/client/app/conversations/load-conversations";

type SocraticDraftConversationPageProps = {
  conversationId: string;
};

export function SocraticDraftConversationPage({
  conversationId,
}: SocraticDraftConversationPageProps) {
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

  return <ConversationPageState conversation={conversation} error={error} />;
}
