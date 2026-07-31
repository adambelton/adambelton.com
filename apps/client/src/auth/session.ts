import { authClient } from "apps/client/src/auth/authClient";

type ClientSessionUser = {
  id: string;
  email: string;
  name: string;
  isOwner?: boolean | null;
};

export type ClientSession = {
  user: ClientSessionUser;
};

export function useAuthSession() {
  const session = authClient.useSession();

  return {
    ...session,
    data: session.data as ClientSession | null,
  };
}
