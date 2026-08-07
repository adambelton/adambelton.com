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
    return (
      <section
        aria-labelledby="ai-processing-title"
        className="border border-[var(--line)] p-4"
      >
        <h2
          className="m-0 text-lg font-semibold text-[var(--foreground)]"
          id="ai-processing-title"
        >
          AI processing
        </h2>
        <p className="mt-2 text-sm leading-6">
          Current AI processing information is loading.
        </p>
      </section>
    );
  }
  const active = disclosure.activeProvider;
  return (
    <section
      aria-labelledby="ai-processing-title"
      className="border border-[var(--line)] p-4"
    >
      <h2
        className="m-0 text-lg font-semibold text-[var(--foreground)]"
        id="ai-processing-title"
      >
        AI processing
      </h2>
      <p className="mt-2 text-sm leading-6">
        {active
          ? `Messages are currently processed by ${active.name} through its ${active.service}.`
          : "Hosted AI is not currently active."}
      </p>
      {active ? (
        <>
          <p className="mt-2 text-sm leading-6">
            {active.retentionSummary} {active.trainingSummary}
          </p>
          <details className="mt-3 text-sm leading-6">
            <summary className="w-fit cursor-pointer font-semibold underline decoration-[var(--line)] underline-offset-4">
              Data processing details
            </summary>
            <p className="mt-3">
              <TextLink href={active.policyUrl} Link={Link}>
                Verify {active.name}&apos;s current API data information
              </TextLink>
              . Supported AI subprocessors:{" "}
              {disclosure.supportedProviders
                .map((provider) => provider.name)
                .join(" and ")}.
            </p>
          </details>
        </>
      ) : null}
    </section>
  );
}
