# Deploy to a temporary Railway domain

## Outcome

The production service, temporary HTTPS domain, production Neon migration,
public routes, and owner magic-link authentication were verified on 6 August
2026. The service runs as one persistent Europe West replica with GitHub `main`
as its source.

The deeper authenticated ThoughtForm conversation, asynchronous Idea Map, and
Braintrust checks were explicitly deferred by Adam until after public-site
activation. This task therefore records those original criteria as incomplete
rather than silently treating public-route verification as equivalent evidence.
They remain a non-blocking production follow-up because ThoughtForm is private.

## Goal

Deploy the complete application to a temporary Railway domain and verify the real hosted production path before changing DNS.

## Why this task is next

The repository now contains the complete single-service Railway foundation. A hosted release-candidate deployment is the remaining evidence required before the production domain can be activated.

## Scope

- Create one Railway project and persistent service in Europe West.
- Connect the service to `adambelton/adambelton.com` on `main`.
- Generate a temporary `*.up.railway.app` domain.
- Keep Serverless/App Sleeping disabled.
- Configure the exact temporary origin for Better Auth.
- Use the Neon `production` branch and apply committed migrations through Railway's pre-deploy command.
- Have Adam enter secrets directly rather than exposing them in conversation or source control.
- Inspect build, migration, health, runtime, and observation behavior.
- Verify public routes, deep links, assets, owner authentication, persistent conversations, SSE, asynchronous Idea Map updates, and owner Braintrust observations.
- Record the deployment outcome and any defects.

## Out of scope

- Attaching `adambelton.com` or changing DNS.
- Public ThoughtForm access.
- Canonical metadata, sitemap, or social cards.
- AI provider, model, or effort changes.
- Enabling Railway Serverless.

## Expected files

- This task record.
- `progress.md` and deployment documentation if hosted evidence changes the setup instructions.
- Production code only if the hosted deployment reveals a defect requiring a separately explained correction within the approved deployment behavior.

## Definition of done

- The temporary HTTPS domain serves the complete application.
- Railway health checks and pre-deploy migrations pass.
- Owner authentication works through Resend.
- A ThoughtForm conversation streams and persists.
- The Idea Map updates asynchronously.
- Braintrust receives the intended owner production observation.
- Runtime logs contain no unresolved production errors.
- Serverless is visibly disabled.
- Production DNS remains unchanged.

## Validation commands

- Railway deployment, build, and runtime status/log inspection.
- Read-only HTTP checks against the temporary domain.
- Mounted browser verification of public and owner flows.
- `pnpm test`, `pnpm typecheck`, `pnpm build`, and `git diff --check` if repository files change.

## Risks / questions

- The pre-deploy command applies the committed initial schema to the Neon `production` branch.
- Secret entry and owner email delivery require Adam's direct interaction.
- Railway service and project creation are external mutations; exact targets must be resolved before each action.

## Approval record

Approved by Adam on 6 August 2026 after authenticating the Railway CLI.

- Production Neon migration is explicitly approved.
- Use one persistent Europe West Railway service and a temporary Railway domain.
- Secrets must be entered directly by Adam and not transmitted through conversation or committed.
- Serverless remains disabled.
- Production DNS, public ThoughtForm access, and provider/model changes remain deferred.
