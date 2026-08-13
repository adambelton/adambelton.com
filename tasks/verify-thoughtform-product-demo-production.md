# Verify the ThoughtForm product demo in production

## Goal

Verify the deployed ThoughtForm product demo with a real non-owner account and
record redacted operational evidence before publicly announcing its availability.

## Why this task is next

The release implementation can be merged and deployed independently. Production
configuration, authentication delivery, process topology, hosted-provider
behaviour, accounting, observation boundaries, and shutdown recovery can only be
proved against the deployed service. Adam intends to perform this verification
before announcing the demo.

## Scope

- Confirm Railway is healthy, current, and running exactly one persistent API
  application instance with all committed migrations applied.
- Confirm the public sign-in and ThoughtForm demo entry are visible and direct
  logged-out workspace entry redirects to sign-in.
- Use a dedicated non-owner account and synthetic text to verify magic-link
  delivery, privacy acknowledgement, the complete temporary workspace, expiry
  messaging, clearing, and unavailable/limited recovery.
- Confirm the walkthrough creates only the allowed content-free hosted-attempt
  ledger records and creates no temporary-user Langfuse trace or event.
- Confirm owner durable conversations, owner operations visibility, and owner
  Langfuse observation still work.
- Inspect authentication rate limiting, provider disclosure, health, and runtime
  logs for unexpected failures or sensitive content.
- Set `HOSTED_AI_ENABLED=false`, verify workspace discoverability and all hosted
  operations become unavailable, restore the value, and repeat the smoke path.
- Record redacted evidence and update progress/task records before announcing
  availability.

## Out of scope

- Code or policy changes unless verification reveals a separately reviewed bug.
- Anonymous access, allowlists, a separate release toggle, or horizontal scaling.
- Public beta, commercial release, marketing, or the public announcement itself.
- Committing email addresses, magic links, credentials, or temporary writing.

## Expected files or systems to create or modify

- Railway production configuration and deployment inspection
- production Neon migration status
- production browser/API/auth/provider/ledger/Langfuse/log inspection
- `tasks/verify-thoughtform-product-demo-production.md`
- `tasks/release-thoughtform-portfolio-demo.md`
- `tasks/README.md`
- `progress.md`

## Definition of done

- Every scoped production check has dated evidence or an explicit failure.
- The shutdown-and-restore drill succeeds without weakening owner boundaries or
  losing durable owner data.
- Evidence contains no private content or authentication secrets.
- Any blocker prevents announcement and is recorded rather than worked around.
- Progress and both release-task records accurately distinguish deployment from
  verified production availability.

## Validation commands

```txt
pnpm db:migrate:status
curl --fail --show-error https://adambelton.com/health
```

The remaining validation is deliberate production browser, Railway, Neon,
ledger, Langfuse, email, and log inspection. Automated checks, browser
inspection, and human assistive-technology verification must be identified
separately.

## Risks / questions

- Changing `HOSTED_AI_ENABLED` interrupts owner hosted AI and may restart the
  process, removing temporary workspaces; use only synthetic temporary content.
- Magic links and production logs can expose sensitive information if captured
  carelessly.
- A failed check must keep the public announcement on hold and may require a
  separately proposed correction task.
- Human assistive-technology verification is optional unless Adam chooses to add
  it before announcement; it must not be inferred from automated accessibility
  or browser checks.

## Status

Planned on 13 August 2026. Adam explicitly separated these post-deployment checks
from the release implementation and intends to perform them before announcing
the demo. The verification task has not started.
