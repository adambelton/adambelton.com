import type { ConversationSummary } from "packages/products/src/thoughtform/shared";
import { TextLink } from "packages/products/src/thoughtform/client/ui/TextLink";
import type { ProductNavigationLink } from "packages/products/src/thoughtform/client/product-app-components";
import { formatConversationDate } from "packages/products/src/thoughtform/client/conversations/actions/format-conversation-date";

type ConversationListItemProps = {
  conversation: ConversationSummary;
  Link: ProductNavigationLink;
};

export function ConversationListItem({
  conversation,
  Link,
}: ConversationListItemProps) {
  return (
    <li className="border-t border-[var(--line)] pt-5">
      <TextLink
        Link={Link}
        href={`/products/thoughtform/conversations/${conversation.id}/editor`}
      >
        {conversation.label}
      </TextLink>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Updated {formatConversationDate(conversation.updatedAt)}
      </p>
    </li>
  );
}
