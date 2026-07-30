import type { AccessLevel } from "packages/shared/src";
import { isOwnerEmail } from "packages/auth/src/owner";

export function getAccessLevel(email: string, ownerEmail: string): AccessLevel {
  return isOwnerEmail(email, ownerEmail) ? "owner" : "demo";
}
