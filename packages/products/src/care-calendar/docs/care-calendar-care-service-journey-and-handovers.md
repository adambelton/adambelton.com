# Care Calendar — Care/Service Journey and Information Handover Map

## Purpose

This document maps the minimum Care Calendar home-care journey from end to end.

It shows:
- the main actors and systems;
- the authoritative source for appointment state;
- the Care Calendar coordination view;
- patient/carer submissions;
- technical and organisational handovers;
- provenance and freshness boundaries;
- observable versus unobservable workflow states;
- points where uncertainty can arise.

It is a project artefact for the Care Calendar portfolio product. It is not a formal clinical workflow specification for a real provider.

## Minimum journey

> A patient and authorised carer review an upcoming home-care visit, see which organisation owns the next action, inspect the source and freshness of the information, update a communication need, and request correction of inaccurate information.

Release 1 demonstrates this through a single upcoming home-care visit while keeping the calendar model capable of representing other scheduled health and social-care appointment types.

---

# 1. Journey overview

The conceptual journey is:

1. Provider scheduling workflow creates or updates an appointment.
2. Provider authoritative system records the appointment state.
3. Provider exposes appointment information through an integration path.
4. Care Calendar receives or reconciles the appointment state.
5. Care Calendar presents the appointment as a derived coordination view.
6. Patient or authorised carer reviews the appointment.
7. Patient or authorised carer submits appointment-specific information or a change request.
8. Care Calendar records and transmits that submission.
9. Provider system receives the submission.
10. Provider workflow reviews or processes it.
11. Provider authoritative record may change as a result.
12. Care Calendar later receives or reconciles the new source state.
13. Care Calendar preserves source-supported history and provenance.

Not every deployment will expose every step to Care Calendar.

---

# 2. Core information layers

## 2.1 Authoritative appointment state

Managed by:

> Provider authoritative appointment system

Examples:
- date;
- time;
- appointment status;
- provider-side notes;
- preparation instructions;
- source identifiers;
- source update metadata where exposed.

Care Calendar does not become authoritative by storing a local copy.

## 2.2 Derived coordination view

Managed by:

> Care Calendar

Purpose:

> Present provider-held appointment information in a unified patient-and-carer view.

Responsibilities:
- preserve source identity;
- preserve freshness information;
- avoid presenting stale data with normal confidence;
- avoid changing provider state locally.

## 2.3 Patient/carer-submitted information

Managed initially by:

> Care Calendar request/submission workflow

Originator:

> Patient or authorised carer

Examples:
- correction request;
- rescheduling request;
- cancellation request;
- appointment-specific information;
- communication-need update.

The submission remains distinct from the provider source record until the provider explicitly updates its own system.

## 2.4 Workflow state

Examples:
- submitted;
- delivered;
- received by provider system;
- reviewed;
- accepted;
- rejected;
- acted upon;
- provider source updated.

Care Calendar should display only states whose meaning is explicitly supported.

---

# 3. Detailed journey map

## Stage 1 — Appointment creation

### Operational actor

Provider scheduling/admin workflow.

### System

Provider authoritative appointment system.

### Action

Appointment is created.

### Authoritative state

The provider system becomes the source of truth for:
- appointment identity;
- scheduled date/time;
- appointment status.

### Provenance

Where available, provenance may include:
- source organisation;
- source record identifier;
- provider-side creation timestamp;
- provider-side update timestamp.

### Care Calendar visibility

None until the provider exposes the record.

### Key boundary

Care Calendar must not infer appointment creation details that are not exposed by the provider.

---

## Stage 2 — Provider-to-Care-Calendar technical handover

### Technical handover

Provider system or integration service exposes appointment state to Care Calendar.

Possible integration patterns include:
- provider push;
- Care Calendar pull;
- third-party integration;
- periodic reconciliation.

The exact architecture is not yet fixed.

### Care Calendar responsibility

Care Calendar should:
- receive the source data faithfully;
- associate it with the correct source;
- preserve source identifiers where available;
- record when the state was received or reconciled;
- avoid inventing source-side timestamps.

### Provenance distinction

These timestamps are different:

> Provider last updated the source record.

and:

> Care Calendar last confirmed its copy against the provider source.

One must not be substituted for the other.

---

## Stage 3 — Care Calendar presents the appointment

### System

Care Calendar coordination view.

### Patient-facing state

Example:

> Home-care visit  
> 14 August, 10:00  
> Source: Provider A  
> Last confirmed: 08:03

### Responsibility

Care Calendar owns:
- representation;
- provenance display;
- freshness communication;
- uncertainty communication.

### Key boundary

Care Calendar is displaying provider-derived state, not asserting an independent appointment state.

---

## Stage 4 — Patient/carer reviews the appointment

### Actors

- patient;
- authorised carer.

### Information reviewed

Potentially:
- date/time;
- purpose;
- preparation instructions;
- provider notes relevant to the appointment;
- source;
- freshness;
- pending requests.

### User action

The patient/carer may decide:
- no action is needed;
- information appears inaccurate;
- a change is needed;
- additional appointment-specific information should be submitted.

### Key boundary

User interpretation does not change provider state.

---

## Stage 5 — Patient/carer submits information or a request

### Originator

Patient or authorised carer.

### Managing system

Care Calendar.

### Example

> "I cannot currently use my left arm."

or:

> "Please move this appointment to the afternoon."

### Provenance

Care Calendar can preserve:
- author identity;
- submission time;
- related appointment;
- request type;
- request content.

### Key boundary

The request is related to the appointment, but it does not change the authoritative appointment state.

---

## Stage 6 — Care Calendar transmits the submission

### Technical handover

Care Calendar sends the request through the agreed integration path.

### Possible states

Depending on the integration, Care Calendar may know:
- queued;
- sent;
- delivered;
- provider system received.

### Responsibility

Care Calendar owns:
- truthful representation of the state it can evidence;
- retry/recovery behaviour assigned to its integration role;
- not presenting "sent" as "reviewed."

### Key boundary

Technical delivery is not human review.

---

## Stage 7 — Provider system receives the submission

### System

Provider-side receiving system.

### Observable state

Only what the provider exposes.

Examples:
- received;
- processed;
- accepted.

### Semantic requirement

Care Calendar must know what each exposed state means before presenting it to the patient.

Example:

> `processed`

must not be translated into:

> "reviewed by clinician"

unless the provider explicitly defines that meaning.

---

## Stage 8 — Provider organisational workflow

### Possible actors

Depending on the provider:
- scheduling/admin team;
- triage team;
- attending professional;
- another operational workflow.

### Organisational handover

The provider system may route the information to an actor responsible for the next step.

### Observable versus unobservable state

Care Calendar may:
- receive explicit workflow states;
- receive only a final provider state;
- receive no workflow visibility at all.

### Key boundary

A service handover can matter to the provider even when it is unobservable to Care Calendar.

Care Calendar should not invent UI states for unobservable handovers.

---

## Stage 9 — Provider action

### Action ownership

Provider workflow.

Possible outcomes:
- request accepted;
- request rejected;
- more information requested;
- appointment changed;
- provider note added;
- no provider source change.

### Authoritative state

Only provider-side source updates change the authoritative appointment record.

### Key boundary

Care Calendar must not derive provider action from patient intent.

Example:

> Patient requests 14:00.

does not allow Care Calendar to display 14:00 until the provider source changes.

---

## Stage 10 — Provider source changes

### Example

Appointment:

> 10:00 → 14:00

or provider note added:

> "Patient reports limited use of left arm."

### Provenance

Care Calendar may know:
- that the new source state exists;
- when Care Calendar received or reconciled it.

Care Calendar may not know:
- exactly when the provider authored the change;
- who authored it;
- whether it was caused by the earlier patient request.

Those relationships must only be shown if the source explicitly establishes them.

---

## Stage 11 — Reconciliation back into Care Calendar

### Purpose

Compare Care Calendar's derived state with the provider's current authoritative state.

### Outcomes

If aligned:

> Care Calendar can maintain normal confidence in currency.

If not aligned:

> Care Calendar detects divergence and may need recovery or degraded-state behaviour.

### Key distinction

Reconciliation verifies:

> whether Care Calendar still matches the provider's current authoritative state.

It does not independently establish whether the provider's source data is factually or clinically correct.

---

# 4. Handovers

## 4.1 Technical handovers

Examples:
- provider system → integration service;
- integration service → Care Calendar;
- Care Calendar → provider integration;
- reconciliation request → provider source.

A successful technical handover proves only the state that the technical mechanism actually confirms.

It does not prove human awareness or action.

## 4.2 Organisational handovers

Examples:
- scheduling team → attending professional;
- triage team → attending professional;
- one provider organisation → another provider organisation.

These may not be visible to Care Calendar.

## 4.3 Mixed handovers

Some transitions involve both systems and actors.

Example:

> Patient submits update → provider system receives it → triage workflow routes it to attending professional.

The technical delivery can succeed while the organisational handover fails.

---

# 5. Observable and unobservable handovers

## Observable handover

Care Calendar has explicit evidence that the transition occurred.

Example:

> Provider API confirms attending-professional review.

Care Calendar may display that state if the semantics are reliable.

## Unobservable handover

The transition may exist in the real service but is not exposed to Care Calendar.

Example:

> Provider B's scheduling team has or has not updated a clinician work list, but no state is exposed.

Care Calendar should not invent:
- "waiting for clinician";
- "delivery confirmed";
- "delivery degraded";

unless the provider exposes enough evidence to justify those states.

A service map can still record the handover as an operational dependency even when the product cannot observe it.

---

# 6. Multi-provider journey

A single appointment may span more than one provider organisation.

Example conceptual model:

- Provider A owns the authoritative appointment schedule.
- Provider B owns care delivery.

These are distinct responsibilities.

## Appointment state

The authoritative scheduled details.

Example:

> 14:00, confirmed by Provider A.

## Care-delivery state

Whether the organisation responsible for carrying out the appointment is aligned and ready to deliver it.

This state should only be shown if Care Calendar has evidence for it.

## Service-journey state

The wider end-to-end coordination state across scheduling, handovers, and delivery.

Again, Care Calendar should only expose this state where the underlying evidence supports it.

## Pending versus degraded

These states must not be collapsed.

### Awaiting confirmation

A downstream handover has not yet completed, but this may be normal workflow progression.

### Degraded / out of sync

A previously expected alignment has broken, or an expected handover has failed to occur within the relevant window.

The difference depends on:
- prior state;
- expected workflow;
- evidence available to Care Calendar.

---

# 7. Provenance rules

Care Calendar should preserve the following rules.

## Rule 1 — Source and observation time are different

> "Provider updated at 08:00"

is different from:

> "Care Calendar first observed the new state at 08:10."

If the source-update time is not exposed, Care Calendar must not infer it.

## Rule 2 — Chronology does not establish causation

If:
- patient submits a request;
- provider later changes the appointment;

Care Calendar may show both events.

It must not say:

> "Appointment changed because of your request"

unless the provider explicitly links them.

## Rule 3 — Replacement relationships must be source-supported

If appointment A is cancelled and appointment B appears, Care Calendar must not infer B replaced A unless the provider exposes that relationship.

## Rule 4 — Information shown together may have independent freshness

Appointment state, request state, provider note state, and care-delivery state may be reconciled through different mechanisms.

They must not automatically share one freshness timestamp.

## Rule 5 — Meaning must survive the handover

A field such as:

> `processed`

is not safe to expose as a meaningful patient-facing state until its semantics are defined.

---

# 8. Broken-handover scenarios

## Scenario A — Provider source not updated

Provider verbally intends to change an appointment but the authoritative source still says 10:00.

Care Calendar:

> continues showing 10:00.

Care Calendar should not create a competing state.

## Scenario B — Provider source changes but Care Calendar misses it

Provider source:

> 14:00

Care Calendar:

> still 10:00

This is a divergence in Care Calendar's coordination view.

Candidate controls:
- reconciliation;
- monitoring;
- degraded-state handling.

## Scenario C — Request reaches provider system but not responsible actor

Technical handover:

> succeeded.

Organisational handover:

> failed or remains unconfirmed.

Care Calendar can only expose the organisational state if evidence is available.

## Scenario D — Source creates two records without lineage

Appointment A cancelled.

Appointment B created.

No replacement link.

Care Calendar:

> preserves both events without asserting that B replaced A.

## Scenario E — Complete data trail, incomplete service handover

Care Calendar and provider systems may show a complete sequence of data events while a provider-side operational handover has not occurred.

If Care Calendar cannot observe that handover, it should not manufacture a care-delivery state.

The provider may still need to manage the unobservable workflow risk in its own deployment process.

---

# 9. Minimum journey artefact view

For the Release 1 home-care visit, the Care Calendar appointment view should be able to distinguish:

## Provider-derived information

- appointment date/time;
- appointment status;
- purpose;
- preparation instructions;
- provider-side notes;
- source organisation;
- source identifiers where appropriate.

## Care Calendar provenance/freshness

- last successful confirmation/reconciliation;
- degraded-state indication where applicable.

## Patient/carer-submitted information

- author;
- submission time;
- related appointment;
- request/update content.

## Workflow state

Only source-supported states such as:
- sent;
- received by provider system;
- reviewed;
- accepted;
- rejected;
- source updated.

## History

Source-supported events should be preserved without inventing:
- unsupported timestamps;
- causal relationships;
- replacement links;
- internal workflow handovers.

---

# 10. Current assumptions and unresolved questions

## Architecture assumptions

Still unresolved:
- direct integration versus third-party integration;
- push versus pull behaviour;
- reconciliation mechanism;
- retry and recovery ownership.

## Provider workflow assumptions

Still unresolved:
- which actors review each request type;
- which workflow states providers expose;
- whether attending-professional review is observable;
- how multiple provider organisations coordinate one appointment.

## Provenance assumptions

Still unresolved:
- which source timestamps are available;
- whether provider systems expose record lineage;
- whether request-to-source-update relationships can be represented explicitly.

## Product assumptions

Current project decisions:
- Care Calendar remains a coordination view;
- provider records remain authoritative;
- user submissions remain distinct until provider source changes;
- uncertainty is shown only where Care Calendar has evidence for it;
- unobservable provider workflow states are not invented.

---

# 11. Evidence and assurance status

The journey model is currently:

> **E0 / A0**

It is a bounded project model informed by source-verified learning.

Specific principles around source records, service design, provenance, and clinical-safety boundaries have reached **E1 / A0** in the learning record, but this fictional end-to-end workflow has not been validated with a real provider organisation.

The journey should therefore be treated as:
- a design and learning artefact;
- a basis for implementation;
- a set of explicit assumptions to test later;

not as a claim that this is how a real provider service operates.
