import { Hono } from "hono";
import { getCurrentAuthSession } from "packages/auth/src/session";
import { createSocraticDraftEntryStoreResolver } from "packages/db/src";
import { createSocraticDraftApiRoute } from "packages/products/src/socratic-draft/server/http";

const getSocraticDraftEntryStore = createSocraticDraftEntryStoreResolver({
  databaseUrl: process.env.DATABASE_URL,
});

export const productsRoute = new Hono();

productsRoute.route(
  "/socratic-draft",
  createSocraticDraftApiRoute({
    getEntryStore: async (request) => {
      const session = await getCurrentAuthSession(request.headers);

      return getSocraticDraftEntryStore({
        isSignedIn: Boolean(session),
        isOwner: Boolean(session?.user.isOwner),
      });
    },
  }),
);
