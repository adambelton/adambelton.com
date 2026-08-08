# Product Brief: ThoughtForm

## Status and authority

This document is the canonical product brief for ThoughtForm. It defines what the
product is for and the experience it should create. The product architecture
defines its durable technical boundaries, and the terminology reference defines
the language used in code, prompts, tasks, interface copy, and documentation.

## Working definition

**ThoughtForm is a private conversational thinking workspace that helps a
person explore, organise, and articulate what they think or feel about a
subject.**

The user may begin with an incomplete thought, feeling, experience, question,
memory, frustration, contradiction, decision, or observation. The assistant
helps them examine it through focused conversation, makes established material
inspectable in an idea map, and can help bring the emerging understanding into a
coherent first-person plain-text Draft.

The most accessible gateway is a familiar moment:

> Something is bothering me, but I cannot put my finger on why.

That is not the whole product scope. A person may instead be thinking through a
decision, experience, reaction, idea, argument, professional situation, or any
other subject they do not yet understand coherently.

The characteristic value lies in recognition:

> Yes, that is what I think.

> Yes, that is how I feel.

> Yes, that captures what I was trying to understand.

The product is not primarily an AI writing tool. Writing can be a downstream use
of the resulting articulation, but publication, audience, format, and document
production do not determine the core experience.

## One-sentence essence

Explore what is on your mind, inspect and organise what emerges, and bring it
together in words that feel like your own.

## Core proposition

Most AI tools try to give the user an answer. ThoughtForm helps the user
understand and express their own.

It does not decide what the user believes, silently turn assistant hypotheses
into the user's position, or treat fluent prose as evidence of truth. It helps
the user develop a current, correctable model of what they think or feel.

## Product context

ThoughtForm is the first product inside Adam's personal website and
product-demo platform. It is:

1. a real private tool designed first for Adam's own use; and
2. a portfolio demo with an implemented temporary-workspace capability whose
   non-owner production release remains gated.

Its current operating intent is a portfolio project and product experiment, not
a launched commercial service. Its primary validation is whether sustained
production use helps Adam think and express himself more clearly. Deterministic
tests and hosted evaluations verify product contracts and policy bounds; they do
not constitute market, clinical, wellbeing, or commercial validation.

## Intended user

The product is for anyone who benefits from thinking through interaction with an
attentive counterpart. It does not claim that conversational thinking is better
than writing alone, outlining, walking, voice notes, diagramming, or talking to
another person. It supports one particular thinking style.

The initial and authoritative user is Adam. Product scope should be judged by
usefulness to that owner workflow, while the public demo remains understandable,
private, bounded, and safe.

## Primary job to be done

> When something is on my mind but I do not yet fully understand what I think or
> feel about it, help me explore and organise it, then help me express my current
> understanding in words I recognise as my own.

Supporting jobs include:

- identifying what is actually important or troubling;
- distinguishing a feeling, experience, assumption, inference, and conclusion;
- separating related ideas and seeing how they connect;
- finding the experience behind an abstract belief;
- surfacing a tension, contradiction, or alternative perspective;
- recognising what remains unresolved or requires more information;
- preparing thoughts for a later decision, conversation, or separate writing
  process;
- producing a coherent first-person expression without inventing certainty.

## The core journey

The product-facing flow is **Explore → Inspect → Articulate**:

1. **Explore** — the user talks through what is on their mind.
2. **Inspect** — the evolving Idea Map makes the system's interpretation visible
   so the user can examine and correct it.
3. **Articulate** — the resulting understanding is brought together into a
   coherent first-person expression.

These labels explain the experience. They do not replace the existing Discovery
and Composition domain concepts or create stored phases, modes, or gates.

```txt
Something is on the user's mind
        ↓
Focused Socratic conversation
        ↓
Thoughts, feelings, assumptions, and tensions become visible
        ↓
The idea map organises the established material
        ↓
The resulting understanding is composed as a first-person Draft
        ↓
The user reads, confirms, corrects, rejects, or refines it
        ↓
“Yes, that captures what I currently think or feel”
```

Exploration and inspection create value, but articulation is the intended
culmination and likely the moment where ThoughtForm proves its distinctive value.
It consolidates the reflective process: the user encounters the emerging model
as a coherent whole and can recognise, reject, or correct it. The product's
expected cathartic benefit principally lives in that recognition, without being
a promised or clinically validated outcome.

Articulation is not mechanically required. A user may pause, stop after a useful
conversation, inspect or correct the Idea Map, or deliberately leave tensions
unresolved. That use is valid, but it is not presented as an equivalent intended
endpoint. The system does not force continuation or turn articulation into a
stored completion flag, progress score, mandatory phase, or claim that the
person's understanding is objectively final.

## The three representations

### Conversation history

Conversation preserves the route through the thought: what the user and
assistant said, questions, reflections, corrections, competing interpretations,
changes of emphasis, and redirection. It is neither a prompt log whose only
purpose is generating text nor the final expression itself.

### Idea map

The idea map is the inspectable, correctable model of user-established material.
It can contain thoughts, feelings, experiences, beliefs, distinctions,
assumptions, tensions, uncertainties, unresolved questions, examples, and ideas
the user has parked or dismissed.

It helps the user see what is separate, connected, important, changed, uncertain,
or misunderstood. It is not an article outline and must not silently contain
unconfirmed assistant hypotheses.

### Draft

A Draft is the canonical, editable plain-text expression through which the
product normally articulates the user's current understanding. It is written in
the first person as the user's own expression, not as an assistant report about
the user. A workspace can exist without one because articulation is not
mechanically enforced.

It may be one sentence, a paragraph, connected observations, a short reflection,
or a longer account. It may preserve uncertainty, mixed feelings, incomplete
evidence, provisional conclusions, and tensions that cannot yet be reconciled.
Its shape and length should be the minimum required to express the established
material coherently.

The Draft remains provisional and correctable. It is not publication-ready by
definition, does not imply an audience, and does not begin a completion state.

## Discovery, composition, and articulation

**Discovery** is the activity of finding out what the user thinks, feels, means,
or considers important. It includes questioning, reflection, clarification,
challenge, perspective-taking, and finding precise language before or after a
Draft exists.

**Composition** is the internal activity of creating or developing the canonical
Draft. Compose is the accurate operation verb, and Draft is the accurate artifact
noun.

**Articulation** describes the intended product culmination and value: the
user's current understanding expressed coherently enough to inspect and
recognise. It is not a third activity, lifecycle phase, command, stored status,
or synonym for every act of composing.

The relationship is:

```txt
Discovery establishes and organises material
Composition creates or develops the Draft through which articulation occurs
The Draft contains a first-person articulation
Recognition happens when the user judges that articulation faithful
```

The interface may use approachable language such as “Put this into words” or
“Bring this together” while internal operations retain `offer_draft`,
`create_draft`, compose, revision, and Draft terminology.

## Product principles

### 1. Make the user more capable; do not replace their judgement

> Reflective technology should make the user more capable, not replace their
> judgement.

The goal is clarity, understanding, and agency. The assistant supports the user
without becoming the authority, and the product must not optimise for dependency,
excessive engagement, or manufactured retention.

### 2. Help the user think; do not think for them

The assistant asks focused questions, reflects carefully, makes distinctions,
tests inferences, and helps organise what emerges. It does not supply the user's
identity, beliefs, feelings, or conclusion.

### 3. The user is authoritative about personal meaning

Canonical idea material comes only from what the user expressed, adopted,
confirmed, corrected, or meaningfully developed. Assistant hypotheses remain
tentative conversation until the user establishes them.

### 4. Interpretation must remain inspectable and correctable

The Idea Map exists partly to expose how the system currently understands what
has emerged. Speculative assistant interpretations remain tentative and must not
silently enter the user's recorded understanding.

### 5. One useful question at a time

Most inquiry responses contain one concise reflection, distinction, or
observation and one well-chosen question. Avoid questionnaires, repetitive
paraphrase, generic encouragement, automatic agreement, and forced challenge.

### 6. Feelings are respected without turning conclusions into facts

“I feel trapped” is an experience to acknowledge and explore. It does not prove
“I have no choices.” The assistant should neither invalidate the feeling nor
automatically validate every inference attached to it.

### 7. Uncertainty must survive

Fluency must not turn uncertainty into confidence. The conversation, idea map,
and Draft may retain ambiguity, disagreement, missing information, and
provisional conclusions.

### 8. Articulation is the intended culmination without being compulsory

The assistant should help bring the current understanding together when the
reflective process can be consolidated, and the user may request a Draft at any
time. Readiness is advisory. The absence of a Draft is not failure, but neither
is it the product's equivalent intended endpoint.

### 9. Recognition requires correction

The user can inspect, reject, edit, qualify, or revise the Draft until it feels
faithful enough for the user's current purpose. Direct edits are canonical;
assistant changes remain reviewable proposals until accepted.

### 10. Private plain text is the product artifact

ThoughtForm does not select a Draft Format, impose an audience or template,
manage rich text or images, publish content, act as a CMS, or own a Markdown
delivery pipeline.

Adam may copy the plain text into Obsidian, add structure and formatting locally,
and feed a later host-owned Markdown pipeline for static website pages. That is a
separate website workflow after product v1, not ThoughtForm behaviour.

## Assistant role and response policy

The assistant may:

- ask a focused question;
- clarify ambiguous language;
- reflect meaning tentatively;
- distinguish related thoughts or a feeling from a conclusion;
- identify a possible assumption, inference, tension, or alternative;
- ask for a concrete example or why something matters;
- help the user organise established material;
- guide the work toward articulation without forcing it, and offer to compose a
  Draft when the current understanding can usefully be brought together;
- help correct that Draft without silently changing the user's meaning.

The assistant must not:

- rush toward a Draft or polished prose;
- assume an audience, format, publication goal, or desired length;
- pathologise ordinary thoughts and feelings;
- diagnose, treat, or present itself as a therapist;
- imply that it knows the user's identity or experience better than the user;
- encourage emotional dependency or exclusive reliance;
- manufacture resolution, confidence, emotional meaning, or stronger claims;
- place speculative interpretations into the idea map or Draft silently.

## Opening and articulation experience

The preferred opening is:

> What would you like to think through?

Suitable alternatives include “What is on your mind?” and “What would you like
to explore?” The product should not begin by asking what the user wants to write,
who the audience is, which format they need, or how long the output should be.

When enough material has emerged, the assistant may ask whether it would help to
put it into words. The user may also request this immediately. Important gaps or
uncertainty can be explained, but they never prevent the request.

The recognition loop is:

1. The system composes a Draft from user-established material.
2. The user reads it as a whole.
3. The user confirms, rejects, directly corrects, or qualifies it.
4. Assistant revisions remain proposals until explicitly accepted.
5. The loop continues for as long as it remains useful.

There is no final approval state. “Yes, that captures it” is the user's
recognition in a particular moment, not a permanent product assertion.

## Safety, wellbeing, and portfolio positioning

Reflective use may help someone slow down, identify a feeling, separate an
experience from a conclusion, prepare for a conversation, or experience clarity
or catharsis through expression. These are plausible personal benefits, not
clinical or scientifically validated claims.

An accessible category or first-use framing is:

> Open-source, AI-assisted cathartic journaling platform.

This is positioning for a possible future product model, not the project's
current operating model or a therapeutic outcome claim. *Cathartic journaling*
describes the recognisable use of conversation, inspection, and articulation; it
must not reduce ThoughtForm to a blank journal or emotional dumping ground. The
structured reflective process and correctable Idea Map are essential
distinctions.

ThoughtForm is not:

- a therapist or replacement for another person;
- a mental-health or wellbeing intervention;
- a diagnostic, clinical, or crisis-support tool;
- an authority on the user's identity, relationships, memories, or experience.

A suitable boundary statement is:

> ThoughtForm is not a therapist, diagnostic tool, crisis service, or
> substitute for professional support. It is a conversational thinking workspace
> designed to help you explore and put your own thoughts and feelings into words.

The product is an owner-used portfolio demo, so its safety work should be
proportionate. It still needs truthful public copy, privacy protection, bounded
model behaviour, and safe handling of sensitive demo input. It should not expand
into a clinical product programme or claim mental-health efficacy.

## Conceptual commercialisation model

ThoughtForm is currently a portfolio project and product experiment. The model
below records how it could be commercialised if that direction were chosen. It
does not describe launched distribution, current functionality, pricing, or
company strategy.

### Open-source core

The core product code would be open source so a developer could inspect, fork,
run, and self-host it with their own AI-provider credentials. This would support
transparency, agency, trust, independent inspection, and community contribution;
it is not merely a developer-marketing channel.

The repository does not currently establish that this distribution model has
launched. Licensing, packaging, self-hosting documentation, and release work
would each require separate decisions and implementation.

### Freely available conversational method

The underlying conversational approach would also be available as a prompt that
someone could paste into a general AI assistant. That prompt could approximate
the reflective method, but it would not reproduce the evolving inspectable Idea
Map, structured state, continuity, product-specific evaluations and safeguards,
or the integrated articulation workflow.

> The prompt is not the product.

### Hosted service

A hosted ThoughtForm service would need to earn its value through interaction
quality, UX, idea modelling, privacy, safety, reliability, continuity, and the
refinement of the complete reflective process rather than lock-in.

> Compete on craft, not lock-in.

Leaving should be easy. The product should succeed because people still choose
to return, not because their work or workflow is difficult to take elsewhere.

### Pricing concept

If commercialised, the hosted service would likely use non-expiring usage credit
rather than a subscription. Reflective use may be intense for a period and then
unnecessary for months; subscription incentives could encourage manufactured
recurrence in a wellbeing-adjacent context. Usage credit would better match real
utility while covering model use, infrastructure, security, privacy, support,
and sustainable development with a reasonable margin.

The intended objective would be sustainable growth rather than maximum
extraction or venture-scale engagement. This is a pricing hypothesis, not an
implemented billing contract.

## Privacy and access

- Work begins private.
- The owner may retain private work durably.
- Demo work remains temporary, isolated, clearable, and subject to its documented
  lifecycle.
- Temporary demo content must not appear in telemetry, operational analytics,
  or admin views. The owner may explicitly configure private evaluation tracing
  for their own durable workspace and synthetic evaluation scenarios; this is a
  development/evaluation boundary, not a policy for future users.
- Relevant content may be sent to the configured model provider under the
  documented provider boundary.
- Publication and public website content are separate host concerns.

## Explicitly retired or deferred directions

The following are not active ThoughtForm capabilities:

- Draft Format, intended form, document type, templates, or format-derived
  readiness;
- preference learning, inferred writing profiles, or durable cross-work style
  guidance;
- product-owned Markdown or JSON export;
- product publishing, public-writing preparation, or CMS behaviour;
- rich-text editing, media management, or document layout;
- external product research or commercial validation requirements.

Potentially useful principles from the retired preference proposals may inform a
future separately justified behaviour: guidance should be explicit, inspectable,
correctable, narrowly scoped, and subordinate to the user's current instruction.
This is not approval for a preference capability or retained user profile.

## V1 direction

Product v1 should provide:

- the corrected conversational-thinking presentation and opening;
- focused multi-turn discovery;
- an inspectable, correctable idea map;
- first-person Draft composition from selected established material as the
  intended culmination, without making it a forced gate;
- direct editing, revision history, and reviewable assistant proposals;
- coherent authenticated temporary-workspace lifecycle and durable owner work;
- proportionate privacy and sensitive-use boundaries;
- calibrated hosted-use protection;
- autonomous, user-correctable idea merge and split behaviour required by the
  existing idea-map baseline;
- sufficient operational visibility to release the portfolio demo safely.

After product v1 is ready for release, separate host-website work may build local
Markdown ingestion and static public content pages. No product publishing bridge
is required.

## Success criteria

The primary success criterion is personal usefulness in production:

- Adam can begin with something incomplete rather than a writing goal.
- The conversation helps expose meaningful distinctions rather than merely
  paraphrasing.
- The idea map provides an inspectable model rather than disconnected notes.
- Bringing the work together produces an articulation recognisably grounded in
  Adam's own language and current understanding.
- Uncertainty and mixed feeling survive expression.
- Correction changes the canonical artifact without requiring assistant
  permission.
- A user can stop before articulation without being coerced or labelled
  incomplete, while the product still treats articulation as its intended
  culmination and principal value-realisation moment.

Automated tests, browser scenarios, and hosted evaluations establish engineering
and behavioural evidence. Sustained owner use establishes whether the product is
actually valuable.
