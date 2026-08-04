# ThoughtForm

ThoughtForm is a private conversational thinking workspace that helps a
person explore, organise, and express what they think or feel. Conversation and
the Idea Map can stand alone; an optional Draft contains a first-person
articulation when bringing the material together would be useful. This guide is the
starting point for developing, integrating, testing, or diagnosing the product
without first learning the surrounding website.

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
│   │   │   └── ports/                         AI and storage requirements
│   │   ├── idea-map/                          Maintains established, correctable ideas
│   │   └── drafting/                          Composes, versions and revises the draft
│   │       └── ports/                         AI and storage requirements
│   ├── application/                           Coordinates complete user operations
│   │   └── workspace/                         Connects conversation, ideas and drafts
│   └── delivery/                              Ways to invoke product operations
│       └── http/                              Browser-facing HTTP entrance
│
└── testing/                                   Product-owned verification
    ├── fakes/                                  Deterministic external substitutes
    ├── fixtures/                               Reusable example product states
    ├── browser/                                Complete user journeys
    └── evaluations/                            Real-model behavioural checks
```

## How the pieces interact

```txt
User action
  → product interface
  → HTTP entrance
  → workspace application operation
  → conversation, Idea Map, or drafting capability
  → product-defined port
  → host-supplied AI or persistence adapter
  → result returned to the interface
```

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
├── adapters/ai/                               Connects product requests to packages/ai
├── adapters/persistence/                      Selects temporary or durable storage
└── testing/                                   Host-specific model evaluation

packages/db/src/adapters/thoughtform/       Durable Prisma persistence
```

The reusable entry points are `shared/index.ts`, `server/index.ts`, and
`client/index.ts`. A future host should integrate through those product-owned
contracts rather than importing internal implementation files.

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

Within a capability, the filename identifies the next decision:

| Question | Conversation capability | Drafting capability |
|---|---|---|
| What behaviour should occur? | `conversation-service.ts` | `draft-service.ts` |
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
- `testing/fixtures` provides reusable product states.
- `testing/browser` exercises complete product journeys.
- `testing/browser` includes personal reflection, unresolved feelings, a
  practical decision, an argument, early articulation, correction, and valid
  no-Draft use through deterministic adapters.
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
