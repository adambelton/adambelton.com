import type { ConversationSummary } from "packages/products/src/socratic-draft/shared";
import { SocraticDraftTextLink } from "packages/products/src/socratic-draft/client/app/SocraticDraftTextLink";
import type { ProductNavigationLink } from "packages/products/src/socratic-draft/client/app/product-app-components";

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
      <SocraticDraftTextLink
        Link={Link}
        href={`/products/socratic-draft/conversations/${conversation.id}`}
      >
        {conversation.label}
      </SocraticDraftTextLink>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Updated {formatConversationDate(conversation.updatedAt)}
      </p>
    </li>
  );
}

export function formatConversationDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(new Date(value));
}
