import { useEffect, useState } from "react";
import type { ApiResponse } from "packages/shared/src";
import type { ThoughtFormRuntimeCapabilities } from "packages/products/src/thoughtform/shared";

interface RuntimeCapabilitiesState {
  data: ThoughtFormRuntimeCapabilities | null;
  isPending: boolean;
}

export function useThoughtFormRuntimeCapabilities(
  isEnabled: boolean,
): RuntimeCapabilitiesState {
  const [state, setState] = useState<RuntimeCapabilitiesState>({
    data: null,
    isPending: true,
  });

  useEffect(() => {
    if (!isEnabled) {
      setState({ data: null, isPending: false });
      return;
    }

    let isCurrent = true;

    void loadThoughtFormRuntimeCapabilities()
      .then((data) => {
        if (isCurrent) setState({ data, isPending: false });
      })
      .catch(() => {
        if (isCurrent) setState({ data: null, isPending: false });
      });

    return () => {
      isCurrent = false;
    };
  }, [isEnabled]);

  return state;
}

export async function loadThoughtFormRuntimeCapabilities(
  fetcher: typeof fetch = fetch,
): Promise<ThoughtFormRuntimeCapabilities> {
  const response = await fetcher(
    "/api/products/thoughtform/runtime-capabilities",
  );
  const body = (await response.json()) as ApiResponse<ThoughtFormRuntimeCapabilities>;

  if (!response.ok || !body.ok) {
    throw new Error("ThoughtForm availability is unavailable.");
  }

  return body.data;
}
