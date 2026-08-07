# Release the authenticated ThoughtForm public beta

## Goal

Open the production ThoughtForm temporary workspace to the explicitly approved
class of authenticated non-owner users, with cost controls, operational
visibility, privacy boundaries, rollback, and production evidence in place.

## Why this task is next

Task 036 deliberately left production non-owner access closed behind a host-owned
release gate. Tasks 038–040 and 044 establish the accounting, measured limits,
enforcement, and owner visibility required to operate that access. This final
task changes release policy and proves the complete deployed beta; it does not
build missing product capabilities or weaken their safety boundaries.

## Depends on

- Completed Tasks 038–040.
- Completed minimum Task 044 beta operations visibility.
- Completion, or an explicit approved beta deferral, of autonomous
  user-correctable Idea Map merge/split behavior.
- Current production deployment, database migrations, auth email delivery,
  provider configuration, privacy copy, and rollback readiness.
- A fresh release review immediately before changing production access.

## Scope

- Replace the current development-or-owner temporary-workspace gate with an
  explicit host-owned beta release policy that:
  - defaults closed in production;
  - remains enabled for development verification;
  - can grant the approved authenticated non-owner audience temporary-workspace
    access without granting durable owner operations;
  - can be disabled without a code rollback.
- Keep API authorization authoritative and expose only the minimum host-owned
  capability state needed for the client to present matching discoverability.
  Do not duplicate release policy in product code or a build-time-only client
  constant.
- Make production login and the ThoughtForm beta entry point discoverable to the
  approved logged-out audience while continuing to require an authenticated
  session before workspace access.
- Preserve one isolated application-memory temporary workspace per admitted
  account, fresh identities, fixed 24-hour deadline, awaited clearing, scheduled
  cleanup, stale-client rejection, and detached local-text recovery.
- Preserve owner-only durable conversations, owner observation, admin routes,
  and every ID-addressed persistent operation.
- Confirm Task 040 admission protects every hosted operation and the emergency
  hosted-AI kill switch remains independent of the release gate.
- Confirm temporary-user operations create host ledger records but emit neither
  content nor content-free metadata to Langfuse.
- Verify production database migrations, provider/model disclosure, auth rate
  limiting, email delivery, privacy acknowledgement, unavailable/limited states,
  admin visibility, deployment topology, and operational logs.
- Run a real non-owner production walkthrough, rollback drill, and post-release
  smoke check without using private content in committed evidence.
- Update release, privacy, architecture/decision, operations, progress, and task
  records with exact configuration ownership and evidence.

## Out of scope

- Anonymous workspace access.
- Durable non-owner workspaces, cross-device recovery, or browser content
  persistence.
- Temporary-user Langfuse tracing or qualitative analytics.
- New Idea Map, conversation, or drafting behavior.
- Billing, subscriptions, public sharing, export, publishing, preference
  learning, or a general feature-flag platform.
- Horizontal scaling of application-memory workspaces unless the pre-release
  topology review shows it is required for correctness.

## Expected files or systems to create or modify

- host API access/release-policy configuration and composition
- minimal client capability/discoverability integration
- server authorization, client route, host composition, and browser tests
- Railway production configuration and documented rollback values
- deployment, privacy, architecture/decision, progress, and task documentation
- no product persistence schema unless a separately reviewed production finding
  proves one is necessary

## Settled constraints

- Authentication remains mandatory; the beta does not expose an anonymous model
  endpoint.
- Production remains closed unless the explicit server-controlled release policy
  is valid and enabled.
- Non-owner access is temporary-workspace-only. Durable owner conversations,
  observation, admin, and persistent IDs remain owner-only at the API.
- Temporary content remains in API-process memory, expires no later than its
  fixed deadline, may disappear earlier on restart/deployment, and is never
  written to the usage ledger or Langfuse.
- The host usage ledger contains only the Task 038 quantitative allowlist and
  Task 040 governs admission.
- Release-policy or observability failure fails closed without substituting fake
  AI responses.
- Rollback disables new non-owner access without deleting owner data or changing
  the product's temporary-workspace meaning.

## Decisions required before approval

- Eligibility: every authenticated account, an invite/allowlist, or another
  explicit host-controlled audience.
- Release configuration name, representation, source, defaults, validation, and
  client capability-delivery mechanism.
- Whether disabling the gate immediately denies existing temporary workspaces or
  permits a bounded read/copy/clear grace period without further model use.
- Initial beta concurrency/topology assumption and whether Railway must remain a
  single application instance for process-local workspace consistency.
- Operational alert thresholds and who/what triggers rollback.
- Exact production walkthrough account, evidence redaction, launch window, and
  post-release observation period.
- User-facing beta language explaining restart loss, 24-hour expiry, model
  processing, limits, and how to clear work.

## Definition of done

- A real approved non-owner account can discover login, authenticate, acknowledge
  privacy, and use the complete temporary workspace in production.
- Logged-out requests remain unauthenticated; non-owner durable/admin/observation
  operations remain denied server-side without existence disclosure.
- All hosted operations obey Task 040 limits, preserve rejected local work, and
  remain recoverable under disabled, unavailable, and limited outcomes.
- Clearing, expiry, fresh identity, stale-client rejection, restart/deployment
  loss messaging, and detached local-text recovery work in the deployed host.
- Temporary operations produce correct content-free host usage records and no
  Langfuse trace or event.
- Owner durable use and owner Langfuse observation remain intact.
- Production migrations are current; auth email delivery, rate limiting,
  provider disclosure, admin visibility, logs, and health checks are verified.
- Disabling the release policy follows the approved rollback behavior and closes
  non-owner hosted access without a deployment.
- Required CI passes and the production walkthrough, rollback drill, and
  post-release smoke checks are recorded without private content.

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

The task must additionally record production configuration inspection, current
migration status, deployed health/auth/API/browser verification, no-Langfuse
temporary-user evidence, owner regression checks, and a successful rollback
drill. Automated checks, browser inspection, and human accessibility review must
be identified separately rather than conflated.

## Risks / questions

- A client-visible gate can never replace API authorization; divergence could
  expose a route or create misleading discoverability.
- Application-memory workspaces require topology discipline. Horizontal routing
  without affinity/shared temporary storage can make work appear to disappear.
- Authentication and per-user limits reduce but do not eliminate abuse; rollback
  must be quick and independent of deployment.
- Production evidence must not capture temporary-user writing, credentials, or
  magic links.

## Status

Initial proposal based on the completed Task 036 release boundary and current
beta roadmap. Blocked on Tasks 038–040, Task 044, the Idea Map beta decision, and
a fresh release review. Not approved.
