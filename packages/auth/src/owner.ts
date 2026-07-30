export function isOwnerEmail(email: string, ownerEmail: string): boolean {
  return email.trim().toLowerCase() === ownerEmail.trim().toLowerCase();
}

export function getOwnerEmail(): string | null {
  return process.env.OWNER_EMAIL?.trim() || null;
}
