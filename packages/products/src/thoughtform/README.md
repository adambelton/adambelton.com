# ThoughtForm

ThoughtForm is a private conversational thinking workspace that helps a person
explore what is on their mind, inspect an evolving Idea Map, and articulate the
resulting understanding in their own words. A Draft contains that first-person
articulation. Reaching it is the intended culmination and likely the moment where
the product proves its distinctive value, although the system does not force a
user to continue or treat stopping earlier as failure. This guide is the starting
point for developing, integrating, testing, or diagnosing the product without
first learning the surrounding website.

The product follows the repository's [organising principles](../../../../README.md):
ownership is explicit, product meaning is separated from external mechanisms,
and each path should narrow a reported behaviour to one likely responsibility.
Canonical product language lives in
[`docs/products/thoughtform/terminology.md`](../../../../docs/products/thoughtform/terminology.md).

## How the product is organised

```txt
packages/products/src/thoughtform/
│
├── shared/                                    Product vocabulary and contracts
│
├── client/                                    What the user sees
│   ├── pages/                                 Complete product pages
│   ├── conversations/                         Saved-conversation interface and actions
│   ├── workspace/                             Conversation, Idea Map and draft editor
│   ├── routes/                                Product-owned route decisions
│   └── ui/                                    Small product-owned presentation helpers
│
├── server/                                    What the product does
│   ├── capabilities/                          Rules owned by one product capability
│   │   ├── conversation/                      Guides inquiry and retains its history
│   │   │   ├── conversation-model-contract.ts Owns the structured output schema
│   │   │   ├── conversation-model-request.ts  Builds bounded model context
│   │   │   ├── conversation-model-response.ts Validates model output
│   │   │   ├── prompts/                        Owns the Discovery prompt fallback
│   │   │   └── ports/                         AI and storage requirements
│   │   ├── idea-map/                          Analyses and maintains established ideas
│   │   │   ├── idea-map-model-output.ts        Validates proposed model changes
│   │   │   └── prompts/                        Owns the Idea Map prompt fallback
│   │   ├── drafting/                          Composes, versions and revises the draft
│   │   │   ├── prompts/                        Owns the three Draft prompt fallbacks
│   │   │   └── ports/                         AI and storage requirements
│   │   └── hosted-attempt/                    Defines hosted-operation accounting meaning
│   ├── application/                           Coordinates complete user operations
│   │   ├── hosted-attempt/                    Completes admitted model operations
│   │   └── workspace/                         Connects conversation, ideas and drafts
│   ├── delivery/                              Ways to invoke product operations
│   │   └── http/                              Browser-facing HTTP entrance
│   └── ports/                                 Shared product server requirements
│
└── testing/                                   Product-owned verification
    ├── fakes/                                  Deterministic external substitutes
    ├── fixtures/                               Reusable example product states
    ├── browser/                                Complete user journeys
    └── evaluations/                            Real-model behavioural checks
```

Owner-only Langfuse observations use the runtime-neutral contracts in
`packages/observability`. The API host supplies the Langfuse/OpenTelemetry
adapter only to the persistent owner conversation, Idea Map, and composition
operations; every temporary workspace receives the no-op implementation and
emits neither content nor metadata. Synthetic evaluations may also record full
content so behavioural regressions can be investigated. Anthropic owner-provider
spans also record the explicitly selected effort. The local development baseline
is Sonnet 5 at medium effort; temporary workspace traffic remains entirely
outside this observation boundary.

ThoughtForm owns the five prompt definitions and reviewed availability fallbacks.
The API host retrieves their `development` or `production` Langfuse versions and
links the resolved version to generation observations. A production promotion
must update its repository fallback in the same reviewed change.
Langfuse `review` versions enter the repository through an automated pull
request; the host-owned automation ledger records immutable versions and SHA-256
fingerprints so post-merge promotion fails closed on drift.

The temporary workspace is an authenticated product capability. The API host
owns its release policy: development enables isolated non-owner workspaces,
while production currently admits only the owner. Saved conversations and owner
observations remain owner-only. The client host mirrors the API decision for
navigation and route presentation but is not the security boundary.

## How the pieces interact

```txt
User action
  → product interface
  → POST HTTP entrance and SSE event stream
  → workspace application operation
  → concurrent conversation and Idea Map capabilities, or drafting capability
  → product-defined port
  → host-supplied AI or persistence adapter
  → result returned to the interface
```

For a conversation turn, the conversation and Idea Map capabilities receive the
same retained workspace and latest user message. The assistant response streams
as structured text deltas. The interface buffers those canonical deltas into a
roughly 36-character-per-second, reduced-motion-aware visual reveal, with
bounded catch-up only for unusually large backlogs. It follows rendered-height
growth only while the reader remains near the bottom. Escaped Unicode artifacts
in structured assistant text are decoded consistently for new and previously
retained responses. Once complete, the user and assistant
messages are retained exactly once and the client becomes interactive again.
Idea Map analysis does not use the new assistant response; it finishes
independently. A map-only revision advance is reconciled without blocking a
following message, while a changed message history remains a genuine conflict.
Completed analysis is optimistically rebased onto the latest map with bounded
revision protection. A failed or persistently stale Idea Map update is reported
as recoverable and never discards the retained assistant turn.

The same analysis call may propose one bounded merge or split of established
ideas. Product capability code validates references, limits, dispositions, and
meaning preservation before applying it. Merges retain the earliest map identity
and complete source substance; splits retain the original identity for the
primary result and require the exact established substance and open questions to
be distributed. The map retains only the affected pre-change state needed for
one immediate undo. User-directed merge, split, and undo use the same optimistic
operation through both temporary and durable hosts.

A changed draft save is returned immediately with its exact revision-bounded
`DraftChange`. The client then launches the product's saved-edit interpretation
operation. Obvious maintenance stops deterministically; meaningful changes can
retain an assistant-only provisional response and inspectable potential
conflicts. If interpretation fails, the exact still-current change is attached
to ordinary conversation, while a later draft revision invalidates that
attachment.

The product owns the meaning of conversations, ideas, and drafting state and the
operations it requires from AI and storage. It does not own a particular model,
database, website, or deployment. That separation allows the product to be
developed in isolation and later integrated into a host.

## Integration boundary

The current website supplies these implementations outside the product:

```txt
apps/api/src/products/thoughtform/
├── mount.ts                                   Assembles the hosted product
├── delivery/                                  Host-owned disclosure and observations
├── adapters/ai/                               Connects product requests to packages/ai
├── adapters/persistence/                      Selects temporary or durable storage
├── adapters/usage/                            Accounts for hosted attempts and model usage
└── testing/                                   Host-specific model evaluation

packages/db/src/adapters/thoughtform/       Durable Prisma persistence
```

The reusable entry points are `shared/index.ts`, `server/index.ts`, and
`client/index.ts`. A future host should integrate through those product-owned
contracts rather than importing internal implementation files.

Every hosted model operation is admitted through the product-owned
`hosted-attempt` contract immediately before provider invocation. Conversation
response and Idea Map analysis are independent attempts. The API host captures
provider-neutral usage inside each admitted async context and completes the
record only after the relevant product persistence succeeds or fails. Durable
records contain quantitative operational metadata only and remain separate
from both workspace content and Langfuse observation.

## Where to look when something goes wrong

| Reported problem | Start here |
|---|---|
| Assistant asks the wrong question | `server/capabilities/conversation` |
| Incorrect idea appears or changes | `server/capabilities/idea-map` |
| Draft composition, revision, or proposal is wrong | `server/capabilities/drafting` |
| Several product parts interact incorrectly | `server/application/workspace` |
| Request validation or HTTP status is wrong | `server/delivery/http` |
| Editor layout or interaction is wrong | `client/workspace` |
| Conversation-list behaviour is wrong | `client/conversations` |
| A complete user journey regresses | `testing/browser` |
| Deterministic tests pass but real-model behaviour regresses | `testing/evaluations` |
| Product behaviour is correct but hosted AI or storage is wrong | Host adapters listed above |
| Hosted usage or attempt outcome is wrong | `server/capabilities/hosted-attempt`, then the host `adapters/usage` |

Within a capability, the filename identifies the next decision:

| Question | Conversation capability | Drafting capability |
|---|---|---|
| What behaviour should occur? | `conversation-service.ts` | `draft-service.ts` |
| Is model output valid? | `conversation-model-response.ts` | `draft-model-response.ts` |
| Is model context bounded correctly? | `conversation-model-request.ts` | `draft-model-request.ts` |
| What does the product require from AI? | `ports/conversation-model.ts` | `ports/draft-model.ts` |
| What product-language storage operations exist? | `conversation-store.ts` | `draft-store.ts` |
| What storage contract must an adapter fulfil? | `ports/conversation-persistence.ts` | `ports/draft-persistence.ts` |
| What small derived information is wrong? | `conversation-label.ts` | `draft-change.ts` |

Files inside `ports` describe requirements, not concrete OpenAI or database
implementations. Follow a port outward to a host adapter only when the product
requirement is correct but the external mechanism is not.

`DraftingState` is the drafting capability's persisted aggregate for an optional
Draft, its revisions, and revision proposals. It contains no output-format,
audience, publishing, or document-type state.

## Testing the product

- Colocated `*.test.ts` and `*.test.tsx` files protect neighbouring behaviour.
- `testing/fakes` provides deterministic external substitutes.
- `testing/fixtures` provides reusable product states and deterministic scenario model behaviour.
- `testing/browser` exercises complete product journeys.
- `testing/browser` includes personal reflection, unresolved feelings, a
  practical decision, an argument, early articulation, correction, and a user
  stopping before articulation through deterministic adapters.
- `testing/evaluations` checks those conversational shapes with a hosted model;
  invalid structured idea material fails the evaluation rather than being only
  reported.
- Host and database integration tests live beside the adapters they verify.

From the repository root:

```sh
pnpm exec vitest run packages/products/src/thoughtform
pnpm --filter @adambelton/products typecheck
pnpm test:e2e
```

For deeper product decisions, read
[`docs/products/thoughtform/`](../../../../docs/products/thoughtform/).
