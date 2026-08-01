# Task 025 — Complete the ephemeral demo experience

## Goal

Complete the user-facing Socratic Draft demo lifecycle around the temporary
conversation behavior established in Task 024.

Make the editor clearly communicate that a non-owner conversation is temporary,
show when it expires, and recover safely when the conversation expires or becomes
unavailable while the editor is open. Preserve the deliberately different owner
persistence flow.

## Why this task is next

Task 024 implemented the privacy and storage boundary: one temporary
application-memory conversation per authenticated non-owner, fixed expiry 24
hours after creation, best-effort restoration, and immediate clearing.

The remaining demo gap is behavioral clarity. The client does not receive the
expiry deadline, cannot show the user how long the current conversation remains
available, and treats an expiry between page load and the next message as a
generic continuation error. Completing that lifecycle makes ephemeral mode feel
intentional before Task 026 adds usage limits and cost protection.

## Scope

- Add a Socratic Draft-owned temporary-conversation representation containing the
  current conversation and its fixed `expiresAt` deadline.
- Extend the product-owned temporary conversation store port and host in-memory
  adapter to return that deadline without exposing infrastructure-specific store
  details to the product.
- Keep the deadline fixed from conversation creation; restoration and additional
  turns must not extend it.
- Show a concise temporary-demo status in the non-owner editor, including the
  expiry time and a reminder that restart or deployment may remove the
  conversation sooner.
- Do not show temporary-demo lifecycle messaging in the owner editor or saved
  owner conversation routes.
- When restoration finds no current conversation, open a clean editor without
  treating that expected state as an error.
- When a conversation expires or disappears between restoration and submission,
  clear stale client conversation state and explain that the user can begin a new
  conversation.
- Do not automatically resend the failed message after resetting; that could
  create an unexpected additional model request.
- Preserve the existing explicit clear action and confirmation. After clearing,
  update all temporary lifecycle state as well as the visible messages.
- Add behavior-focused tests for fixed expiry metadata, restoration, owner/demo
  presentation differences, expiry during continuation, and clearing.
- Update `progress.md`, `tasks/README.md`, and `docs/decisions.md` only if an
  architectural decision changes.

## Out of scope

- Replacing application-process memory with browser storage, Redis, or database
  persistence.
- Guaranteed recovery across process restarts, deployments, devices, tabs, or
  multiple application instances.
- Changing the 24-hour fixed lifetime chosen in Task 024.
- Usage limits, token accounting, spend caps, or model kill switches; those belong
  to Task 026.
- Draft creation, final-draft export, Markdown/JSON download, or publishing.
- Persistent demo conversations, voice profiles, research notes, or public posts.
- Redesigning owner saved conversations.

## Expected files to create or modify

The exact split may change during implementation if a smaller, clearer structure
emerges, but the expected surfaces are:

- temporary-conversation types under
  `packages/products/src/socratic-draft/shared/`
- the temporary conversation store port under
  `packages/products/src/socratic-draft/server/conversation/`
- temporary conversation HTTP routes and tests under
  `packages/products/src/socratic-draft/server/http/`
- `packages/db/src/socratic-draft/in-memory-conversation-store.ts` and tests
- temporary conversation client helpers and editor components under
  `packages/products/src/socratic-draft/client/app/editor/`
- host composition tests under `apps/client/src/products/` where React DOM
  rendering is required
- `progress.md`
- `tasks/README.md`
- `docs/decisions.md` only if a decision changes

## Definition of done

- The temporary conversation API returns the fixed expiry deadline alongside the
  current conversation.
- Tests prove that continuing or restoring a conversation does not extend its
  deadline.
- A non-owner can see that the conversation is temporary and when it is scheduled
  to expire.
- Owner editor and saved-conversation surfaces do not show demo expiry messaging.
- An absent conversation on initial restoration produces a normal empty editor.
- A conversation that expires or disappears during continuation resets stale
  client state and gives a clear start-again message without automatically
  repeating the model request.
- Explicit clearing removes messages, conversation identity, and expiry metadata.
- Relevant tests, typecheck, build, and diff whitespace validation pass.

## Validation commands

```txt
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

## Risks / questions

- **Deadline presentation:** use an absolute local date/time rather than a live
  countdown so the UI remains accurate without timer complexity or noisy updates.
- **Expiry race:** the store may expire after the model request begins but before
  the turn is appended. The server response must not imply durable restoration if
  the turn was not retained.
- **Unavailable versus expired:** process loss and expiry look the same to the
  client. User-facing wording should describe the conversation as unavailable
  without claiming a cause the application cannot prove.
- **Failed message handling:** retain enough visible context to explain what
  happened, but do not silently resend writing or cause a second chargeable model
  request.

## Status

Proposed. Awaiting approval.
