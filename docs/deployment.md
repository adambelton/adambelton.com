# Deployment

## Architecture

The production application is one persistent Railway service. Its Hono process
serves the built Vite client and owns the `/api`, `/auth`, and `/health`
boundaries on the same origin. This keeps session cookies and streamed
ThoughtForm responses direct and avoids a separate frontend proxy.

Neon remains the database provider. Railway runs committed Prisma migrations as
a pre-deploy command before replacing the active application deployment.

## Repository-owned Railway configuration

`railway.toml` defines the Railpack build, migration, start, health-check, and
restart behavior. Railway must use the repository root so pnpm workspace
dependencies are available.

Railway Serverless, formerly App Sleeping, must remain **disabled** in the
service dashboard. It is not represented by Railway's config-as-code schema.
Disabling it keeps the Node process persistent and avoids an idle cold boot on
the first request.

## Production variables

Set these in Railway only. Do not commit their values.

Required platform variables:

```txt
NODE_ENV=production
DATABASE_URL=<Neon production pooled connection URL>
BETTER_AUTH_URL=https://adambelton.com
BETTER_AUTH_SECRET=<long random production secret>
BETTER_AUTH_TRUSTED_ORIGINS=https://adambelton.com,https://<temporary-domain>.up.railway.app
OWNER_EMAIL=<owner email>
RESEND_API_KEY=<production Resend key>
AUTH_EMAIL_FROM=Adam Belton <verified-sender@example.com>
AUTH_CLIENT_IP_HEADERS=x-real-ip
```

ThoughtForm owner AI variables:

```txt
HOSTED_AI_ENABLED=true
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=<production Anthropic key>
ANTHROPIC_MODEL=claude-sonnet-5
ANTHROPIC_EFFORT=medium
```

Owner-only Braintrust observation is optional. If enabled, configure the three
values together:

```txt
BRAINTRUST_API_KEY=<production Braintrust key>
BRAINTRUST_PROJECT=ThoughtForm
BRAINTRUST_ENVIRONMENT=production
```

Do not set `PORT`; Railway supplies it. The server listens on `0.0.0.0` by
default. Railway documents `X-Real-IP` as the client address supplied by its
public edge. Do not reuse this header setting on a host that allows clients to
reach the origin directly or does not replace the incoming header.

## Temporary-domain verification

1. Create one service from the GitHub repository with the repository root as
   its root directory.
2. Generate a Railway public domain.
3. Populate the required variables using that exact HTTPS origin.
4. Confirm Serverless is disabled.
5. Confirm the pre-deploy migration succeeds and `/health` returns HTTP 200.
6. Verify the homepage, article, About, Products, ThoughtForm overview and
   privacy pages, direct deep links, static assets, owner sign-in, restored
   owner conversations, and a streamed ThoughtForm response.
7. Inspect Railway logs and Braintrust for unexpected errors or duplicate
   observations.

Do not attach `adambelton.com` during this verification. Custom-domain DNS,
canonical metadata, origin changes, and final production checks belong to the
separate activation task.

## Production domain

`https://adambelton.com` is the canonical production origin. Cloudflare hosts
its DNS and proxies the apex CNAME to Railway. Railway's ownership TXT record
must remain present while the domain is attached to the service. Cloudflare
SSL/TLS mode is `Full`, with Universal SSL enabled.

The Railway plan permits one custom domain on the service. The apex domain uses
that allocation; Cloudflare therefore owns the permanent `www` redirect. Its
proxied `www` CNAME points to the apex, and a Cloudflare redirect rule preserves
the request path and query string while returning HTTP 301 to the equivalent
`https://adambelton.com` URL.

The Railway temporary domain remains attached for diagnosis and remains a
trusted Better Auth origin during initial operation. Magic links use the
canonical apex origin because `BETTER_AUTH_URL` is `https://adambelton.com`.

## Local production smoke test

Build and start the same application shape Railway uses:

```txt
pnpm build
NODE_ENV=production DATABASE_URL=<verification-url> \
  BETTER_AUTH_URL=http://localhost:8787 \
  BETTER_AUTH_SECRET=<local-smoke-secret> \
  BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:8787 \
  pnpm start
```

Use only an explicitly selected development or disposable database for this
check. Do not run `pnpm db:migrate:deploy` against the production Neon branch as
part of local verification.
