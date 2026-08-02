# Terminology: The Socratic Draft

## Status and use

This is the canonical naming reference for The Socratic Draft. Consult it when
writing product contracts, code, prompts, task proposals, interface copy, and
documentation.

The product brief defines the intended product and the product architecture
defines its durable boundaries. This reference does not introduce another model;
it records the language used to describe that model consistently. If a proposed
name does not fit these distinctions, clarify the concept before adding the name.

Formal domain labels such as **Discovery** and **Composition** may be capitalised
when discussed as named concepts. Their code values remain lower-case.

## Core distinctions

### Discovery

- **Grammatical role:** proper domain noun; activity name.
- **Code value:** `discovery`.
- **Meaning:** working out what the user thinks, feels, means, or considers
  important about the ideas behind the writing.
- **Includes:** questioning, clarification, challenge, perspective-taking,
  reflection, paraphrasing, and finding precise language before a draft exists.
- **Does not mean:** a rigid phase, a workspace mode, or all work that occurs
  before some completion threshold.

Discovery can continue after a draft exists when composing exposes an unresolved
idea.

### Draft

- **Grammatical role:** common noun; artifact.
- **Preferred type name:** `Draft`.
- **Meaning:** the user's canonical private piece of writing.
- **Created by:** a successful operation that composes the first draft.
- **Changed by:** direct user edits or explicitly accepted assistant revision
  proposals.
- **Does not mean:** conversation history, the idea map, a lifecycle phase, or
  public writing.

Use *draft* when naming the writing itself: draft body, draft revision, create a
draft, revise the draft.

### Compose and composing

- **Grammatical role:** verb and gerund; operation language.
- **Preferred command/readiness language:** `compose`.
- **Meaning:** creating or developing the draft artifact.
- **Example:** “Compose a draft from these selected ideas.”

Use *compose* for what an operation does. Do not use it as the name of the draft
artifact.

### Composition

- **Grammatical role:** proper domain noun; activity name.
- **Code value:** `composition`.
- **Meaning:** the activity whose purpose is working on the writing itself.
- **Begins:** with the successful operation that creates the canonical draft.
- **Includes:** creating, structuring, rewriting, and revising the draft.
- **Does not mean:** the draft artifact or a specific operation.

The relationship is:

```txt
Composition activity -> composing operation -> creates or changes a Draft
```

A pre-draft offer to create a draft remains part of Discovery. Composition has
not begun merely because the assistant or user discusses composing.

## Workspace representations

### Workspace

The private body of connected work in which Discovery and Composition occur. It
coordinates conversation history, the idea map, and an optional draft without
merging them into one state object.

### Conversation history

The canonical ordered record of what the user and assistant actually said. It
preserves the path of inquiry but is not itself a draft or idea map.

### Conversation message and conversation turn

A **conversation message** is one user or assistant utterance. A **conversation
turn** is the retained interaction containing the user's message and the
assistant's response. Use the narrower term when implementation semantics matter.

### Idea

A stable, correctable unit of user-established material behind the writing. An
idea may contain a title, synthesis, substance, unresolved questions,
disposition, user interpretation, and qualitative assistant assessment.

An idea is not a paragraph, a conversation message, an unconfirmed assistant
hypothesis, or necessarily something that must appear in the draft.

### Idea map

The evolving, inspectable collection of established ideas and their product
state. It is distinct from both conversation history and the draft.

### Synthesis and substance

- **Synthesis:** the concise current shape of an idea for ordinary inspection.
- **Substance:** the richer, lightly curated material uncovered through
  Discovery, potentially including distinctions, experiences, examples,
  tensions, perspectives, counterarguments, uncertainties, and useful user
  language.

Neither may silently include unconfirmed assistant hypotheses.

## Interaction concepts

### Activity

The primary purpose of one interaction or operation: `discovery` or
`composition`. Activity is interaction metadata, not persistent workspace
lifecycle or a control the user must select.

### Assistant move

The technique used by the assistant in one response. A move answers **how the
assistant contributes**; activity answers **why the interaction is happening**.

Moves name concrete acts or their object rather than duplicating activity names.
Preferred draft-related move names are:

- `offer_draft`: offer to create the future draft artifact;
- `create_draft`: create the draft artifact;
- `revise_draft`: propose or perform the relevant draft-revision behaviour as
  defined by its operation.

`offer_draft` can occur during Discovery. `create_draft` and `revise_draft`
serve Composition because they work on the writing.

### Readiness

A qualitative, advisory assistant assessment about one possible action, such as
`reflect` or `compose`. Readiness is action-specific and may differ from user
intention. It is not a gate, completion score, phase, or objective truth.

### User intention

What the user explicitly asks or chooses to do, such as `explore`, `reflect`, or
`compose`. Intention remains distinct from readiness and does not prove that an
operation succeeded. For example, `compose` intention can be recognised before a
draft exists; only successful draft creation begins Composition.

### Command

A request for a product operation expressed in product language. Equivalent
natural-language and interface commands should have the same meaning.

### Event

A meaningful result that actually occurred, such as a conversation turn being
retained or a draft being created. An intention or model proposal is not an event
until the corresponding result succeeds.

## Draft collaboration and publishing

### Draft revision

The identity or concurrency token for the current canonical draft content. It
allows stale saves and proposals to be detected. It is not the same as a revision
proposal.

### Revision proposal

A bounded assistant-proposed change to a known draft revision. It remains
non-canonical until explicitly accepted and successfully applied. Use the full
term where “proposal” could be confused with a task proposal.

### Publishing

The explicit owner-only host operation that creates or updates public writing
from a private draft. Publishing is not part of the draft's ordinary save
lifecycle.

### Writing post

The host-owned public writing artifact, represented as `WritingPost`. It is
distinct from the private product-owned `Draft` even when it originated there.

## Terms to avoid or qualify

### Entry

Do not use *entry* as a catch-all for conversation, draft, or published writing.
Name the actual resource. Ordinary prose may still use “entry” when it genuinely
means a journal or publication entry rather than a domain aggregate.

### Articulation

Do not use *Articulation* as a formal activity. Discovery includes finding
language for meaning before a draft exists. Ordinary English uses such as “the
user articulates a concern” remain valid.

### Phase and mode

Do not represent intellectual progress as a general phase or persistent mode.
Use activity, move, readiness, intention, commands, events, and resource-derived
lifecycle for their distinct meanings.

### Completion

Do not describe an idea or workspace with a universal completion value.
Exploration and readiness are contextual and qualitative.

### Suggested reply

Suggested replies are not a current product concept or contract. They may be
reconsidered only if observed use shows that users need help steering the
conversation. Any future version must express direction, selection,
confirmation, or authorisation only and must never suggest substantive answers,
feelings, claims, interpretations, examples, or language that could be mistaken
for the user's own discovered material.

## Naming test

Before introducing or changing a term, ask:

1. Is this an artifact, activity, operation, assistant move, assessment,
   intention, command, event, or lifecycle fact?
2. Does the name identify that role rather than borrowing the name of a related
   concept?
3. Could a reader distinguish what the user wants, what the assistant judges,
   what the assistant does, and what actually succeeded?
4. Does the name preserve the separation between conversation, ideas, the draft,
   and public writing?
5. Is an existing term in this reference already sufficient?
