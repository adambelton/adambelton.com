import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";
import { isOwnerEmail } from "packages/auth/src/core/owner";

export function getAccessLevel(email: string, ownerEmail: string): AccessLevel {
  return isOwnerEmail(email, ownerEmail)
    ? ACCESS_LEVELS.owner
    : ACCESS_LEVELS.demo;
}
