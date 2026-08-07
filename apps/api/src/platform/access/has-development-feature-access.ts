export type DevelopmentFeatureSession = {
  user: { isOwner: boolean };
};

export function hasDevelopmentFeatureAccess(
  session: DevelopmentFeatureSession | null,
): session is DevelopmentFeatureSession {
  return Boolean(
    session?.user.isOwner ||
      (session !== null && process.env.NODE_ENV === "development"),
  );
}
