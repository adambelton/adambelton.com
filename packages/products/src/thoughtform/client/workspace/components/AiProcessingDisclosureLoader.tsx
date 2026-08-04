import { useEffect, useState } from "react";
import type { AiProcessingDisclosure } from "packages/shared/src";
import type { ProductNavigationLink } from "packages/products/src/thoughtform/client/product-app-components";
import { loadAiDisclosure } from "packages/products/src/thoughtform/client/workspace/actions/load-ai-disclosure";
import { AiProcessingDisclosure as DisclosureView } from "packages/products/src/thoughtform/client/workspace/components/AiProcessingDisclosure";

export function AiProcessingDisclosureLoader({ Link }: { Link: ProductNavigationLink }) {
  const [disclosure, setDisclosure] = useState<AiProcessingDisclosure | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    loadAiDisclosure()
      .then((value) => current && setDisclosure(value))
      .catch(() => current && setFailed(true));
    return () => { current = false; };
  }, []);

  return failed
    ? <p role="status">Current AI processing details could not be loaded. Review the product privacy information before continuing.</p>
    : <DisclosureView disclosure={disclosure} Link={Link} />;
}
