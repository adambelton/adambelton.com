import type { AccessLevel, User } from "packages/shared/src";

export type AuthenticatedSession = {
  user: User;
  accessLevel: AccessLevel;
};
