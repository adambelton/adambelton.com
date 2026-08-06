import { Hono } from "hono";
import type { Observability } from "packages/observability/src";

type OwnerSession = { user: { isOwner: boolean } } | null;

export function createThoughtFormOwnerObservationRoute(input: {
  getSession(headers: Headers): Promise<OwnerSession>;
  observability: Observability;
}) {
  const route = new Hono();
  route.post("/client", async (context) => {
    const session = await input.getSession(context.req.raw.headers);
    if (!session?.user.isOwner) {
      return context.json({
        ok: false as const,
        error: { code: "not_found", message: "Not found." },
      }, 404);
    }
    const observation = parseOwnerClientObservation(
      await context.req.json().catch(() => null),
    );
    if (!observation) {
      return context.json({
        ok: false as const,
        error: { code: "invalid_request", message: "Invalid observation." },
      }, 400);
    }
    await input.observability.observe(
      "thoughtform.client.conversation_response",
      {
        correlation_id: observation.observationId,
        operation: observation.operation,
        client_duration_ms: observation.durationMs,
        result: observation.succeeded ? "success" : "failure",
      },
      async () => undefined,
    );
    return context.body(null, 204);
  });
  return route;
}

export function parseOwnerClientObservation(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.observationId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(candidate.observationId) ||
    (candidate.operation !== "conversation_response" &&
      candidate.operation !== "conversation_first_token") ||
    typeof candidate.durationMs !== "number" ||
    !Number.isInteger(candidate.durationMs) ||
    candidate.durationMs < 0 ||
    candidate.durationMs > 300_000 ||
    typeof candidate.succeeded !== "boolean"
  ) {
    return null;
  }
  return {
    observationId: candidate.observationId,
    operation: candidate.operation,
    durationMs: candidate.durationMs,
    succeeded: candidate.succeeded,
  };
}
