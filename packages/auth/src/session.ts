import type { AccessLevel, User } from "@adambelton/shared";

export type AuthenticatedSession = {
  user: User;
  accessLevel: AccessLevel;
};
