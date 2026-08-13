# Care Calendar — Stakeholder and Responsibility Map

## Purpose

This document maps the people, organisations, systems, dependencies, and assurance roles involved in the minimum Care Calendar home-care journey.

Its purpose is to make responsibility boundaries explicit so that Care Calendar does not:
- treat a provider organisation as one undifferentiated actor;
- confuse technical delivery with human review;
- assume responsibility for provider-side care delivery;
- infer workflow states that are not exposed;
- or hide important dependencies between organisations and systems.

This is a **project artefact**, not a formal organisational responsibility assignment for a real deployment.

## Minimum journey

The minimum Release 1 journey is:

> A patient and authorised carer review an upcoming home-care visit, inspect its source and freshness, see who owns the next action, submit appointment-related information or a change request, and see the resulting workflow state without Care Calendar becoming the source of truth.

---

## Responsibility model

Care Calendar should distinguish four kinds of responsibility:

### 1. Information origin

Who or what created the information?

Examples:
- a scheduling actor creates an appointment;
- a patient authors a rescheduling request;
- a clinician authors a provider-side note.

### 2. System-of-record responsibility

Which system manages the authoritative state?

Examples:
- provider scheduling system for the appointment;
- Care Calendar for the patient-submitted request record until provider-side processing occurs.

### 3. Action or workflow responsibility

Who is responsible for taking the next operational step?

Examples:
- scheduling team processes a rescheduling request;
- attending professional delivers the visit;
- provider workflow determines whether patient-submitted information reaches the relevant professional.

### 4. Representation responsibility

Who is responsible for how information and uncertainty are presented to the patient or carer?

For the Care Calendar interface, this responsibility belongs to Care Calendar.

---

# Stakeholders and systems

## Patient

### Role in the journey

The patient is the primary person receiving care and a direct user of Care Calendar.

### Information they may originate

- appointment-related update requests;
- correction requests;
- rescheduling or cancellation requests;
- appointment-specific information relevant to the visit.

### Actions they may own

- reviewing appointment information;
- submitting a request or update;
- authorising a carer within the Release 1 scope;
- deciding whether to contact the provider through an alternative channel when Care Calendar indicates uncertainty.

### What Care Calendar can observe

Care Calendar can observe actions performed through the product, including:
- who submitted information;
- when it was submitted;
- which appointment it relates to.

### What Care Calendar must not infer

Care Calendar must not infer:
- clinical significance of the patient's information;
- that a provider has reviewed the information unless evidence supports that state;
- that a request has caused a later provider-side change without explicit linkage.

### Current status

Project-defined user role: **E0 / A0**

---

## Authorised carer

### Role in the journey

The carer is a separate authenticated user who has been explicitly authorised by the patient within the minimum Release 1 scope.

### Information they may originate

The carer may submit appointment-related information or requests where their granted access permits it.

### Actions they may own

- reviewing appointment information;
- submitting requests or updates;
- supporting the patient in coordinating care.

### What Care Calendar can observe

Care Calendar can preserve:
- the carer's identity;
- the fact that the carer authored a particular action;
- the permissions granted within the product.

### What Care Calendar must not infer

Care Calendar must not infer:
- authority beyond the permissions explicitly established;
- broader legal authority from the fact that someone is an unpaid carer;
- authority for patients who cannot authorise access themselves.

### Scope boundary

Patients unable to authorise their own carer are outside the minimum Release 1 path.

### Current status

Project-defined user role and scope boundary: **E0 / A0**

---

## Care Calendar

### Role in the journey

Care Calendar is the patient-and-carer coordination product.

It presents a derived view of provider-held appointment information and manages patient/carer requests submitted through the product.

### Information Care Calendar manages

- local representations of provider appointment data;
- source and freshness metadata where available;
- patient/carer request records;
- request lifecycle information exposed by integrations;
- provenance and history that can be established from source evidence.

### Actions Care Calendar owns

- displaying provider-derived information faithfully;
- preserving distinctions between source information and user-submitted information;
- transmitting requests through the agreed integration path;
- representing request states accurately;
- detecting and communicating degraded confidence where Care Calendar cannot confirm current provider state;
- preserving uncertainty where provenance or workflow meaning is unavailable.

### What Care Calendar does not own

Care Calendar does not own:
- the authoritative provider appointment state;
- provider-side clinical or scheduling decisions;
- delivery of care;
- provider staff workflows;
- factual validation of provider source data;
- clinician review unless that review is explicitly evidenced;
- formal deployment assurance.

### What Care Calendar must not infer

Care Calendar must not infer:
- that a provider request was reviewed because it was technically delivered;
- that a provider-side change was caused by a patient request unless explicitly linked;
- internal provider workflow states that are not exposed;
- causal relationships from chronology alone.

### Current status

Core product responsibility model: **E0 / A0**, informed by source-verified clinical-safety and service-design principles.

---

## Provider scheduling or administrative actor/workflow

### Role in the journey

This represents the provider-side operational function responsible for creating or changing appointment records and processing administrative appointment requests.

It may be a person, team, or workflow rather than a single named role.

### Information it may originate

- appointment creation;
- date/time changes;
- cancellation status;
- administrative appointment notes;
- scheduling outcomes.

### Actions it may own

Potentially:
- reviewing rescheduling or cancellation requests;
- changing the provider's authoritative appointment record;
- routing information to another provider-side workflow.

### What Care Calendar can observe

Only the workflow states and resulting source changes exposed through the provider integration.

### What Care Calendar must not infer

Care Calendar must not infer:
- that a scheduling review is equivalent to clinician review;
- that the scheduling actor has clinical responsibility;
- that an internal handover occurred unless the provider exposes evidence.

### Current status

Provider-side role is required conceptually, but its exact implementation is a deployment assumption: **E0 / A0**

---

## Attending professional / care-delivery actor

### Role in the journey

The attending professional is the person responsible for carrying out the home-care visit or other appointment activity.

### Information they may originate

Depending on provider workflow:
- provider-side appointment notes;
- observations;
- care-delivery documentation.

These remain provider-held records.

### Actions they own

- delivering the appointment;
- interpreting clinically relevant information within their professional role;
- making clinical or care decisions that are outside Care Calendar's authority.

### What Care Calendar can observe

Only states the provider explicitly exposes.

For example, Care Calendar may be able to observe:
- attending-professional review confirmed;
- provider-side note created.

It may also have no visibility into these events.

### What Care Calendar must not infer

Care Calendar must not infer:
- that the attending professional has reviewed information because another provider actor has;
- that delivered or processed information has been clinically considered;
- that the professional will adapt care in a particular way.

### Current status

Provider-side role concept: **E0 / A0**

---

## Provider organisation

### Role in the journey

The provider organisation owns the local service, workflows, staff responsibilities, source systems, and deployment environment.

### Responsibilities

The provider is responsible for:
- maintaining appropriate authoritative records;
- defining local workflows;
- determining which actors review which kinds of information;
- delivering care;
- operating local downtime and escalation processes;
- determining how Care Calendar fits into its deployment environment.

### What Care Calendar can observe

Only provider states and data that are exposed through the integration.

### What Care Calendar must not infer

Care Calendar must not treat "the provider" as if all provider actors share the same responsibilities or awareness.

### Current status

General provider responsibility model: source-informed **E1 / A0** at the foundational level; Care Calendar-specific workflow details remain **E0 / A0**.

---

## Provider authoritative appointment system

### Role in the journey

This is the system of record for the appointment state.

### Information it manages

Potentially:
- appointment identifier;
- date and time;
- appointment status;
- provider-side notes;
- preparation instructions;
- source update timestamps;
- relationships between replacement or rescheduled records.

The exact fields depend on the provider system.

### Responsibility

The provider system determines the authoritative appointment state exposed to Care Calendar.

### What Care Calendar can observe

Only the data and metadata the provider exposes.

### What Care Calendar must not infer

Care Calendar must not infer:
- source update timestamps that are not exposed;
- replacement relationships not explicitly linked;
- factual errors in the provider record merely because a patient disputes them.

### Current status

Core architectural assumption for the project: **E0 / A0**

---

## Third-party integration service

### Role in the journey

A third-party integration service may sit between Care Calendar and the provider's systems.

This is optional in the conceptual architecture; Care Calendar may also integrate directly with a provider.

### Possible responsibilities

Depending on the agreed architecture:
- transporting provider updates;
- transporting patient/carer requests;
- exposing current source data;
- supporting reconciliation;
- acknowledgements or retry;
- failure reporting.

### Technical fault ownership

If a failure occurs inside the third-party service, the integration provider may own the immediate technical defect.

### Care Calendar responsibility despite dependency

Care Calendar still owns:
- the patient-facing representation of the workflow;
- not claiming successful downstream delivery without evidence;
- handling foreseeable integration failure safely;
- preserving uncertainty where delivery or freshness cannot be established.

### What Care Calendar must not infer

The exact integration role, retry model, push/pull behaviour, or SLA must not be invented before the architecture is defined.

### Current status

Optional dependency / architecture assumption: **E0 / A0**

---

## Supplier Clinical Safety Officer

### Role in the journey

The supplier-side Clinical Safety Officer oversees or supports the formal clinical risk-management process for the product under the applicable manufacturer-side clinical-safety framework.

### Responsibility

The CSO is concerned with questions such as:
- whether product hazards have been identified;
- whether clinical risks have been assessed appropriately;
- whether controls and residual risks are adequately considered;
- whether safety-relevant product assumptions are explicit.

### What the CSO does not own

The CSO does not:
- operate the scheduling workflow;
- deliver care;
- fix individual engineering defects;
- replace clinician or practitioner workflow expertise.

### Current project boundary

Care Calendar currently has no formal supplier CSO assurance.

### Current status

Formal assurance unavailable in this educational project: **AX**, unless specialist review is later obtained for a narrower conclusion.

---

## Provider Clinical Safety Officer

### Role in the journey

The provider-side Clinical Safety Officer is concerned with risks arising from the actual local deployment and use of the technology.

### Responsibility

Potential areas include:
- provider workflow;
- local integrations;
- training;
- operational controls;
- deployment assumptions;
- whether Care Calendar's product-level safety assumptions are satisfied in the provider environment.

### Relationship to supplier-side safety work

Supplier and provider safety work are separate but may need to interact where:
- product assumptions depend on provider workflow;
- provider deployment reveals a product limitation;
- a risk requires complementary controls across organisations.

### Current project boundary

No real provider deployment exists in this educational project.

### Current status

Formal deployment assurance unavailable: **AX**

---

## Regulatory and assurance actors

### CQC

CQC is relevant to regulated care-provider expectations, including appropriate records and governance.

CQC does not own the appointment workflow or operate Care Calendar.

### Other assurance actors

Later project stages may introduce roles such as:
- information-governance specialist;
- Data Protection Officer;
- security assessor;
- accessibility specialist;
- regulatory professional.

These are not operational actors in the appointment journey.

---

# Responsibility summary

## Care Calendar owns

- truthful representation of provider-derived data;
- provenance and freshness information it can evidence;
- patient/carer request capture and representation;
- safe communication of uncertainty;
- product-level controls for foreseeable failures affecting its coordination view.

## Provider owns

- authoritative appointment records;
- provider-side workflow;
- administrative and clinical decisions;
- delivery of care;
- local deployment processes.

## Integration dependency may own

- immediate technical defects inside the integration component;
- transport or reconciliation behaviour assigned by the integration contract.

## Assurance actors own

- review and assurance activities within their competence and organisational remit.

They do not become operational owners of the care workflow simply because they assess its risk.

---

# Key boundary rules

1. **Do not collapse "provider" into one actor.**
2. **Do not confuse information origin with system-of-record responsibility.**
3. **Do not confuse technical receipt with human review.**
4. **Do not infer internal provider workflow states without evidence.**
5. **Do not infer causation from chronology.**
6. **Do not assign Care Calendar responsibility for provider care delivery.**
7. **Do make Care Calendar responsible for how foreseeable upstream failures affect the state it presents.**
8. **Do keep cross-organisational safety dependencies explicit.**

---

# Current unresolved assumptions

The following remain project assumptions or deployment questions:

- whether integrations are direct or use a third-party intermediary;
- which provider workflow processes each request type;
- which workflow states providers can expose;
- whether attending-professional review is visible;
- how provider systems link rescheduled or replacement appointment records;
- whether multiple provider organisations participate in one appointment journey;
- how care-delivery confirmation would be represented if exposed;
- what retry, reconciliation, and failure-recovery responsibilities belong to each integration party.

These should remain **E0 / A0** until explicitly defined, implemented, source-verified, or reviewed.
