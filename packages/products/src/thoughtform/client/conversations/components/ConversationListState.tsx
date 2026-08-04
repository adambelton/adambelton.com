import type { ConversationSummary } from "packages/products/src/thoughtform/shared";
import type { ProductNavigationLink } from "packages/products/src/thoughtform/client/product-app-components";
import { ConversationList } from "packages/products/src/thoughtform/client/conversations/components/ConversationList";

type ConversationListStateProps = {
  conversations: ConversationSummary[] | null;
  error: string | null;
  Link: ProductNavigationLink;
};

export function ConversationListState({
  conversations,
  error,
  Link,
}: ConversationListStateProps) {
  if (error) {
    return (
      <p
        className="mt-6 max-w-2xl text-base leading-7 text-red-700"
        role="alert"
      >
        {error}
      </p>
    );
  }

  if (conversations === null) {
    return (
      <p
        aria-live="polite"
        className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]"
        role="status"
      >
        Loading saved conversations.
      </p>
    );
  }

  return <ConversationList Link={Link} conversations={conversations} />;
}
