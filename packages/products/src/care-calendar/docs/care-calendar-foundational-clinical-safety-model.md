# Care Calendar — Foundational Clinical Safety Model

## Purpose

This document records the current clinical-safety mental model being applied to Care Calendar.

It is an **educational project artefact**, not a formal Clinical Safety Case, Hazard Log, DCB0129 compliance statement, or judgement that Care Calendar is clinically safe.

The purpose is to make the product's safety-relevant assumptions and reasoning explicit enough to guide later design, implementation, testing, and specialist review.

## Product boundary

Care Calendar is a coordination view of health and social-care appointments. Provider systems remain authoritative for appointment state and provider-held information.

Care Calendar:

- displays provider-derived appointment information;
- displays source and freshness information where available;
- allows patients and authorised carers to submit appointment-related information and requests;
- represents request and provider workflow states only where those states are supported by evidence;
- does not provide clinical advice, diagnosis, triage, or treatment recommendations;
- does not independently determine whether provider source data is clinically or factually correct.

## Core safety vocabulary

### Failure

A technical or operational event in which a system does not behave as intended.

Example:

> Care Calendar's frontend continues showing a cached 10:00 appointment after its backend has received a new authoritative 14:00 state.

### Hazardous condition

A condition with the potential to contribute to harm.

Example:

> A patient is presented with obsolete appointment information as though it were current.

### Possible harm

The adverse clinical consequence that may result through the care process.

Example:

> The patient relies on the obsolete time, misses clinically important care, and experiences delayed assessment or treatment.

Missing an appointment may be part of the causal chain rather than the final harm itself.

### Clinical risk

Clinical risk considers both:

- the likelihood that harm will occur;
- the severity of that harm if it occurs.

A technical failure alone is therefore not a complete clinical-risk statement. The causal path from failure to possible harm must be understood.

### Control

A measure used to prevent a hazardous condition, detect it, reduce the chance or severity of resulting harm, or support safe recovery.

### Residual risk

The clinical risk that remains after controls have been applied.

Controls do not imply that all hazards or risk have been eliminated.

## Example safety chain: stale appointment information

### Failure

The provider changes an appointment from 10:00 to 14:00, but Care Calendar fails to update its coordination view.

Possible technical causes include:

- a provider push event is dropped;
- reconciliation fails;
- a transformation or persistence step fails;
- a frontend cache continues displaying an obsolete value.

### Hazardous condition

Care Calendar presents 10:00 as current when the authoritative provider state is 14:00.

### Possible causal sequence

1. The patient relies on the 10:00 value.
2. The provider expects the patient to be available at 14:00.
3. The patient is unavailable.
4. The visit is missed or delayed.

### Possible harm

A clinically important assessment, treatment, or care activity is delayed.

The exact plausible harms, their likelihood, and their severity depend on the appointment and care context and require appropriate clinical-safety judgement.

## Candidate controls for stale information

These are current **design hypotheses**, not assured controls.

### Provider push updates

Purpose:

> reduce the chance that Care Calendar's copy becomes stale when the provider changes authoritative information.

Primary role:

> prevention.

### Periodic reconciliation

Purpose:

> compare Care Calendar's current state with the provider source and detect silent divergence.

Primary roles:

> detection and recovery.

Reconciliation is stronger evidence of data currency than a simple service heartbeat because it checks whether Care Calendar still matches the provider’s current authoritative state.

### Integration monitoring

Possible signals include:

- message acknowledgements;
- processing failures;
- queue lag;
- dead-letter queues;
- sequence numbers or cursors;
- failed reconciliation attempts.

Primary role:

> detection.

A successful `/health` request is not sufficient evidence that the appointment-data pipeline is healthy.

### Freshness thresholds and degraded state

When Care Calendar can no longer confirm information within an accepted freshness threshold, it should avoid presenting that information with normal confidence.

Possible degraded-state behaviour includes:

- retain the last-known provider value;
- state when it was last successfully confirmed;
- explain that the current provider state cannot presently be verified;
- offer a genuine reconciliation attempt where appropriate;
- provide an appropriate independent confirmation route.

Primary role:

> mitigation / containment.

A warning alone does not demonstrate that the clinical risk has been adequately controlled.

## Freshness requirements

Care Calendar should not assume a universal reconciliation interval.

A suitable freshness requirement may depend on factors such as:

- how soon the appointment will occur;
- the nature of the care;
- how frequently appointment details change;
- how users are expected to rely on Care Calendar;
- what alternative communication routes exist;
- the possible consequence of stale information.

Freshness requirements should therefore be derived from risk analysis rather than chosen purely as technical performance targets.

The exact threshold is specialist-dependent and not settled in this project.

## Information-state safety

Care Calendar must keep safety-relevant workflow states distinct.

Examples include:

- submitted;
- delivered / received by provider system;
- reviewed;
- accepted;
- acted upon;
- authoritative source updated.

No state should be presented as implying a later state unless the available evidence supports that interpretation.

Examples:

> Delivery does not establish human review.

> Review does not establish acceptance or action.

> An accepted request does not change authoritative appointment state until the provider source itself changes.

## Semantic integrity

Receiving a provider field does not establish that Care Calendar understands its meaning.

For example:

> `status = processed`

must not be translated into a patient-facing state such as:

> “Reviewed by clinician”

unless the provider's workflow and integration specification establish that semantic relationship.

Where a safety-relevant state cannot be interpreted reliably, Care Calendar should not invent or strengthen its meaning.

## Upstream failures and downstream product responsibility

Care Calendar does not own failures in upstream provider systems or third-party infrastructure.

However, foreseeable upstream failures can create safety-relevant conditions in Care Calendar.

Example:

> A provider outage prevents Care Calendar from confirming current appointment data.

Care Calendar does not own restoring the provider system, but it does own how its product behaves when the outage causes uncertainty in the coordination view.

This may require downstream controls such as:

- detecting loss of freshness;
- entering a degraded state;
- communicating uncertainty;
- supporting safe recovery or independent confirmation.

## Layered and independent controls

Safety controls may exist across several organisations.

Example:

- Care Calendar detects stale data and warns the patient.
- The provider operates a separate downtime workflow that contacts affected patients.

Independent controls can provide resilience if one control fails.

Cross-organisational dependencies should be explicit rather than assumed. A safety argument should not silently rely on another organisation performing a control that has not been agreed, validated, or incorporated into the relevant deployment process.

## Supplier and provider safety responsibilities

### Supplier / Care Calendar

The product-level safety model should define:

- safety-relevant product behaviour;
- conditions under which information can be presented confidently;
- product controls;
- known limitations;
- deployment dependencies;
- evidence required before displaying safety-relevant workflow states.

Care Calendar should not silently prescribe or assume a provider-specific internal workflow.

### Deploying provider

The provider determines how Care Calendar fits into its actual operating environment, including:

- staff workflows;
- triage and escalation;
- local record systems;
- care-delivery processes;
- downtime arrangements;
- training;
- integration architecture;
- local safety controls.

A provider may satisfy a Care Calendar product-level safety requirement through different internal workflows.

Example product-level requirement:

> Care Calendar must not imply that an attending professional has reviewed a patient-submitted update unless reliable evidence of that review is available.

A provider might satisfy that through:

> central triage → escalation → attending-professional review

or another workflow.

Care Calendar only needs reliable evidence for the state it intends to communicate; it does not inherently need visibility into every intermediate workflow state.

## DCB0129 and DCB0160 boundary

At a high level:

- **DCB0129** addresses manufacturer/supplier-side clinical risk management for the Health IT product.
- **DCB0160** addresses clinical risk associated with deploying and using the product in a particular health or care organisation.

These processes are distinct but can interact.

A provider's deployment analysis may identify a local risk that requires:

- a local workflow control;
- a configuration change;
- an integration change;
- additional evidence;
- or a supplier-side product change.

Neither side should assume the other has automatically controlled risks that cross the organisational boundary.

## Competence boundary

This project may:

- identify plausible hazards;
- describe causal chains;
- propose candidate controls;
- implement and technically validate bounded controls.

This project may **not** claim, without appropriate formal assurance, that:

- residual clinical risk is acceptable;
- Care Calendar is clinically safe;
- controls are sufficient for real-world deployment;
- Care Calendar complies with DCB0129;
- a provider deployment complies with DCB0160.

Formal clinical-safety conclusions require a competent Clinical Safety Officer and the appropriate organisational process.

## Current evidence and assurance status

### Source-backed foundational concepts

The supplier/provider clinical-safety distinction and the concepts of hazards, clinical risk, controls, and residual risk have been studied against current NHS clinical-safety material.

Current status:

> **E1 / A0**

This means source-verified learning within an educational simulation. It is not organisational assurance.

### Care Calendar-specific controls and architecture

Examples such as:

- push + reconciliation;
- specific freshness thresholds;
- degraded-state UI;
- monitoring architecture;
- request status model;

remain project design hypotheses until they are implemented and validated.

Current status:

> **E0 / A0**, unless a narrower claim is later demonstrated technically.

## Questions reserved for later specialist review

- What appointment-data freshness thresholds are clinically acceptable for different care contexts?
- Which stale-data hazards are clinically significant enough to require additional controls?
- What residual risk remains after implemented controls?
- Which provider-side workflows are required for patient-submitted information?
- What deployment assumptions must be carried into provider DCB0160 work?
- Are any proposed controls insufficient or likely to create new hazards?
