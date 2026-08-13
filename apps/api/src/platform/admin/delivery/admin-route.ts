import { Hono } from "hono";
import type { CurrentAuthSession } from "packages/auth/src/server/session";
import { success, failure } from "packages/shared/src";
import {
  ReadThoughtFormOperations,
  ThoughtFormOperationsUnavailableError,
} from "apps/api/src/platform/admin/application/read-thoughtform-operations";

interface CreateAdminRouteDependencies {
  getSession(headers: Headers): Promise<CurrentAuthSession | null>;
  readThoughtFormOperations: ReadThoughtFormOperations;
}

export function createAdminRoute(dependencies: CreateAdminRouteDependencies) {
  const route = new Hono();
  route.get("/thoughtform/operations", async (context) => {
    const session = await dependencies.getSession(context.req.raw.headers);
    if (!session?.user.isOwner) {
      return context.json(failure("not_found", "Not found."), 404);
    }
    try {
      const result = await dependencies.readThoughtFormOperations.execute(
        context.req.query("cursor") || undefined,
      );
      if (result.status === "invalid_cursor") {
        return context.json(failure("invalid_cursor", "The page cursor is invalid."), 400);
      }
      return context.json(success(result.overview));
    } catch (error) {
      if (error instanceof ThoughtFormOperationsUnavailableError) {
        return context.json(failure(
          "operations_unavailable",
          "ThoughtForm operations are unavailable.",
        ), 503);
      }
      throw error;
    }
  });
  return route;
}
