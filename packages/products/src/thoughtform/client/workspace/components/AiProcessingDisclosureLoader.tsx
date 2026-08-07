import { useEffect, useState } from "react";
import type { AiProcessingDisclosure } from "packages/shared/src";
import type { ProductNavigationLink } from "packages/products/src/thoughtform/client/product-app-components";
import { loadAiDisclosure } from "packages/products/src/thoughtform/client/workspace/actions/load-ai-disclosure";
import { AiProcessingDisclosure as DisclosureView } from "packages/products/src/thoughtform/client/workspace/components/AiProcessingDisclosure";

export function AiProcessingDisclosureLoader({ Link }: { Link: ProductNavigationLink }) {
  const [disclosure, setDisclosure] = useState<AiProcessingDisclosure | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    loadAiDisclosure()
      .then((value) => isCurrent && setDisclosure(value))
      .catch(() => isCurrent && setHasFailed(true));
    return () => { isCurrent = false; };
  }, []);

  return hasFailed
    ? (
      <section className="border border-[var(--line)] p-4" role="status">
        <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]">
          AI processing
        </h2>
        <p className="mt-2 text-sm leading-6">
          Current AI processing details could not be loaded. Review the product
          privacy information before continuing.
        </p>
      </section>
    )
    : <DisclosureView disclosure={disclosure} Link={Link} />;
}
