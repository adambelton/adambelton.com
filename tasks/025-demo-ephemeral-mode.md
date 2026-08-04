# Task 025 — Complete the ephemeral demo experience

## Goal

Complete the user-facing ThoughtForm demo lifecycle around the temporary
conversation behavior established in Task 024.

Make the demo editor clearly communicate that its conversation is temporary,
show when it expires, and recover safely when the conversation expires or becomes
unavailable while the editor is open. Preserve the deliberately different owner
persistence flow, while allowing the owner to exercise the real temporary demo
through the same route as any other authenticated user.

## Why this task is next

Task 024 implemented the privacy and storage boundary: one temporary
application-memory conversation per authenticated non-owner, fixed expiry 24
hours after creation, best-effort restoration, and immediate clearing.

The remaining demo gap is behavioral clarity. The client does not receive the
expiry deadline, cannot show the user how long the current conversation remains
available, and treats an expiry between page load and the next message as a
generic continuation error. The owner also cannot exercise the real demo path
without switching users because owner editor requests currently select persistent
storage. Completing that lifecycle makes ephemeral mode feel intentional and
manually testable before Task 026 adds usage limits and cost protection.

## Scope

- Add a ThoughtForm-owned temporary-conversation representation containing the
  current conversation and its fixed `expiresAt` deadline.
- Make product route semantics determine conversation persistence:
  `/products/thoughtform/editor` always uses the authenticated user's single
  temporary conversation, including when the user is the owner, while
  `/products/thoughtform/conversations/:id/editor` uses the identified
  persistent conversation and remains owner-only.
- Keep `/products/thoughtform/conversations` as the owner-only persistent
  conversation index. Add a working create-conversation action there that creates
  a persistent conversation first and then navigates to its ID-addressed editor.
- Make the server API enforce the same temporary/persistent distinction rather
  than selecting persistence solely from the authenticated user's access level.
  Temporary operations must resolve only the current temporary store; persistent
  operations must require owner access and an identified persistent conversation.
- Extend the product-owned temporary conversation store port and host in-memory
  adapter to return that deadline without exposing infrastructure-specific store
  details to the product.
- Extend the successful conversation result through an explicit product-owned
  boundary so a newly created temporary conversation returns its fixed
  `expiresAt` deadline immediately, without requiring a second restoration
  request. Keep owner responses free of temporary-demo lifecycle semantics.
- Keep the deadline fixed from conversation creation; restoration and additional
  turns must not extend it.
- Always show a concise temporary-demo status in the demo editor. Before a
  conversation exists, explain that its 24-hour lifetime begins with the first
  submission. Once a conversation exists, show its absolute expiry in the
  user's local time and remind them that restart or deployment may remove it
  sooner.
- Do not show temporary-demo lifecycle messaging in the persistent owner editor
  or saved owner conversation routes. The owner using
  `/products/thoughtform/editor` is deliberately using the temporary demo and
  must see the same lifecycle messaging and behavior as another demo user.
- When restoration finds no current conversation, open a clean editor without
  treating that expected state as an error.
- Make complete-turn retention observable through the product-owned conversation
  store port. A user-and-assistant exchange is one atomic turn and exists only
  once the complete turn has been retained.
- When a conversation expires or disappears between restoration and submission,
  or at any point before the complete turn is retained, return a defined
  unavailable-conversation failure rather than reporting the generated response
  as retained.
- Preserve structured API failure codes through the conversation client helper.
  Reset temporary lifecycle state only for defined unavailable-conversation
  failures; unrelated request failures must preserve the active conversation.
- For an unavailable-conversation failure, remove the optimistic user message,
  clear the stale conversation identity, messages, and expiry metadata, and show
  a client-only notice that the temporary conversation is no longer available
  and the user can start again. Do not display an unretained assistant response
  or automatically resend the failed message. The notice does not need to
  survive reload.
- Preserve the existing explicit clear action and confirmation. After clearing,
  update all temporary lifecycle state as well as the visible messages.
- Add behavior-focused tests for fixed expiry metadata, restoration, immediate
  metadata after creation, owner/demo presentation differences, atomic-turn
  expiry during continuation, structured failure handling, unrelated request
  failures, and clearing.
- Update `progress.md` and move Task 025 from Planned to Completed in
  `tasks/README.md`. Update `docs/decisions.md` only if an architectural decision
  changes.

## Out of scope

- Replacing application-process memory with browser storage, Redis, or database
  persistence.
- Guaranteed recovery across process restarts, deployments, devices, tabs, or
  multiple application instances.
- Changing the 24-hour fixed lifetime chosen in Task 024.
- Extending or renewing a temporary conversation's deadline, including
  near-expiry grace periods. Revisit this only if observed usage shows that fixed
  expiry interrupts meaningful active sessions.
- Usage limits, token accounting, spend caps, or model kill switches; those belong
  to Task 026.
- Draft creation, final-draft export, Markdown/JSON download, or publishing.
- Persistent demo conversations, voice profiles, research notes, or public posts.
- Redesigning owner saved conversations beyond the persistent index, working
  create action, and ID-addressed editor route required by this task.

## Expected files to create or modify

The exact split may change during implementation if a smaller, clearer structure
emerges, but the expected surfaces are:

- temporary-conversation types under
  `packages/products/src/thoughtform/shared/`
- the shared conversation response or temporary lifecycle result contract under
  `packages/products/src/thoughtform/shared/`
- the temporary conversation store port under
  `packages/products/src/thoughtform/server/conversation/`
- the main conversation route, temporary conversation HTTP routes, and their
  tests under
  `packages/products/src/thoughtform/server/http/`
- conversation store adapters and tests under `packages/db/src/thoughtform/`
- temporary conversation and conversation-request client helpers and their tests
  under `packages/products/src/thoughtform/client/app/modules/editor/`
- shared editor UI under
  `packages/products/src/thoughtform/client/app/components/editor/`
- persistent conversation helpers under
  `packages/products/src/thoughtform/client/app/modules/conversations/`
- persistent conversation UI under
  `packages/products/src/thoughtform/client/app/components/conversations/`
- demo, persistent editor, conversation index, and conversation detail pages
  under `packages/products/src/thoughtform/client/app/pages/`
- product client route definitions and tests under
  `packages/products/src/thoughtform/client/app/`
- host client product-route composition needed to preserve the owner-only route
  gates and navigate after persistent creation
- host API composition needed to resolve temporary and persistent operations by
  operation semantics as well as authenticated access
- host composition tests under `apps/client/src/products/` where React DOM
  rendering is required
- `progress.md`
- `tasks/README.md`
- `docs/decisions.md` only if a decision changes

## Definition of done

- The temporary conversation API returns the fixed expiry deadline alongside the
  current conversation.
- After the first successful demo submission, the editor receives and displays
  the new conversation's expiry without navigation, reload, or a second
  restoration request.
- Tests prove that continuing or restoring a conversation does not extend its
  deadline.
- A non-owner with an empty editor can see that the conversation will be
  temporary and that its 24-hour lifetime begins on first submission.
- A non-owner with a current conversation can see its absolute expiry in local
  time and that it may become unavailable sooner after restart or deployment.
- The owner can use `/products/thoughtform/editor` to exercise the real
  temporary lifecycle without reading or writing persistent conversations.
- Persistent owner editor and saved-conversation surfaces do not show demo expiry
  messaging.
- Non-owner users cannot access `/products/thoughtform/conversations` or an
  ID-addressed persistent editor.
- The owner conversation index provides a working create action. Creating a
  persistent conversation establishes its ID and navigates to
  `/products/thoughtform/conversations/:id/editor`.
- Tests prove that temporary and persistent client routes and server operations
  cannot cross storage modes.
- An absent conversation on initial restoration produces a normal empty editor.
- Tests prove that expiry or disappearance before atomic append returns a defined
  unavailable-conversation failure and never a misleading successful response.
- An unavailable conversation during continuation removes the optimistic user
  message, resets stale client state, discards any unretained assistant response,
  and gives a clear start-again notice without automatically repeating the model
  request.
- Only defined unavailable-conversation failures reset temporary lifecycle state;
  unrelated request failures preserve the active conversation.
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
  the atomic turn is appended. The store port must report whether the complete
  turn was retained, and the server must return a defined unavailable-conversation
  failure rather than imply retention when it was not.
- **Unavailable versus expired:** process loss and expiry look the same to the
  client. User-facing wording should describe the conversation as unavailable
  without claiming a cause the application cannot prove.
- **Failed message handling:** when the complete turn is not retained, remove the
  optimistic user message and replace the conversation with a client-only
  unavailable notice. Do not show an unretained model response, silently resend
  writing, or cause a second chargeable model request.

## Status

Completed.
