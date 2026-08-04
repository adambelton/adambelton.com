import type { AiProcessingDisclosure, ApiResponse } from "packages/shared/src";

export async function loadAiDisclosure(
  fetcher: typeof fetch = fetch,
): Promise<AiProcessingDisclosure> {
  const response = await fetcher("/api/products/thoughtform/ai-disclosure");
  const body = (await response.json()) as ApiResponse<AiProcessingDisclosure>;
  if (!response.ok || !body.ok) {
    throw new Error("AI processing information is unavailable.");
  }
  return body.data;
}
