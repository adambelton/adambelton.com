import { Hono } from "hono";
import type { ThoughtFormRuntimeCapabilities } from "packages/products/src/thoughtform/shared";

export function createThoughtFormRuntimeCapabilitiesRoute(
  capabilities: ThoughtFormRuntimeCapabilities,
) {
  const route = new Hono();

  route.get("/", (context) => context.json({
    ok: true as const,
    data: capabilities,
  }));

  return route;
}
