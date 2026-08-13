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

ThoughtForm hosted-AI variables:

```txt
HOSTED_AI_ENABLED=true
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=<production Anthropic key>
ANTHROPIC_MODEL=claude-sonnet-5
ANTHROPIC_EFFORT=medium
```

`HOSTED_AI_ENABLED` is the site-wide hosted-AI shutdown control. Only the exact
value `true`, together with a valid supported provider and credential, makes the
ThoughtForm temporary workspace discoverable and available. Every authenticated
account may then use the temporary workspace; anonymous model access remains
denied. Setting the value to `false` (or removing it) hides the entry point and
denies temporary-workspace access after Railway applies the configuration. It
also disables owner hosted-model operations. There is no separate product-demo
toggle or allowlist.

Production must remain exactly one API application instance because temporary
workspaces live in process memory. Disable hosted AI if accounting or access
enforcement fails, topology drifts beyond one instance, provider failures repeat,
or usage approaches the global safeguard abnormally. After applying the change,
verify the public capability, direct workspace route, hosted operations, health,
and logs. Restore only after the cause is understood, then repeat the non-owner
smoke path with synthetic content.

Langfuse Prompt Management and owner-only observation are enabled by configuring
the three credentials together:

```txt
LANGFUSE_PUBLIC_KEY=<production Langfuse public key>
LANGFUSE_SECRET_KEY=<production Langfuse secret key>
LANGFUSE_BASE_URL=https://cloud.langfuse.com
LANGFUSE_TRACING_ENVIRONMENT=production
```

Production prompt promotion is repository-driven. Configure the Langfuse
secrets and Repository Dispatch credential described in
`docs/local-development.md`, protect `main`, and require CI before merging
generated fallback pull requests. The promotion
workflow runs only when reviewed fallback metadata reaches `main`; it fetches
the recorded immutable versions and refuses any content or fingerprint mismatch.
The Langfuse automation filters `updated` events to `thoughtform/*`; because the
Langfuse UI cannot filter by label, the GitHub sync workflow safely skips payloads
without `review`. The dedicated dispatch token is stored only in Langfuse,
restricted to this repository, and intentionally has no expiration; revoke any
superseded token immediately and rotate the active token manually when required.

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
   privacy pages, direct deep links, static assets, public sign-in, a dedicated
   non-owner temporary workspace, restored owner conversations, and streamed
   ThoughtForm responses.
7. Confirm the non-owner walkthrough creates only content-free hosted-attempt
   records and no Langfuse trace or event; use synthetic text and redact the
   account address and magic link from evidence.
8. Inspect Railway logs and owner operations visibility for unexpected errors,
   duplicate observations, or abnormal safeguard use.

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
