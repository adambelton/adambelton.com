# Release the ThoughtForm product demo

## Goal

Open the portfolio website's production ThoughtForm temporary workspace to every
authenticated user, with existing cost controls, operational visibility, privacy
boundaries, hosted-AI shutdown behavior, and production evidence in place. A
future public beta or commercial release is a separate project and is not
delivered through the portfolio website.

## Why this task is next

Task 036 implemented and hardened the authenticated temporary-workspace
capability while leaving production non-owner access closed. Tasks 038–040 and
044 added accounting, measured limits, atomic enforcement, and owner operations
visibility. Autonomous user-correctable Idea Map merge/split behavior is also
complete and intentionally included. The remaining work is to align host access
and discoverability with the product-demo policy and verify the deployed flow.

## Depends on

- Completed Tasks 036 and 038–040.
- Completed Task 044 product-demo operations visibility.
- Completed autonomous user-correctable Idea Map merge/split behavior.
- Current production deployment, migrations, authentication email delivery,
  hosted-provider configuration, privacy copy, and rollback readiness.
- A fresh production configuration review immediately before release.

## Scope

- Replace the development-or-owner temporary-workspace restriction with a
  host-owned rule that admits every authenticated account when hosted AI is
  available. Do not introduce an allowlist or separate product-demo toggle.
- Keep API authorization authoritative. A logged-out request must never obtain
  a workspace or invoke a model.
- Derive the client's minimum workspace-availability capability from server
  runtime configuration. Do not expose credentials, copy `HOSTED_AI_ENABLED`
  into a build-time client constant, or duplicate access rules in product code.
- Keep the sign-in link available in the site header for logged-out visitors.
  Keep the temporary-workspace link available on the ThoughtForm overview when
  hosted AI is available. Following it while logged out redirects to sign-in;
  after authentication, the user can acknowledge privacy and enter the workspace.
- When `HOSTED_AI_ENABLED` is absent or is not exactly `true`, hide the workspace
  entry point and make all hosted ThoughtForm operations unavailable. This is
  the existing site-wide hosted-AI shutdown control, not a separate release gate.
- Preserve one isolated application-memory temporary workspace per authenticated
  account, fresh identities, the fixed 24-hour deadline, awaited clearing,
  scheduled cleanup, stale-client rejection, and detached local-text recovery.
- Preserve owner-only durable conversations, owner observation, operations and
  admin routes, and every ID-addressed persistent operation.
- Confirm Task 040 admission protects every hosted operation and that the owner
  remains subject to the global safeguard.
- Confirm temporary-workspace operations create content-free host ledger records
  but emit neither content nor content-free metadata to Langfuse.
- Confirm production runs exactly one API application instance while temporary
  workspace state remains process-local.
- Verify production migrations, provider/model disclosure, authentication rate
  limiting and email delivery, privacy acknowledgement, unavailable/limited
  states, owner operations visibility, health, and operational logs.
- Run a real non-owner production walkthrough, hosted-AI shutdown drill, restore,
  and post-release smoke check without committing private content or credentials.
- Update release, privacy, architecture/decision, operations, progress, and task
  records with exact configuration ownership and evidence.

## Out of scope

- Anonymous workspace or model access.
- Invite lists, account allowlists, or a general feature-flag system.
- A release toggle separate from `HOSTED_AI_ENABLED`.
- Durable non-owner workspaces, cross-device recovery, or browser content
  persistence.
- Temporary-user Langfuse tracing or qualitative analytics.
- New Idea Map, conversation, or drafting behavior.
- Billing, subscriptions, public sharing, export, publishing, or preference
  learning.
- Horizontal scaling or shared temporary persistence. Production remains one API
  application instance for this portfolio-hosted demo.
- The future public beta, commercial release, open-source distribution, or
  self-hosting support.

## Expected files or systems to create or modify

- host API access and runtime capability composition
- client session/capability integration, header, and ThoughtForm overview route
- server authorization, client route, host composition, and browser tests
- Railway production topology/configuration verification
- deployment, privacy, architecture/decision, progress, and task documentation
- no persistence schema or migration unless a separately reviewed production
  finding proves one necessary

## Settled constraints

- Every authenticated account is eligible for the temporary workspace; there is
  no allowlist.
- Sign-in is always discoverable to logged-out visitors.
- The workspace entry point is shown when the server reports hosted AI available.
- `HOSTED_AI_ENABLED` is the only shutdown control. Disabling it affects both
  owner and non-owner hosted operations and may require Railway to restart or
  redeploy configuration; no deployment-free rollback is promised.
- Authentication remains mandatory and API authorization remains authoritative.
- Non-owner access is temporary-workspace-only. Durable owner conversations,
  observation, operations, admin, and persistent IDs remain owner-only.
- Production uses exactly one API application instance while temporary content
  remains in process memory.
- Temporary content expires no later than its fixed deadline, may disappear
  earlier on restart/deployment, and is never written to the usage ledger or
  Langfuse.
- The host ledger contains only the Task 038 quantitative allowlist, and Task 040
  governs admission with the approved personal and global budgets.
- Hosted-AI configuration failure fails closed without fake responses.
- User-facing language calls this a “product demo,” not an “authenticated
  portfolio demo,” beta, or commercial service.

## Implementation decisions

- Define one server-derived capability response suitable for initial client
  discoverability and authenticated route presentation, using the narrowest
  existing host-owned delivery boundary that avoids a second policy source.
- Choose the exact recovery presentation when hosted AI becomes unavailable
  while a page is open. No further model operation may proceed; recoverable local
  text must remain available where the existing client already supports it.
- Record operational rollback criteria proportionate to a portfolio demo. At a
  minimum they cover accounting/enforcement failure, unexpected access-boundary
  behavior, topology drift, repeated provider failures, and abnormal approach to
  the global safeguard.
- Use a dedicated non-owner account and synthetic text for production evidence.
  Redact email addresses, magic links, credentials, and temporary writing.
- Use existing privacy language for AI processing, restart/deployment loss,
  24-hour expiry, limits, and clearing unless implementation review finds a
  specific inaccurate statement.

## Definition of done

- A logged-out visitor can see sign-in and the available ThoughtForm demo entry,
  is redirected to sign-in when entering the workspace, and cannot obtain
  workspace or model access without authentication.
- Any authenticated non-owner account can acknowledge privacy and use the
  complete temporary workspace in production when hosted AI is enabled.
- Non-owner durable, admin, operations, and observation routes remain denied
  server-side without existence disclosure.
- All hosted operations obey Task 040 limits, preserve rejected local work, and
  recover correctly under disabled, unavailable, and limited outcomes.
- Clearing, expiry, fresh identity, stale-client rejection, restart/deployment
  loss messaging, and detached local-text recovery work in the deployed host.
- Temporary operations produce correct content-free host usage records and no
  Langfuse trace or event.
- Owner durable use, owner operations visibility, and owner Langfuse observation
  remain intact.
- Production migrations are current; email delivery, auth rate limiting,
  provider disclosure, logs, health, and exactly one API instance are verified.
- Setting `HOSTED_AI_ENABLED=false` makes hosted operations unavailable and
  removes matching workspace discoverability after the configuration change is
  applied. Restoring it re-enables the verified flow.
- Required CI passes and the production walkthrough, shutdown drill, restore,
  and smoke check are recorded without private content.

## Validation commands

```txt
pnpm db:generate
pnpm db:validate
pnpm db:migrate:status
DATABASE_URL=<configured development/test database> pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
git diff --check
```

The task must additionally record production configuration and topology
inspection, migration status, deployed health/auth/API/browser verification,
no-Langfuse temporary-user evidence, owner regression checks, and a successful
hosted-AI shutdown-and-restore drill. Automated checks, browser inspection, and
human accessibility review must be identified separately.

## Risks / questions

- A client-visible capability cannot replace API authorization. Divergence could
  expose a route or create misleading discoverability.
- `HOSTED_AI_ENABLED` is intentionally broad: shutdown interrupts owner hosted AI
  as well as the product demo.
- Application-memory workspaces require the one-instance production constraint.
  A restart or topology change can remove temporary work earlier than 24 hours.
- Authentication and budgets reduce but do not eliminate abuse. The owner must
  monitor the Task 044 surface and use the hosted-AI shutdown control when the
  documented rollback criteria are met.
- Production evidence must not capture temporary-user writing, credentials, or
  magic links.

## Approval record

Approved by Adam on 13 August 2026.

- The portfolio-hosted experience is a product demo, not the future public beta
  or commercial release.
- Every authenticated account is eligible; an allowlist and anonymous access are
  intentionally excluded.
- Sign-in remains public, and the workspace entry point follows server-derived
  hosted-AI availability.
- `HOSTED_AI_ENABLED` remains the only shutdown control; no separate release
  toggle or general feature-flag system will be introduced.
- Production remains exactly one API application instance while temporary
  workspaces are process-local.
- Owner durable, observation, operations, and admin boundaries must not change.
- The task is expected to settle the narrow capability-delivery mechanism,
  unavailable-page recovery presentation, operational rollback criteria, and
  redacted production evidence details during implementation.
- The settled audience, Idea Map inclusion, Task 040 budgets, temporary-content
  privacy boundary, and product-demo wording must not be reopened without a
  cited authoritative conflict or genuinely new evidence.

## Status

Approved on 13 August 2026 after Task 044 and the release-policy review.
Implementation has not started.
