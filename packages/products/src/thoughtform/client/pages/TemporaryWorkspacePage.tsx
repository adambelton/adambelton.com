import { useEffect, useState } from "react";
import type { TemporaryConversation } from "packages/products/src/thoughtform/shared";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";
import { ConversationEditor } from "packages/products/src/thoughtform/client/workspace/components/ConversationEditor";
import { PrivacyAcknowledgement } from "packages/products/src/thoughtform/client/workspace/components/PrivacyAcknowledgement";
import {
  acknowledgePrivacy,
  hasAcknowledgedPrivacy,
} from "packages/products/src/thoughtform/client/workspace/actions/privacy-acknowledgement";
import {
  clearTemporaryConversation,
  loadTemporaryConversation,
} from "packages/products/src/thoughtform/client/workspace/actions/temporary-conversation";

type TemporaryWorkspacePageProps = {
  components: ProductAppComponents;
};

export function TemporaryWorkspacePage({
  components,
}: TemporaryWorkspacePageProps) {
  const [hasAcknowledged, setHasAcknowledged] = useState(() =>
    hasAcknowledgedPrivacy(getSessionStorage()),
  );
  const [temporaryConversation, setTemporaryConversation] =
    useState<TemporaryConversation | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAcknowledged) {
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);
    loadTemporaryConversation()
      .then((conversation) => {
        if (isCurrent) {
          setTemporaryConversation(conversation);
          setExpiresAt(conversation?.expiresAt ?? null);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setTemporaryConversation(null);
          setExpiresAt(null);
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
  }, [hasAcknowledged]);

  if (!hasAcknowledged) {
    return (
      <PrivacyAcknowledgement
        components={components}
        onAcknowledge={() => {
          acknowledgePrivacy(getSessionStorage());
          setIsLoading(true);
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
      <p className="mb-8 text-sm leading-6 text-[var(--muted)]" role="status">
        {expiresAt
          ? `This temporary conversation is scheduled to expire ${new Date(expiresAt).toLocaleString()}. A restart or deployment may remove it sooner.`
          : "This workspace is temporary. Its 24-hour lifetime begins with your first submission, and a restart or deployment may remove it sooner."}
      </p>
      {loadError ? <p role="status">{loadError}</p> : null}
      <ConversationEditor
        canClear
        initialConversationId={temporaryConversation?.conversation.id}
        initialMessages={temporaryConversation?.conversation.messages}
        initialIdeaMap={temporaryConversation?.conversation.ideaMap}
        onResponse={(response) => {
          const expiresAt = response.expiresAt;

          if (expiresAt) {
            setExpiresAt(expiresAt);
          }
        }}
        onUnavailable={() => {
          setTemporaryConversation(null);
          setExpiresAt(null);
        }}
        onClear={async () => {
          await clearTemporaryConversation();
          setTemporaryConversation(null);
          setExpiresAt(null);
        }}
      />
    </>
  );
}

function getSessionStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}
