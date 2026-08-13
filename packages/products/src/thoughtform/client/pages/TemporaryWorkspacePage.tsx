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
    if (components.isTemporaryWorkspaceAvailable === false) {
      setIsLoading(false);
      return;
    }

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
            "Your temporary workspace could not be restored. You can safely start a new one.",
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
  }, [components.isTemporaryWorkspaceAvailable, hasAcknowledged]);

  if (components.isTemporaryWorkspaceAvailable === false) {
    return (
      <section aria-labelledby="workspace-unavailable-title">
        <h1
          className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
          id="workspace-unavailable-title"
        >
          Product demo unavailable
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]" role="status">
          Hosted AI is currently unavailable, so the temporary workspace cannot
          be opened. If an existing tab still contains unsent text, you can copy
          it locally, but no model operation can continue.
        </p>
      </section>
    );
  }

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
    return <p role="status">Restoring your temporary workspace.</p>;
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-[min(1rem,2vh)]">
      <div>
        <p className="w-full border-l-4 border-[var(--accent)] bg-[var(--selection)] px-4 py-[min(0.75rem,1.5vh)] text-sm leading-[min(1.5rem,3vh)]" role="status">
          {expiresAt
            ? `This temporary workspace is scheduled to expire ${new Date(expiresAt).toLocaleString()}. A restart or deployment may remove it sooner.`
            : "This workspace is temporary. Its 24-hour lifetime begins with your first submission, and a restart or deployment may remove it sooner."}
        </p>
        {loadError ? <p role="status">{loadError}</p> : null}
      </div>
      <ConversationEditor
        Link={components.Link}
        canClear
        initialConversationId={temporaryConversation?.conversation.id}
        initialMessages={temporaryConversation?.conversation.messages}
        initialIdeaMap={temporaryConversation?.conversation.ideaMap}
        leaveHref="/products/thoughtform"
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
    </div>
  );
}

function getSessionStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}
