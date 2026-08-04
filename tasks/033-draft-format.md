# Task 033 — Add optional Draft Format

## Goal

Let a user set, inspect, change, or clear an optional format belonging to the
drafting capability, before or after a Draft exists, without yet deciding how
that format affects Discovery, Composition, or publishing.

## Depends on

Task 032, including its approved corrective pass.

## Why this task is next

The user may know that the writing is intended to be a journal entry, case
study, personal essay, project write-up, or another user-described format before
there is draft content. That information belongs with the writing being
developed rather than with publishing intent or a temporary pre-draft concept.

Establishing its ownership, lifecycle, persistence, and user controls now gives
later product work a truthful foundation. How format should influence inquiry,
composition, revision, or publishing requires a separate product decision and
must not be assumed by this implementation.

## Approval record

Approved on 2026-08-03 after revising the earlier intended-form proposal.

- **Draft Format** replaces **intended draft form** as the product concept.
- Format is optional state owned by the drafting capability.
- Absence means free-form writing; it is not necessary to persist a special
  `free-form` value.
- Drafting state may exist before the Draft artifact. Setting a format must not
  create empty canonical draft content or begin Composition.
- A Draft continues to exist only after content is successfully composed.
- This task manages and persists format but does not supply it to conversation,
  composition, revision, or publishing behaviour.
- The meaning and downstream effects of format are deliberately deferred to a
  separate product-definition task.
- Conversational recognition, inference, recommendations, templates, and
  automatic restructuring are not part of this task.
- These boundaries must not be reopened during implementation without new
  evidence and explicit approval.

## Scope

- Define a product-owned optional `DraftFormat` for one drafting state.
- Rename the current `DraftingState` aggregate to the more precise
  `DraftingState` throughout product and adapter contracts.
- Allow `DraftingState` to exist with a format while its `draft` remains `null`.
- Let the user set free-text format guidance, inspect it, change it, or clear it
  before or after a Draft exists.
- Treat absence as the free-form default.
- Provide an explicit accessible editor control that accurately explains the
  current limitation: the value is saved but does not yet change assistant
  behaviour.
- Persist the value for the workspace lifetime through a product-owned drafting
  persistence port: temporary for demo workspaces and durable for owner
  workspaces.
- Give set, change, and clear operations the same idempotency and stale-write
  protection expected of other canonical workspace mutations.
- Keep format distinct from draft content, audience, visibility, publishing
  intent, voice preferences, structure instructions, readiness, activity, and
  user intention.
- Update current architecture, terminology, decisions, progress, roadmap, and
  the ThoughtForm product README to describe the implemented ownership and
  lifecycle.

## Settled constraints

- Draft Format is optional and user-extensible, not a hardcoded enum or mode.
- The format may exist before or after the Draft artifact.
- Setting a format does not itself create draft content or begin Composition.
- Setting, changing, or clearing a format does not compose, rewrite, restructure,
  or revise existing draft content.
- The value remains private product state unless a later explicitly approved
  publishing operation uses it.
- Product code remains independent of host database, auth, AI-provider, and
  publishing infrastructure.
- The interface must not imply that the assistant currently uses the format.

## Out of scope

- Supplying format to conversation, composition, or revision model context.
- Changing Discovery questions, framing, policy, or effectiveness.
- Changing composition or revision prompts and behaviour.
- Deciding format semantics, structural criteria, or format-specific guidance.
- Reusable format definitions, templates, fixed taxonomies, questionnaires, or
  format recommendations.
- Conversational format commands, model-based recognition, automatic inference,
  or preference learning.
- Automatically restructuring an existing Draft when its format changes.
- Audience selection, visibility, publishing behaviour, or public metadata.

## Expected files to create or modify

- `packages/products/src/thoughtform/shared` drafting contracts
- `packages/products/src/thoughtform/server/capabilities/drafting` operations,
  store, and persistence port
- `packages/products/src/thoughtform/client/workspace` format control and
  client operations
- `packages/products/src/thoughtform/server/delivery/http` contracts
- `apps/api/src/products/thoughtform/adapters/persistence` temporary adapter
- `packages/db/src/adapters/thoughtform` durable adapter
- Prisma schema, generated migration, and adapter integration tests
- focused product, HTTP, client, adapter, and browser tests
- `packages/products/src/thoughtform/README.md`
- product brief, architecture, terminology, decisions, progress, and task index

## Definition of done

- A user can set, inspect, change, and clear a free-text Draft Format before or
  after a Draft exists in temporary and owner workspaces.
- The value survives reload for the applicable workspace lifetime.
- Setting a pre-draft format creates or updates `DraftingState` while retaining
  `draft: null`; it does not create content or begin Composition.
- Absence is represented and presented as free-form writing.
- Changing or clearing a format leaves existing draft content and revisions
  untouched.
- Duplicate operations are safe and stale updates cannot silently overwrite a
  newer value.
- The interface states that format is saved but not yet used by the assistant.
- Conversation and draft model inputs remain observably unchanged.
- Format, audience, visibility, publishing intent, preferences, and draft
  content remain observably distinct.
- Product, HTTP, temporary persistence, Prisma persistence, client, and browser
  regressions are covered.

## Validation commands

```txt
pnpm test
pnpm test:e2e
pnpm typecheck
pnpm build
pnpm db:validate
git diff --check
```

Run the focused Draft Format database-adapter integration tests when credentials
are available.

## Risks / implementation decisions

- Settle the smallest validated free-text representation, normalization rules,
  and length bound without defining downstream semantics.
- Settle the revision or concurrency token used for format mutations.
- Choose a durable storage representation that permits drafting state before a
  Draft row exists without creating empty draft content.
- Keep the `DraftingState` to `DraftingState` rename behaviour-preserving for
  existing draft, revision, and proposal operations.
- Ensure the control is useful and honest even though assistant consumption is
  intentionally deferred.

## Blast radius

Medium: shared product contracts, drafting state and persistence, HTTP and
client controls, temporary and Prisma adapters, migration, tests, and canonical
documentation. No model policy or generation behaviour changes are authorised.

## Status

Implemented on 2026-08-03.

Real-host verification completed on 2026-08-03 after applying the then-current
generated Draft Format migration to Neon `dev`. The authenticated
owner editor was exercised through the mounted client, API, Prisma adapter, and
database: format was set before a Draft, survived reload, changed, cleared, and
remained absent after a final reload without creating draft content. Browser and
API logs remained clear. API development startup now applies committed
migrations automatically when `DATABASE_URL` is configured and preserves the
intentional in-memory fallback when it is absent.
