# Product Brief: The Socratic Draft

## Working title

**The Socratic Draft**

## Working definition

**The Socratic Draft** is a private Socratic writing tool that helps the user work out what they really think before helping them write it.

It starts with a rough thought, feeling, question, frustration, memory, argument, or idea. Through conversation, the assistant helps the user externalise what is in their head, examine it from different angles, distinguish feelings from claims, challenge assumptions where useful, track related threads, and eventually turn the process into a lightly polished private draft or optional public piece.

The purpose is not to generate writing from nothing.

The purpose is to help the user say what they mean.

## One-sentence essence

A Socratic writing tool that helps you work out what you really think before helping you write it.

## Product context

The Socratic Draft will live inside Adam’s personal website, not as a standalone product repository.

The personal website should be writing-first:

- the landing page shows published writing
- `/writing` shows the writing archive
- `/writing/[slug]` shows a public post
- `/products` shows products Adam has built
- `/products/socratic-draft` explains The Socratic Draft
- `/products/socratic-draft/editor` opens the editor/demo

The Socratic Draft is the first demoable product inside the personal site. Future products should be able to share the same server, auth, usage limits, admin, AI infrastructure, and product registry.

This means The Socratic Draft is both:

1. a real private writing tool for the owner, and
2. a public portfolio product that visitors can try in demo mode.

## Core idea

Many people have thoughts they want to write about, but struggle with the blank page.

The problem is not always lack of ideas or lack of writing ability. Often, the problem is that the user has not yet found the shape of the thought.

**The Socratic Draft** separates thinking from writing.

Instead of asking the user to begin with a finished point of view, it allows them to begin vaguely. The assistant acts as a Socratic writing partner: asking questions, drawing out details, surfacing assumptions, distinguishing feelings from claims, showing other sides of an argument, and helping the user see their own thought more clearly.

Only after that process does it help compose the entry.

## Category

**The Socratic Draft** is not simply an AI journal, blog tool, therapist, or writing assistant.

It is best understood as a **Socratic writing tool**: a private space where questioning comes before drafting, and where writing emerges from a process of reflection, challenge, clarification, and perspective-taking.

The central difference from generic AI writing tools is:

> Most AI writing tools start by drafting. The Socratic Draft starts by questioning.

## Primary user

The initial user is the builder.

The tool should be designed first as a personal system for daily writing, journaling, reflection, portfolio writing, case-study development, and thought development. It will live on the user’s website and include a public demo to showcase the work.

The user is a capable writer, but often feels blocked when facing a blank page. They may have many ideas, feelings, or observations in their head, but struggle to begin because writing requires too much structure too early.

The tool should make it possible to start before knowing exactly what the entry is “about.”

## Core job to be done

When I have something in my head but cannot yet express it clearly, help me explore it, understand it, test it, and turn it into writing that still feels like mine.

## What this is

This is part journal, part blog engine, part reflective thinking process, and part private writing room.

The comparison to therapy is useful only in the sense that therapy can help people understand their own thoughts. This tool should not be positioned as an AI therapist, and it should not make mental health claims. But it can borrow from reflective practice as a process:

- asking patient questions
- helping the user externalise thoughts
- noticing patterns and contradictions
- separating feelings from conclusions
- allowing uncertainty
- helping the user see themselves and their thoughts more clearly

The better description is:

> A tool for externalising your thoughts so you can examine them, develop them, and eventually express them clearly.

Writing is the output, but thinking is the primary activity.

## Product principles

### 1. Thinking comes before writing

The assistant should not rush to produce an entry.

The first job is to help the user understand what they are trying to say.

### 2. The user’s voice matters

The final writing should feel like the user’s own thought, not like an AI essay.

The assistant should preserve uncertainty, plainness, rhythm, and phrasing where possible.

### 3. Validate feelings, test claims

The assistant should make room for feelings without automatically validating every conclusion.

For example:

- “I feel trapped” is an experience to explore.
- “That means I am a bad husband” is a conclusion to challenge or nuance.

### 4. The assistant guides the inquiry

The frontend should not drive the intellectual process through explicit action buttons like “reflect,” “challenge,” or “compose.”

The user should be able to speak naturally.

The assistant should decide the next useful conversational move:

- ask a deeper question
- clarify a vague phrase
- challenge a harsh conclusion
- surface another perspective
- identify a branch
- reflect back when the picture is clear
- offer composition when the thought is explored enough

### 5. One question at a time

The assistant should not interrogate the user with a list of questions.

Most responses should be a short reflection or observation plus one good question.

### 6. Private by default

Everything starts private.

The tool should not ask about audience, publishing, structure, or form too early.

Private thought comes first. Public shape comes later.

### 7. Public form is intentional

Publishing should be a deliberate later step.

Only after the user indicates intent to publish should the tool ask what kind of public piece this might become.

### 8. Research supports reflection

Where a user makes factual claims, the tool may eventually help identify what needs checking.

Research should support the thought, not overwhelm it.

For MVP, live research can be owner-only or deferred.

### 9. The tool may change the user’s mind

A good session should not merely polish the user’s original view.

It should sometimes help the user notice that their first framing was too harsh, too vague, too broad, unsupported, or incomplete.

### 10. The user remains the author

The assistant can interpret, question, organise, and propose, but the user has
authority over what they mean, what matters, and what the draft says.

The user may change the draft directly at any time. Those changes are canonical
and do not require assistant approval. Changes proposed by the assistant should
remain proposals until the user explicitly accepts them through conversation or
the interface.

### 11. Assistant assessment stays limited and negotiable

The assistant may visibly assess qualitative exploration and contextual
importance without presenting either as objective truth. Its unconfirmed
hypotheses about themes, causes, forms, audiences, or possible directions remain
transient reasoning: they may guide a Socratic question or be offered explicitly
and tentatively in conversation, but they do not become idea-map content until
the user adopts, confirms, corrects, or meaningfully develops them.

### 12. Discovery and composition inform each other

Discovery is the work of finding out what the user thinks. It includes finding
language that clarifies what the user means before a draft exists. Composition is
the work of creating and continually developing the canonical draft from selected
ideas. A composition request or accepted composition offer creates the first
draft and begins that activity.

They are not rigid sequential phases once a draft exists. Composition may reveal
something undiscovered, causing a return to inquiry; further discovery may then
change the draft. Before a draft exists, reflection, paraphrasing, and figuring
out how to say what the user means remain discovery.

The product may classify the primary activity of a particular interaction or
operation and describe it subtly, but activity is not a persistent workspace mode
and the user should not have to operate a mode switch. Conversation and interface
controls should both let the user ask to explore, compose, structure, revise,
or return to an underlying question.

Activity describes why the work is happening. An assistant move describes how
the assistant contributes in a particular response. The same move may support
either activity, and an activity may occur without an assistant move—for example,
when the user edits the draft directly.

## Shared discovery and composition workspace

The Socratic Draft is a shared discovery and composition workspace rather than a
chatbot that eventually generates an essay.

It contains three connected representations:

1. **Conversation history** records what the user and assistant actually said.
2. **Idea map** makes the user's explored material visible, organised, and
   correctable, alongside limited qualitative assistant assessment.
3. **Draft** contains the user's canonical current composition of selected ideas.

Information can move in both directions. Conversation can change the idea map and
draft. A manual draft edit can reveal a changed idea, a structural preference, or
an unresolved question and can therefore affect later conversation.

Meaningful interface actions should participate in the same collaboration as
messages. Dismissing an idea in the tracker should have the same product meaning
as saying “that is not important.” Selecting an idea for deeper exploration
should have the same meaning as asking the assistant to focus on it.

The assistant should respond to substantive draft edits as evidence about the
work. It may recognise a clarified distinction, ask whether a removed idea should
be parked, or notice that new wording changes the claim. It should not interrupt
the user with commentary about trivial corrections.

## Product capabilities

The capabilities below are conceptually separate even when a single user action
passes through several of them. Each should have a clear responsibility and
narrow contracts so its behaviour can develop without spreading its internal
model across the product.

### Conversation and inquiry

Conversation helps the user externalise and examine what they think. It chooses a
useful next response while following the user's lead, and can vary from patient
guidance to precise collaboration with a user who already has a strong view.

The baseline should support concise, one-question-at-a-time inquiry and explicit
user redirection. Later development may improve move selection, handling of
ambiguity and contradiction, perspective-taking, inquiry style, and the ability
to recognise when composition should be offered rather than another question.

### Idea map

The idea map owns the ideas and relationships established through the user's
exploration. For each idea it may hold a concise title, a shared synthesis,
richer idea substance, grounded unresolved questions, connections, disposition,
explicit user interpretation, and qualitative assistant assessment.

The synthesis is the distilled current shape shown when the user inspects an
idea. The substance is the higher-resolution, lightly curated body of
distinctions, experiences, examples, tensions, perspectives, counterarguments,
uncertainties, and useful language uncovered through exploration. Sustained
inquiry may make one idea's substance several paragraphs long and rich enough to
support an entire piece of writing. It should accumulate coherent material
without becoming a transcript, and may preserve much more than the eventual
draft articulates.

Every canonical claim in a title, synthesis, substance, or unresolved question
must be traceable to something the user expressed or to assistant language the
user explicitly adopted, confirmed, corrected, or developed. The map must not
silently shape the idea by storing unconfirmed assistant hypotheses. Questions
about audience, genre, tone, evidence, and structure belong only when the user
has begun the corresponding composition work.

Two important dimensions are:

- **exploration:** how fully the idea appears to have been understood or expressed;
- **contextual importance:** how much explanatory, emotional, argumentative, or
  structural weight it appears to carry in the work as a whole.

These dimensions should not be collapsed into a flat completion percentage. A
high-importance, lightly explored idea may deserve attention; a lightly explored
idea the user has intentionally dismissed may not. The useful question is whether
an idea has been expressed deeply enough for the role the user wants it to play.

The user's interpretation and assistant's qualitative assessment can differ. The
product should preserve that difference and let the user
accept, correct, focus, satisfy, park, dismiss, reopen, or redirect an idea
without requiring the assistant to pretend its own assessment never existed.

The baseline may begin with a simple expandable list of idea syntheses, with
their richer substance available for deeper inspection.
Later development may add relationships, competing interpretations, structural
roles, evidence, unresolved tensions, separate-piece candidates, and richer ways
to compare perceived importance with intended importance.

### Drafting and revision

The draft is private, mutable, and user-owned. It is separate from conversation
history and does not need to contain every explored idea.

Composition should assemble material whose meaning and intended role are clear
enough for the requested purpose. The assistant may advise that an uncertainty
remains, but the user can request an early or deliberately rough draft.

The assistant should propose edits at an understandable scope—a phrase, passage,
section, structure, or whole draft—and apply them only after explicit acceptance.
The user can accept, reject, amend, or discuss a proposal. Direct user edits take
effect immediately and become context for subsequent inquiry and revision.

Later development may support multiple structural alternatives, passage-level
discussion, richer comparisons, selective application, and returning from a
composition problem to discovery without losing the draft.

### Preference learning

Preference learning maintains an inspectable and correctable body of evidence
about how the user prefers to inquire, compose, structure, and edit their writing.
It is broader than a surface-level voice profile.

Preferences may concern:

- voice, rhythm, vocabulary, directness, uncertainty, and degree of polish;
- appetite for questions, challenge, examples, or abstraction;
- narrative and argumentative structure;
- recurring devices such as contrast, callbacks, scenes, or open endings;
- editorial choices revealed through accepted, rejected, or manually rewritten
  suggestions.

Observed, inferred, explicitly confirmed, contextual, and rejected preferences
should remain distinguishable. Preferences may have evidence, confidence, scope,
recency, and exceptions. They should guide rather than constrain: the assistant
must not turn the user's past writing into a fixed caricature.

The baseline should favour explicit preferences and corrections, with an
inspectable owner profile. Later development may learn cautiously from repeated
edits, acceptance and rejection patterns, contextual differences between kinds of
writing, conflicts, recency, and model-assisted inference. Those improvements
should remain inside the preference capability rather than changing the
responsibilities of conversation, idea mapping, or drafting.

Demo preference learning is limited to the temporary workspace. Persistent
cross-work preferences are owner-only.

### Workspace orchestration

Workspace orchestration coordinates meaningful product events across the other
capabilities without owning their domain logic. A user message, idea-control
action, accepted proposal, structural change, or substantive manual edit can all
update the shared work and inform the assistant's next response.

The baseline should establish explicit events and small capability contracts.
Later behaviour can become more sophisticated without creating a single
monolithic service or requiring every module to understand every other module's
internal representation.

## Assistant-led conversation model

The user introduces an idea. The assistant guides the conversation until the topic is sufficiently explored.

The user does not need to choose the next mode.

A typical flow:

1. User introduces a rough thought.
2. Assistant asks a probing question.
3. User answers.
4. Assistant clarifies, challenges, or deepens depending on what the user says.
5. Assistant tracks threads and claims internally.
6. Assistant reflects back only when it has a clear picture.
7. User confirms or corrects the reflection.
8. Assistant offers to compose a private draft.
9. User can draft, keep exploring, or add another thought.
10. Only later, user may choose to shape the entry for publishing.

The assistant assesses whether something appears explored enough and explains
relevant uncertainty. The user decides whether to continue, change scope, or
proceed anyway.

## Core conversation concepts

### Moves

A move is the assistant’s next conversational act.

Examples:

- probe
- clarify
- challenge
- surface perspective
- distinguish
- ask for example
- partial reflection
- full reflection
- branch check
- suggest research
- offer composition
- compose private draft
- revise private draft
- offer publishing

Moves are chosen by the assistant/backend conversation service, not the frontend.
A move is a technique rather than a phase or purpose. Clarification, for example,
may support discovery when meaning is uncertain or composition when meaning is
known but the language is imprecise.

### Activity, readiness, and lifecycle

The product should not represent intellectual progress with one general phase.
That would combine the purpose of the current work, the assistant's judgment
about useful next actions, and the resources that exist.

Keep these separate:

- **Activity** is the primary purpose of an interaction or operation: discovery
  or composition. It is not a persistent workspace mode.
- **Move** is the assistant's specific technique in one response. Moves and
  activities have a many-to-many relationship.
- **Readiness** is an assistant assessment about a specific possible action, such
  as reflection or composition. It is advisory and may differ from the user's
  explicit intention.
- **Lifecycle** is derived from real resources and publishing state, such as
  whether a private draft exists or `published_at` has been set.

An activity may have no assistant move. Directly rewriting a paragraph is an act
of composition even if the assistant does not respond. Clarifying meaning or
finding more precise language before a draft exists remains discovery.

The user does not need to agree with assistant readiness. The assistant may assess
that a confident draft is not ready while the user explicitly requests a rough
draft that preserves unresolved uncertainty.

### Explored enough

“Explored enough” is contextual shorthand, not a stored workspace-wide boolean.
It means selected material has enough substance for a particular next action and
intended role.

It does not mean the topic is finished.

A topic is not explored enough if:

- the user has only named a broad topic
- the emotional centre is unclear
- the key tension is unclear
- the user has used loaded words without unpacking them
- there are obvious contradictions
- there is no concrete detail
- there are several competing threads and no central one

### Near-ready / ready to reflect

Near-ready to reflect means the shape is emerging, but one important uncertainty remains.

Ready to reflect means the assistant can accurately say:

> I think the shape of this is...

Reflection is a checkpoint, not the final draft.

The user can confirm, correct, or redirect.

### Should offer composition

The assistant should offer composition when:

- the topic is explored enough
- a full reflection has been given
- the user has confirmed or refined the reflection
- there is enough of the user’s own language to preserve

The assistant should not automatically compose unless the user accepts.

### Detected threads

A thread is a meaningful line of thought inside the conversation.

Examples:

- grief for an imagined life
- guilt around naming limits
- feeling trapped without blame
- work and money as a possible separate thought

Threads should have statuses such as:

- surfaced
- needs fleshing out
- active
- central
- supporting
- parked
- separate entry candidate
- resolved
- discarded

This lets the assistant distinguish between:

- a central thread that needs more exploration
- a supporting thread that belongs in the same entry
- a surfaced but uncertain thread
- a tangential idea to park
- a separate idea that may become another entry
- something the user has clarified is not relevant

### Detected claims

A claim is an assertion that may need care.

Claims may be:

- feelings
- experiences
- self-judgements
- moral claims
- interpretations
- factual claims
- predictions

The assistant should not treat all claims the same.

Examples:

- “I feel trapped” → accept as feeling and explore.
- “That means I am selfish” → challenge or nuance.
- “FIFA breaks its own rules” → possible research candidate.

## Example: private draft about being a carer

User begins:

> I want to write about being a carer for my wife, but I don’t know where to start. I think it has changed the way I think about love, responsibility, resentment, guilt, and what a good life actually means.

The assistant should not ask what kind of post this is.

It should begin privately and ask something like:

> There is a lot in that: love, duty, resentment, guilt, and the question of what kind of life still feels possible. Rather than trying to write about all of it at once, I’d start with the part that feels hardest to admit. When you think about being a carer for your wife, what is the thing you find most difficult to say honestly, even privately?

If the user says:

> Sometimes I feel trapped.

The assistant might clarify:

> That distinction feels important: the trapped feeling is real, but it is not the same thing as blaming her. When you say your life feels smaller than you imagined, what kind of largeness do you feel you have lost?

If the user says:

> I suppose that means I’m selfish. Or that I’m a bad husband.

The assistant should challenge:

> I would be careful with that conclusion. Feeling grief about your own life does not mean you are denying her suffering, and it does not automatically make you selfish.

Only once the central thought is clear should the assistant reflect back:

> I think the shape of this is becoming clear...

And only once the user confirms should it offer composition:

> I think we have enough to turn this into a private draft now. Do you want me to draft it, or is there another part you want to explore first?

## Private/public model

Entry visibility has only two states:

- private
- public/published

There should not be separate draft/revisit/public states.

Use `published_at` as the source of truth:

- `published_at = null` means private
- timestamp means public

`is_public` should be derived, not stored.

The private draft body is canonical.

A public version may differ, but only after publishing preparation.

## Intended forms

There should be no “case study mode” or separate writing modes at the start.

Everything begins as private writing.

Only after the user indicates intent to publish should the tool ask what form the piece might take.

Possible intended forms:

- blog post
- portfolio case study
- project write-up
- opinion piece
- personal essay
- public note

Intended forms should be configurable records, not a hardcoded enum.

A case study intended form should help gather:

- context
- original problem
- who the problem affected
- constraints
- user’s role
- product thinking
- technical decisions
- tradeoffs
- collaboration
- outcomes
- honest limits on what can be claimed
- reflection

The tool should not invent or exaggerate impact. If outcomes were not measured, it should help say that honestly.

## Voice profile

Voice should be implicit, not a settings screen.

The tool should learn from:

- how the user writes
- how the user edits AI output
- phrases the user keeps
- phrases the user rejects
- preferred uncertainty
- disliked AI patterns
- how much polish is acceptable

Example internal guidance:

> The user writes in plain, reflective language. They often qualify their claims and prefer not to overstate certainty. Preserve uncertainty where meaningful. Avoid motivational phrasing, corporate language, therapy clichés, and inflated significance. Lightly clarify rather than rewrite. Use the user’s own wording wherever possible.

For MVP, persistent voice profile can be owner-only.

Demo mode can adapt within the current session but should not persist a voice
profile. For owner use, this concept is expanded by the preference-learning
capability described above: voice is one part of a broader, inspectable model of
inquiry, structural, narrative, and editorial preferences.

## Personal website and product demo model

The Socratic Draft lives within a single personal website repository.

The website should include:

- published writing as the landing page
- a writing archive
- individual writing pages
- a products overview page
- product pages for demoable projects
- The Socratic Draft editor
- owner-only admin

The products page should present products as things Adam has built, with The Socratic Draft as the first live demoable product.

Future products can share the same infrastructure.

## Hosted demo model

The UI should not expose account registration.

Visitors access the demo by entering their email and receiving a passwordless login link.

Preferred language:

> Enter your email to access the demo.

> I’ll send you a secure login link.

> Demo access includes a limited number of AI requests each day.

Demo is for showcasing what was built, not for offering a persistent product account.

Demo users’ writing should not be persisted server-side.

Persist allowed:

- user email
- email domain
- created at
- last login at
- usage events
- access level
- model usage
- token counts

Do not persist for demo users:

- conversations and drafts
- conversation turns
- voice profiles
- research notes containing private writing
- public posts

Demo session state should live in browser memory or temporary local state.

At the end of a demo, offer:

- copy final draft
- download Markdown
- download JSON
- clear session

## Owner access

Owner access includes:

- persistent conversations and private drafts
- saved conversation history
- voice profile
- intended form management
- publishing to website
- optional research
- exemption from demo limits
- admin view of demo emails and usage

Owner detection can be based on an environment variable:

```txt
OWNER_EMAIL=hello@adambelton.com
```

If the authenticated email matches `OWNER_EMAIL`, the user is the owner. Otherwise, they have demo access.

## Demo access

Demo access includes:

- limited hosted AI usage
- no server-side writing persistence
- no publishing
- no long-term voice profile
- possibly no live research
- copy/download/clear session

The demo should feel like:

> Try a Socratic writing session.

Not:

> Create an account for your journal.

## Admin visibility

The owner should be able to see simple demo access information:

- email
- domain
- accessed demo
- last login
- usage count
- product accessed

This is not meant to be invasive analytics. It is basic access and cost visibility.

## Usage limits and cost protection

Because hosted demo usage uses the owner’s AI backend, demo access needs cost protection.

Use:

- per-user daily request limits
- per-user daily token limits
- per-request input/output limits
- model allowlist
- email login protection
- global daily spend cap
- hosted AI kill switch
- ability to restrict abusive emails or domains
- product-aware usage events

Research should likely be owner-only at first because it may be more expensive.

## Repository and implementation philosophy

The repository should be scaffolded with its intended long-term package boundaries from the beginning.

Even if some packages are initially thin, these packages should exist on day one:

- `apps/web`
- `apps/api`
- `packages/shared`
- `packages/db`
- `packages/auth`
- `packages/ai`
- `packages/products`

Shared types should be created before feature implementation.

The goal is to avoid ad hoc types and helpers being created across the repo during implementation.

Principle:

> Create the architecture early. Implement the behaviour gradually.

## Self-hosting

The repository can be public.

People who want their own AI key, data control, or privacy can clone the repo and self-host.

Self-hosters are responsible for:

- AI provider keys
- database setup
- auth configuration
- deployment
- usage limits

Hosted bring-your-own API key is not part of the current plan.

## MVP scope

### Must have

- Single personal website repo
- Published writing as the landing page
- Products page
- The Socratic Draft product page
- The Socratic Draft editor route
- Passwordless email auth
- Owner access via `OWNER_EMAIL`
- Demo access for non-owner authenticated emails
- No server-side persistence of demo writing
- Daily AI request limits for demo users
- Owner private writing interface
- Assistant-led conversation flow
- One-question-at-a-time behaviour
- Activity, moves, action-specific readiness, and resource-derived lifecycle
- Thread and claim detection
- Reflection only when assistant has a clear picture
- Composition offer once topic is explored enough
- Lightly polished private draft generation
- Owner saves conversations and private drafts
- `published_at` controls public visibility
- Owner publishes to website writing
- Basic implicit owner voice profile
- Product-aware usage events
- Open-source repo/self-hosting instructions
- Node + Hono API server
- Final-shaped monorepo scaffold from day one
- Shared types defined up front

### Should have

- Basic admin view showing demo emails, domains, products accessed, and usage
- Token usage tracking
- Global spend cap
- Demo copy/download
- Intended forms table
- Completeness check for public writing
- Targeted private writing after intent to publish
- Regeneration controls such as “use more of my wording,” “less polished,” and “clearer”

### Could later have

- Research with citations/source notes
- Recurring themes/memory across owner conversations and drafts
- “You’ve written about this before”
- Weekly/monthly summaries
- Search past thoughts
- Newsletter export
- RSS
- Local-first/encrypted storage
- More live product demos on the personal site

### Not MVP

- Hosted bring-your-own-key
- Exposed registration
- Persistent demo drafts
- Persistent demo voice profile
- Demo publishing
- Multiple writing modes
- Complex onboarding
- Social/public discovery
- AI therapist positioning
- Mood tracking
- Analytics dashboards
- Prompt libraries
- Gamified streaks
- Heavy CMS
- Generic product platform abstraction

## Success criteria

The product is working if:

- the owner writes more often
- the owner feels less blocked by the blank page
- drafts feel like the owner’s thoughts, not AI essays
- the assistant uncovers meaning the user could not initially express
- the assistant surfaces perspectives the user had not considered
- the assistant sometimes helps refine or change the user’s view
- private reflections can become public writing deliberately
- portfolio case studies can be developed without over-performing
- demo users understand the product without their writing being saved
- hosted demo usage remains affordable and controlled
- the codebase remains understandable and modular as more products are added
