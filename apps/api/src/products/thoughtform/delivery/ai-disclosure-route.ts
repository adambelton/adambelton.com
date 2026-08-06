import { Hono } from "hono";
import {
  getAiProviderDisclosure,
  listAiProviderDisclosures,
} from "packages/ai/src";

export function createThoughtFormAiDisclosureRoute(input: {
  activeProvider: string | null;
}) {
  const route = new Hono();
  route.get("/", (context) => context.json({
    ok: true as const,
    data: {
      activeProvider: input.activeProvider
        ? getAiProviderDisclosure(input.activeProvider)
        : null,
      supportedProviders: listAiProviderDisclosures(),
    },
  }));
  return route;
}
