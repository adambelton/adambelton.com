import { useEffect, useState } from "react";
import type { ConversationSummary } from "packages/products/src/socratic-draft/shared";
import { SocraticDraftTextLink } from "packages/products/src/socratic-draft/client/app/SocraticDraftTextLink";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";
import { ConversationListState } from "packages/products/src/socratic-draft/client/app/conversations/ConversationListState";
import { loadConversations } from "packages/products/src/socratic-draft/client/app/conversations/load-conversations";

type SocraticDraftConversationsPageProps = {
  components: ProductAppComponents;
};

export function SocraticDraftConversationsPage({
  components,
}: SocraticDraftConversationsPageProps) {
  const [conversations, setConversations] =
    useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    loadConversations()
      .then((loadedConversations) => {
        if (isCurrent) {
          setConversations(loadedConversations);
        }
      })
      .catch((loadError: unknown) => {
        if (isCurrent) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Saved conversations could not be loaded.",
          );
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section aria-labelledby="conversations-title">
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        The Socratic Draft
      </p>
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl"
        id="conversations-title"
      >
        Conversations
      </h1>

      <ConversationListState
        Link={components.Link}
        conversations={conversations}
        error={error}
      />

      <p className="mt-8 text-base leading-7 text-[var(--muted)]">
        <SocraticDraftTextLink
          Link={components.Link}
          href="/products/socratic-draft/editor"
        >
          Start a new conversation
        </SocraticDraftTextLink>
      </p>
    </section>
  );
}
