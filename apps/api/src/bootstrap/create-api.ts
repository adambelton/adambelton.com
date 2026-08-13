import { Hono } from "hono";
import { authRoute } from "apps/api/src/platform/auth/auth-route";
import { healthRoute } from "apps/api/src/platform/health/health-route";
import { thoughtFormRoute } from "apps/api/src/products/thoughtform/mount";
import { getCurrentAuthSession } from "packages/auth/src/server/session";
import { createDatabaseClient } from "packages/db/src/client/database-client";
import { PrismaThoughtFormPortfolioDemoOperationsReader } from "packages/db/src/adapters/thoughtform/portfolio-demo-operations-reader";
import { hostedUsagePolicy } from "apps/api/src/products/thoughtform/adapters/usage/hosted-usage-policy";
import { ReadThoughtFormOperations } from "apps/api/src/platform/admin/application/read-thoughtform-operations";
import { createAdminRoute } from "apps/api/src/platform/admin/delivery/admin-route";

export const apiRoute = new Hono();

apiRoute.route("/health", healthRoute);
apiRoute.route("/products/thoughtform", thoughtFormRoute);
apiRoute.route("/admin", createAdminRoute({
  getSession: getCurrentAuthSession,
  readThoughtFormOperations: new ReadThoughtFormOperations(
    process.env.DATABASE_URL
      ? new PrismaThoughtFormPortfolioDemoOperationsReader(
          createDatabaseClient(process.env.DATABASE_URL),
          hostedUsagePolicy,
        )
      : null,
  ),
}));

export const app = new Hono();

app.route("/auth", authRoute);
app.route("/", apiRoute);
