import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { createDatabaseClient } from "packages/db/src";
import {
  createResendMagicLinkEmailSender,
  type SendMagicLinkEmail,
} from "packages/auth/src/adapters/email";
import {
  getAuthBaseUrl,
  getAuthDatabaseUrl,
  getAuthEmailFrom,
  getAuthSecret,
  getTrustedOrigins,
} from "packages/auth/src/server/config";
import { getOwnerEmail, isOwnerEmail } from "packages/auth/src/core/owner";
import { authBasePath } from "packages/auth/src/server/routes";

type CreateAuthOptions = {
  databaseUrl: string;
  baseUrl: string;
  secret: string;
  trustedOrigins: string[];
  ownerEmail: string | null;
  sendMagicLinkEmail: SendMagicLinkEmail;
};

export type AuthSessionResult = {
  user: {
    id: string;
    email: string;
    name: string;
    isOwner?: boolean | null;
  };
  session: unknown;
};

export type AuthInstance = {
  handler: (request: Request) => Response | Promise<Response>;
  api: {
    getSession: (options: {
      headers: Headers;
    }) => Promise<AuthSessionResult | null>;
  };
};

function createAuth({
  databaseUrl,
  baseUrl,
  secret,
  trustedOrigins,
  ownerEmail,
  sendMagicLinkEmail,
}: CreateAuthOptions): AuthInstance {
  const database = createDatabaseClient(databaseUrl);

  return betterAuth({
    appName: "AdamBelton.com",
    baseURL: baseUrl,
    basePath: authBasePath,
    database: prismaAdapter(database, {
      provider: "postgresql",
    }),
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: {
              ...user,
              isOwner: ownerEmail
                ? isOwnerEmail(user.email, ownerEmail)
                : false,
            },
          }),
        },
      },
    },
    secret,
    trustedOrigins,
    user: {
      additionalFields: {
        isOwner: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLinkEmail({ email, url });
        },
      }),
    ],
  }) as AuthInstance;
}

export const auth: AuthInstance = createAuth({
  databaseUrl: getAuthDatabaseUrl(),
  baseUrl: getAuthBaseUrl(),
  secret: getAuthSecret(),
  trustedOrigins: getTrustedOrigins(),
  ownerEmail: getOwnerEmail(),
  sendMagicLinkEmail: createResendMagicLinkEmailSender({
    apiKey: process.env.RESEND_API_KEY,
    from: getAuthEmailFrom(),
  }),
});
