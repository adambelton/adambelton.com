import { Hono } from "hono";
import { auth, type AuthInstance } from "packages/auth/src/server/auth";

export function createAuthRoute(authInstance: AuthInstance) {
  const authRoute = new Hono();

  authRoute.on(["GET", "POST"], "/*", (context) => {
    return authInstance.handler(context.req.raw);
  });

  return authRoute;
}

export const authRoute = createAuthRoute(auth);
