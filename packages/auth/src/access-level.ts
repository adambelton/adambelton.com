import type { AccessLevel } from "@adambelton/shared";

export function getAccessLevel(email: string, ownerEmail: string): AccessLevel {
  return email.toLowerCase() === ownerEmail.toLowerCase() ? "owner" : "demo";
}
