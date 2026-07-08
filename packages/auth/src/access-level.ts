import type { AccessLevel } from "packages/shared/src";

export function getAccessLevel(email: string, ownerEmail: string): AccessLevel {
  return email.toLowerCase() === ownerEmail.toLowerCase() ? "owner" : "demo";
}
