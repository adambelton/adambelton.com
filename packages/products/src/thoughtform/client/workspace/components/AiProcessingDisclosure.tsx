import type { AiProcessingDisclosure as Disclosure } from "packages/shared/src";
import type { ProductNavigationLink } from "packages/products/src/thoughtform/client/product-app-components";
import { TextLink } from "packages/products/src/thoughtform/client/ui/TextLink";

export function AiProcessingDisclosure({
  disclosure,
  Link,
}: {
  disclosure: Disclosure | null;
  Link: ProductNavigationLink;
}) {
  if (!disclosure) {
    return <p>Current AI processing information is loading.</p>;
  }
  const active = disclosure.activeProvider;
  return (
    <div>
      <p>
        {active
          ? `Messages are currently processed by ${active.name} through its ${active.service}.`
          : "Hosted AI is not currently active."}
      </p>
      {active ? (
        <>
          <p>{active.retentionSummary} {active.trainingSummary}</p>
          <p><TextLink href={active.policyUrl} Link={Link}>Verify {active.name}&apos;s current API data information</TextLink>.</p>
        </>
      ) : null}
      <p>
        Supported AI subprocessors: {disclosure.supportedProviders.map((provider) => provider.name).join(" and ")}.
      </p>
    </div>
  );
}
