# Terminology: ThoughtForm

## Status and use

This is the canonical naming reference for ThoughtForm. Consult it when
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
  important about the subject they are exploring.
- **Includes:** questioning, clarification, challenge, perspective-taking,
  reflection, paraphrasing, and finding precise language before a draft exists.
- **Does not mean:** a rigid phase, a workspace mode, or all work that occurs
  before some completion threshold.

Discovery can continue after a draft exists when composing exposes an unresolved
idea.

### Draft

- **Grammatical role:** common noun; artifact.
- **Preferred type name:** `Draft`.
- **Meaning:** the user's optional canonical private first-person expression of
  their current understanding.
- **Created by:** a successful operation that composes the first draft.
- **Changed by:** direct user edits or explicitly accepted assistant revision
  proposals.
- **Does not mean:** conversation history, the idea map, a lifecycle phase,
  completion, or public writing.

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

### Articulation

- **Grammatical role:** product-outcome noun; ordinary product-facing language.
- **Meaning:** the intended culmination of the reflective process: the user's
  current understanding expressed coherently enough for them to inspect and
  recognise as faithful.
- **Contained by:** a first-person Draft when the user reaches articulation.
- **Does not mean:** a third activity, command, lifecycle phase, completion state,
  assistant report, or objectively final understanding.

Use articulation to explain why bringing the material together is valuable. Use
compose for the operation, Composition for the internal activity, and Draft for
the artifact. A workspace may stop before articulation, but that possibility does
not make articulation an incidental or equivalent optional outcome.

## Workspace representations

### Workspace

The private body of connected work in which exploration, inspection, and
articulation can occur. It coordinates conversation history, the idea map, and a
Draft without merging them into one state object or requiring all three to exist
at every point in the journey.

### Drafting state

The drafting capability's persisted aggregate, represented by `DraftingState`.
Once composition succeeds, it owns the Draft, its revision history, and any
active revision proposal. It may exist as empty application state before a Draft
is created; its existence does not begin Composition.

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
Both are written from the user's first-person perspective rather than as an
assistant report about the user. Assistant assessment and workspace mechanics
remain separate product state and are not part of either field.

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

## Draft collaboration and host public writing

### Draft revision

The identity or concurrency token for the current canonical draft content. It
allows stale saves and proposals to be detected. It is not the same as a revision
proposal.

### Revision proposal

A bounded assistant-proposed change to a known draft revision. It remains
non-canonical until explicitly accepted and successfully applied. Use the full
term where “proposal” could be confused with a task proposal.

### Publishing

Publishing is not a ThoughtForm operation. Later host-website delivery may
turn locally prepared Markdown into public pages after product v1, but it does
not publish or mutate a product Draft.

### Writing post

An optional host-owned public website artifact. It is distinct from a private
product-owned `Draft`; no product publishing bridge is planned.

## Terms to avoid or qualify

### Entry

Do not use *entry* as a catch-all for conversation, draft, or published writing.
Name the actual resource. Ordinary prose may still use “entry” when it genuinely
means a journal or publication entry rather than a domain aggregate.

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
