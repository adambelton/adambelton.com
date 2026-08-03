export const defaultAuthBaseUrl = "http://localhost:3000";
export const defaultAuthEmailFrom = "Adam Belton <hello@adambelton.com>";
export const defaultAuthTrustedOrigins = ["http://localhost:3000"];
export const developmentAuthSecret = "development-only-change-me";
export const developmentDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/adambelton_dev?schema=public";

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getAuthBaseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? defaultAuthBaseUrl;
}

export function getAuthSecret(): string {
  const authSecret = process.env.BETTER_AUTH_SECRET;

  if (authSecret) {
    return authSecret;
  }

  if (isProductionEnvironment()) {
    throw new Error("BETTER_AUTH_SECRET is required in production.");
  }

  return developmentAuthSecret;
}

export function getAuthEmailFrom(): string {
  return process.env.AUTH_EMAIL_FROM ?? defaultAuthEmailFrom;
}

export function getTrustedOrigins(): string[] {
  const origins = process.env.BETTER_AUTH_TRUSTED_ORIGINS;

  if (!origins) {
    return defaultAuthTrustedOrigins;
  }

  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getAuthDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return databaseUrl;
  }

  if (isProductionEnvironment()) {
    throw new Error("DATABASE_URL is required in production.");
  }

  return developmentDatabaseUrl;
}
