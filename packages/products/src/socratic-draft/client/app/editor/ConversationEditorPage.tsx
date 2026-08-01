import { useEffect, useState } from "react";
import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";
import type { Conversation } from "packages/products/src/socratic-draft/shared";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";
import { ConversationEditor } from "packages/products/src/socratic-draft/client/app/editor/ConversationEditor";
import { PrivacyAcknowledgement } from "packages/products/src/socratic-draft/client/app/editor/PrivacyAcknowledgement";
import {
  acknowledgePrivacy,
  hasAcknowledgedPrivacy,
} from "packages/products/src/socratic-draft/client/app/editor/privacy-acknowledgement";
import {
  clearTemporaryConversation,
  loadTemporaryConversation,
} from "packages/products/src/socratic-draft/client/app/editor/temporary-conversation";

type ConversationEditorPageProps = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
};

export function ConversationEditorPage({
  accessLevel,
  components,
}: ConversationEditorPageProps) {
  const [hasAcknowledged, setHasAcknowledged] = useState(() =>
    hasAcknowledgedPrivacy(getSessionStorage()),
  );
  const [temporaryConversation, setTemporaryConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(
    accessLevel === ACCESS_LEVELS.demo,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAcknowledged || accessLevel !== ACCESS_LEVELS.demo) {
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    loadTemporaryConversation()
      .then((conversation) => {
        if (isCurrent) {
          setTemporaryConversation(conversation);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setTemporaryConversation(null);
          setLoadError(
            "Your temporary conversation could not be restored. You can safely start a new one.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [accessLevel, hasAcknowledged]);

  if (!hasAcknowledged) {
    return (
      <PrivacyAcknowledgement
        accessLevel={accessLevel}
        components={components}
        onAcknowledge={() => {
          acknowledgePrivacy(getSessionStorage());
          setHasAcknowledged(true);
        }}
      />
    );
  }

  if (isLoading) {
    return <p role="status">Restoring your temporary conversation.</p>;
  }

  return (
    <>
      {loadError ? <p role="status">{loadError}</p> : null}
      <ConversationEditor
        canClear={accessLevel === ACCESS_LEVELS.demo}
        initialConversationId={temporaryConversation?.id}
        initialMessages={temporaryConversation?.messages}
        key={temporaryConversation?.id ?? "new-conversation"}
        onClear={
          accessLevel === ACCESS_LEVELS.demo
            ? clearTemporaryConversation
            : undefined
        }
      />
    </>
  );
}

function getSessionStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}
