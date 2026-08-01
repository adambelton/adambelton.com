export const ACCESS_LEVELS = {
  owner: "owner",
  demo: "demo",
} as const;

export type AccessLevel = (typeof ACCESS_LEVELS)[keyof typeof ACCESS_LEVELS];

export type User = {
  id: string;
  email: string;
  emailDomain: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export type CurrentUser = {
  user: User;
  accessLevel: AccessLevel;
};
