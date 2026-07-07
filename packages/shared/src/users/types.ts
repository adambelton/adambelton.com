export type AccessLevel = "owner" | "demo";

export type User = {
  id: string;
  email: string;
  emailDomain: string;
  createdAt: string;
  lastLoginAt: string | null;
};
