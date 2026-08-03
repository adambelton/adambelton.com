import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "packages/db/src/generated/prisma/client";

export function createDatabaseClient(connectionString: string): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });
}

export type DatabaseClient = PrismaClient;
