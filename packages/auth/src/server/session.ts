import type { AccessLevel, User } from "packages/shared/src";
import { auth } from "packages/auth/src/server/auth";

export type AuthenticatedSession = {
  user: User;
  accessLevel: AccessLevel;
};

export type CurrentAuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    isOwner: boolean;
  };
};

export async function getCurrentAuthSession(
  requestHeaders: Headers,
): Promise<CurrentAuthSession | null> {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    return null;
  }

  const user = session.user as typeof session.user & {
    isOwner?: boolean | null;
  };

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isOwner: Boolean(user.isOwner),
    },
  };
}
