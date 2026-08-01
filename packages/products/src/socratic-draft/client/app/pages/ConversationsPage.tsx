import { useEffect, useState } from "react";
import type { ConversationSummary } from "packages/products/src/socratic-draft/shared";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/app/product-app-components";
import { ConversationListState } from "packages/products/src/socratic-draft/client/app/components/conversations/ConversationListState";
import { loadConversations } from "packages/products/src/socratic-draft/client/app/modules/conversations/load-conversations";
import { createPersistentConversation } from "packages/products/src/socratic-draft/client/app/modules/conversations/create-conversation";

type ConversationsPageProps = {
  components: ProductAppComponents;
};

export function ConversationsPage({
  components,
}: ConversationsPageProps) {
  const [conversations, setConversations] =
    useState<ConversationSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

      <button
        className="mt-8 w-fit text-base underline decoration-[var(--line)] underline-offset-4"
        disabled={isCreating}
        onClick={async () => {
          setIsCreating(true);
          setError(null);

          try {
            const conversation = await createPersistentConversation();
            components.navigate(
              `/products/socratic-draft/conversations/${conversation.id}/editor`,
            );
          } catch (createError) {
            setError(
              createError instanceof Error
                ? createError.message
                : "The conversation could not be created.",
            );
            setIsCreating(false);
          }
        }}
        type="button"
      >
        {isCreating ? "Creating conversation" : "Create a new conversation"}
      </button>
    </section>
  );
}
