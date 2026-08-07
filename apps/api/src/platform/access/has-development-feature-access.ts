export type DevelopmentFeatureSession = {
  user: { isOwner: boolean };
};

export function hasDevelopmentFeatureAccess(
  session: DevelopmentFeatureSession | null,
): session is DevelopmentFeatureSession {
  return Boolean(
    session &&
      (session.user.isOwner || process.env.NODE_ENV === "development"),
  );
}
