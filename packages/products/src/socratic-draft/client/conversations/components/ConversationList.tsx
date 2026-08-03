import type { ConversationSummary } from "packages/products/src/socratic-draft/shared";
import type { ProductNavigationLink } from "packages/products/src/socratic-draft/client/product-app-components";
import { ConversationListItem } from "packages/products/src/socratic-draft/client/conversations/components/ConversationListItem";

type ConversationListProps = {
  conversations: ConversationSummary[];
  Link: ProductNavigationLink;
};

export function ConversationList({
  conversations,
  Link,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">
        No saved conversations yet.
      </p>
    );
  }

  return (
    <ol className="mt-8 grid list-none gap-5 p-0">
      {conversations.map((conversation) => (
        <ConversationListItem
          Link={Link}
          conversation={conversation}
          key={conversation.id}
        />
      ))}
    </ol>
  );
}
