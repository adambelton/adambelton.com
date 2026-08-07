import type { UserSession } from "apps/api/src/platform/access/has-user-session";

export function isDevelopmentFeatureEnabled(
  session: UserSession | null,
): boolean {
  return Boolean(
    session?.user.isOwner || process.env.NODE_ENV === "development",
  );
}
