# The Socratic Draft

The Socratic Draft is a private writing workspace that helps a person discover
what they think and turn established material into writing. This guide is the
starting point for developing, integrating, testing, or diagnosing the product
without first learning the surrounding website.

The product follows the repository's [organising principles](../../../../README.md):
ownership is explicit, product meaning is separated from external mechanisms,
and each path should narrow a reported behaviour to one likely responsibility.
Canonical product language lives in
[`docs/products/socratic-draft/terminology.md`](../../../../docs/products/socratic-draft/terminology.md).

## How the product is organised

```txt
packages/products/src/socratic-draft/
│
├── shared/                                    Product vocabulary and contracts
│
├── client/                                    What the user sees
│   ├── pages/                                 Complete product pages
│   ├── conversations/                         Saved-conversation interface and actions
│   ├── workspace/                             Conversation, Idea Map and semantic draft editor
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

The product owns the meaning of conversations, ideas, and drafting state,
including optional Draft Format guidance and the
operations it requires from AI and storage. It does not own a particular model,
database, website, or deployment. That separation allows the product to be
developed in isolation and later integrated into a host.

The Draft body is versioned constrained semantic Markdown. Drafting owns its
grammar, deterministic normalization, safe-link and placeholder validation,
legacy plain-text projection, immutable revisions, semantic selections, and
classified derived changes. The client contains one MDXEditor adapter; editor
state and Lexical node identities never cross the product boundary.

## Semantic editor implementation boundary

`client/workspace/editor/SemanticDraftEditor.tsx` is the only production module
that imports MDXEditor. It translates the product's constrained Markdown into
one editing engine; it does not define canonical meaning. Future editor work
must preserve these implementation constraints:

- MDXEditor emits a single trailing newline. Server normalization owns that
  canonical rule, so client output must always pass through drafting validation.
- A restricted plugin set limits visible controls but is not a security
  boundary. Source mode, arbitrary HTML, MDX/JSX, and unknown directives remain
  excluded and are rejected on the server.
- The adapter's `getSelectionMarkdown()` and `insertMarkdown()` methods support
  structured selection and exact replacement. Lexical keys and editor positions
  must never be stored; product selections stay bound to a canonical revision
  and are revalidated against canonical Markdown.
- Link and image-placeholder fields are product-owned because the engine's
  built-in dialogs did not provide the required labelling and focus behaviour.
  Dialog close paths must restore focus deliberately.
- `Enter draft editor` and the focusable `Leave draft editor` control are the
  explicit keyboard routes around the contenteditable surface.
- Image placeholders are custom `image-placeholder` container directives. Their
  description, purpose, proposed alt text, and caption are semantic Draft
  content. Real images require a future product port returning a logical private
  asset reference; blobs, data URLs, upload persistence, and publication assets
  do not belong in this adapter.
- Server-driven loads, restoration, and proposal acceptance remount the adapter
  by immutable Draft revision. Unsaved editor state must not be mistaken for a
  canonical revision or silently merged across a revision change.

Reconsider MDXEditor only when implementation evidence identifies a concrete
failure in semantic range addressing, exact structured replacement, keyboard or
screen-reader operation, or required extensibility. General editor preference is
not sufficient evidence to reopen the decision.

## Integration boundary

The current website supplies these implementations outside the product:

```txt
apps/api/src/products/socratic-draft/
├── mount.ts                                   Assembles the hosted product
├── adapters/ai/                               Connects product requests to packages/ai
├── adapters/persistence/                      Selects temporary or durable storage
└── testing/                                   Host-specific model evaluation

packages/db/src/adapters/socratic-draft/       Durable Prisma persistence
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
| Draft Format is not retained or is applied unexpectedly | `server/capabilities/drafting` |
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

`DraftingState` is the drafting capability's persisted aggregate. It can exist
before a `Draft`: an optional free-text Draft Format and its concurrency revision
are retained independently of canonical draft content, draft revisions, and
revision proposals. An absent format means free-form writing. The current
product saves and displays format but deliberately does not supply it to
conversation, composition, revision, or publishing behaviour.

## Testing the product

- Colocated `*.test.ts` and `*.test.tsx` files protect neighbouring behaviour.
- `testing/fakes` provides deterministic external substitutes.
- `testing/fixtures` provides reusable product states.
- `testing/browser` exercises complete product journeys.
- `testing/evaluations` checks behaviour that depends on a hosted model.
- Host and database integration tests live beside the adapters they verify.

From the repository root:

```sh
pnpm exec vitest run packages/products/src/socratic-draft
pnpm --filter @adambelton/products typecheck
pnpm test:e2e
```

For deeper product decisions, read
[`docs/products/socratic-draft/`](../../../../docs/products/socratic-draft/).
