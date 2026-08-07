export type UserSession = {
  user: { isOwner: boolean };
};

export function hasUserSession(
  session: UserSession | null,
): session is UserSession {
  return session !== null;
}
