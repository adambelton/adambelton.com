import { useAuthSession } from "apps/client/src/auth/session";

export function useIsDevelopmentFeatureEnabled(): boolean {
  const session = useAuthSession();

  return import.meta.env.DEV || Boolean(session.data?.user.isOwner);
}
