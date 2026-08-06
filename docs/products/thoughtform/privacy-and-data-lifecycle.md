# ThoughtForm privacy and data lifecycle

Last reviewed: 4 August 2026.

This note records the product-specific privacy boundary for ThoughtForm.
Shared authentication, contact, and platform-provider processing is documented in
`docs/privacy-and-data-lifecycle.md`.

## Non-owner workspace

- The user must affirmatively acknowledge the processing summary in the current
  browser session before editor controls are available.
- The API associates one temporary conversation with the authenticated user.
- The conversation uses an unguessable UUID and is held only in API-process
  memory. It is not written to the application database.
- Its fixed expiry is 24 hours after creation. Activity does not extend it.
- Reads and writes enforce the deadline, and scheduled expiry releases message
  content even if the user does not return.
- The authenticated user can clear the conversation immediately from the editor.
- Drafts, immutable revision snapshots, proposal versions, and operation records
  share the temporary conversation lifecycle. Explicit clearing and scheduled
  expiry remove all of this private writing state from application memory.
- Reload and navigation recovery are best effort. A process restart, deployment,
  or request to another application instance can remove the conversation sooner.
- Temporary owner-workspace operations emit no Braintrust traces. Neither their content nor
  content-free request metadata is sent to the evaluation service.

## Owner workspace

- The acknowledgement explains that owner conversations may be saved.
- Owner conversations and messages are stored in the Neon-hosted Postgres
  database and scoped to the authenticated owner in database operations.
- Owner conversations do not currently have an automatic expiry.
- Private drafts, their complete retained revision history, revision proposals,
  proposal versions, and retry-operation records are stored with the owner
  conversation. Owner-scoped repository operations prevent another user from
  loading them.
- Deleting the owning conversation cascades to its draft, revisions, proposals,
  proposal versions, and operation records.
- They are private thinking and articulation material. The product has no
  publishing lifecycle. Later public website content is prepared and delivered
  separately by the host after product v1.
- When the owner explicitly configures Braintrust, owner conversation turns may
  send evaluation-relevant user messages, assistant responses, model output,
  Idea Map context, prompt/profile context, and latency/token metadata to the
  owner's private Braintrust project. Braintrust retention is separate from
  Neon persistence, and deleting a ThoughtForm conversation does not currently
  delete its evaluation traces.

## Model processing

- Conversation messages, explicitly attached draft passages, composition
  material, and proposal instructions are sent from the browser to the application API and
  then to the active host-selected profile from ThoughtForm's supported
  Anthropic and OpenAI list. The mounted interface derives the active provider
  disclosure at runtime; changing a model does not require editing privacy copy.
- Anthropic's commercial API information reviewed on 4 August 2026 states that
  API data is not used for training unless an agreement states otherwise. Its
  standard retention information states that API inputs and outputs are deleted
  within 30 days, with exceptions including usage-policy enforcement and legal
  requirements.
- This application does not claim an Anthropic Zero Data Retention arrangement.
- OpenAI remains an explicitly selectable host provider. Its Responses client
  continues to set `store: false`, which disables optional application-state
  storage but does not establish Zero Data Retention.

Application code does not intentionally log temporary workspace conversation message
bodies or generated writing. Explicitly configured owner evaluation tracing is
the sole current exception. Deployment-level access and request logging must be
checked separately before public launch.

## Primary risks and mitigations

### Sensitive information submitted to the model

Risk: users may enter identifying, confidential, or highly sensitive information
about themselves or another person.

Mitigations: an affirmative acknowledgement precedes editor controls; the copy
states that this is not a confidential professional, medical, legal, or
therapeutic service; users are advised to minimise sensitive information.

The product may be used for thoughts and feelings, but it is not a therapist,
diagnostic tool, clinical intervention, crisis service, or substitute for
professional support. The assistant must not present its interpretations as
authoritative facts about the user's identity or experience.

### Temporary content survives longer than represented

Risk: content could remain available after its stated lifetime or be exposed to
another visitor.

Mitigations: fixed creation-based expiry, access-time enforcement, scheduled
content removal, one store per authenticated user, unguessable identifiers,
explicit clearing, and isolation tests.

### Temporary content disappears early

Risk: in-process memory is not durable and is inconsistent across multiple API
instances.

Mitigations: the UI and product privacy page call restoration best effort and
safely start with an empty editor when content is unavailable. Shared ephemeral
infrastructure or sticky routing is deliberately out of scope.

### Hosted-provider policy drift

Risk: the dated provider summary becomes inaccurate.

Mitigations: link official provider sources, avoid guarantees about provider
behavior, and review before launches or changes to model infrastructure.

## When to revisit

Review this note before public launch and whenever ThoughtForm changes its
AI provider, prompts and submitted data, persistence, retention, restoration,
clearing, drafts, usage tracking, sensitive-use boundaries, or categories of
requested reflection.

Any future permanent non-owner workspace must define and approve its own
evaluation consent, retention, access, and deletion policy before content
tracing is enabled.
