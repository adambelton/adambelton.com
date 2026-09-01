# Care Calendar Learning Outcomes

This document is a revision record for the Care Calendar healthcare and social-care learning plan.

Each learning outcome is recorded with:
- the outcome itself;
- a brief explanation of what it means;
- detailed validation evidence showing how the outcome was demonstrated in the context of Care Calendar.

It deliberately does **not** reproduce the full teaching material.

## Sections

1. **Product purpose and information boundaries** — what Care Calendar is for, what it must not become, and where its authority stops.
2. **Clinical safety: foundational mental model** — how system behaviour can contribute to harm, how risk is controlled, and how supplier and provider safety responsibilities differ.
3. **Request states, acknowledgement and human review** — how patient/carer submissions progress through technical and human workflow states without those states being collapsed or overstated.
4. **Stakeholders and organisational responsibility** — who performs, transports, assures, and acts on information across the service, and how responsibility is assigned at organisational boundaries.
5. **Care/service journey, handovers and information provenance** — how information moves through the end-to-end service, how source and derived states relate, and which handovers Care Calendar can or cannot observe.
6. **Bounded edge cases: capacity, safeguarding, medicines and outages** — how established principles apply at important healthcare boundaries without expanding Care Calendar into a capacity-assessment, safeguarding, medicines-management, or infrastructure-ownership system.
7. **User-centred discovery** — how to validate and enrich the problem context that Care Calendar's product reasoning depends on without confusing user preference with assurance evidence.
8. **Evidence-control operating model** — how to distinguish claim/evidence strength from assurance/scrutiny, validate narrow claims proportionately, and avoid overclaiming through descriptive-first evidence discipline.

## How the sections fit together

The foundational module builds progressively from the product boundary into the wider health and care service, then into the evidence needed to justify what we believe about the product.

**Product purpose and information boundaries** establishes what Care Calendar is, what it is not, and where its authority stops. **Clinical safety: foundational mental model** then examines how failures or misleading behaviour within that bounded product can contribute to harm, including risk, controls, freshness, reconciliation, and supplier/provider safety responsibility. **Request states, acknowledgement and human review** applies those foundations to one of the product's most safety-sensitive workflows: patient/carer information moving toward a provider without the interface overstating what has been received, reviewed, accepted, or acted upon.

**Stakeholders and organisational responsibility** widens the lens beyond the application to the people, teams, organisations, systems and assurance roles that participate in the service. **Care/service journey, handovers and information provenance** then traces information through those boundaries and establishes how Care Calendar should preserve source, freshness, lineage, semantic meaning and uncertainty while distinguishing observable from unobservable service handovers.

**Bounded edge cases** tests whether those principles still hold in healthcare-specific contexts. Capacity introduces a genuinely new decision-specific authority boundary; safeguarding introduces provider-defined routing and visibility consequences without making Care Calendar the safeguarding decision-maker; medicines and outages primarily test transfer of established semantic-integrity and freshness principles. **User-centred discovery** then adds a different evidence dimension: standards and assurance material can constrain a trustworthy product, but they cannot establish whether the underlying coordination problem is real, important, or correctly understood by the product team.

The final foundational section, **Evidence-control operating model**, applies the same epistemic discipline to Care Calendar's own claims. It distinguishes **evidence maturity**—how strongly a claim is supported—from **assurance status**—the independence, competence and formality of the judgement applied to that support. It also establishes a descriptive-first claim discipline so broader interpretive or evaluative conclusions are only made when the underlying evidence genuinely supports them.

---

## 1. Product purpose and information boundaries

**Goal for this section:** understand and be able to explain Care Calendar's intended purpose, the limits of its authority, and the information boundaries that keep it a patient-and-carer coordination view rather than a competing source record, clinical decision-maker, emergency service, or wider longitudinal health record.


### 1.1 Explain why Care Calendar must remain a coordination view that faithfully represents provider-held appointment information without becoming a competing authoritative record

**Description**  
Care Calendar presents information obtained from provider systems, but it does not become the source of truth for appointments or provider-held records. The provider's own system remains authoritative.

**Validation evidence — Care Calendar**  
You challenged a scenario that implied Care Calendar might need to determine whether a provider's recorded appointment time was itself correct. You pointed out that if the provider's authoritative system says the appointment is at 10:00, then 10:00 is the value Care Calendar is entitled to present. You recognised that maintaining a competing appointment time would itself be risky because it would create a second source of truth.

You distinguished this from cases where the provider source changes but Care Calendar fails to reflect that change. In that case, the error is no longer merely upstream: Care Calendar has diverged from the authoritative source and may be presenting stale information as current.

### 1.2 Explain the boundary between representing provider-held information and exercising authority to change that information

**Description**  
Showing data from a provider system does not imply authority to modify that system. Patient and carer actions in Care Calendar should therefore be represented as requests unless an authoritative source later confirms a change.

**Validation evidence — Care Calendar**  
When considering whether a patient or carer should directly edit a communication need, you rejected direct editing because it would assume that Care Calendar has write access to the provider system and the authority to change provider-held information. You proposed a request model instead.

You consistently applied the same boundary to rescheduling, cancellation, notes and other appointment information: Care Calendar can submit a request and expose its status, but it cannot present the requested change as authoritative until the provider system itself reflects it.

### 1.3 Explain why patient/carer request state must remain distinct from authoritative provider appointment state until the source record itself changes

**Description**  
A request may be submitted, reviewed or accepted without the authoritative appointment record having changed. Care Calendar must represent those states independently.

**Validation evidence — Care Calendar**  
In the rescheduling scenario, the provider marked the patient's request as accepted while the authoritative appointment record still said 10:00. You correctly said the app should continue showing 10:00 while separately showing that the rescheduling request had been accepted.

You explained that Care Calendar has no say over the appointment time itself. Its role is to display provider data, submit requests and show the request lifecycle. Only a subsequent source-record update from the provider authorises the app to display a different appointment time.

### 1.4 Explain why appointment history and replacement relationships must be grounded in explicit source-provided provenance rather than inferred by Care Calendar

**Description**  
Care Calendar should preserve appointment history only where the source system provides enough information to establish continuity. It should not infer that one appointment replaces another merely because the records look similar.

**Validation evidence — Care Calendar**  
You identified a provenance problem with cancelling appointment A and creating appointment B. Without an explicit relationship in the provider system, Care Calendar would know only that one appointment disappeared and another appeared; it could not safely infer that B replaced A.

You therefore suggested that rescheduling the existing appointment record may preserve continuity more naturally. You also recognised that cancel-and-recreate can still preserve provenance if the provider explicitly links the records, for example by marking B as a replacement for A. The important requirement is explicit source-provided lineage rather than Care Calendar guessing from similarity.

### 1.5 Explain why Care Calendar should include only information explicitly relevant to an appointment and should not drift into becoming a wider longitudinal health record

**Description**  
Care Calendar should contain only information explicitly relevant to an appointment. It is not intended to aggregate diagnoses, medication lists, test results or other general medical-record content.

**Validation evidence — Care Calendar**  
When asked whether Release 1 should include medication lists, diagnoses or test results, you identified those as belonging to a wider health record rather than an appointment-coordination product. You said that only information explicitly relevant to an appointment should be included.

You also recognised that aggregating a patient's wider medical record would introduce questions about multiple provider records, synchronisation and authoritative sources that are well beyond the minimum learning-plan scope.

### 1.6 Explain why Care Calendar may surface and transmit clinically relevant information without interpreting it, making clinical judgements, or recommending changes to care

**Description**  
Care Calendar can surface and transmit information, but it should not interpret clinical significance, diagnose, triage, or recommend changes to care.

**Validation evidence — Care Calendar**  
When considering whether the app should interpret patient-submitted information and recommend changing, delaying or cancelling an appointment, you rejected the idea because it requires clinical judgement and would fundamentally extend the product's intended purpose.

You maintained the distinction between surfacing potentially relevant information and deciding what it means clinically. For example, the app may show that a patient has submitted an update saying they cannot use their left arm, but it should not tell a clinician how to modify the visit or tell the patient that the visit should be cancelled.

### 1.7 Explain why Care Calendar may signpost emergency or urgent-care contact routes without becoming an emergency communication, triage, or response service

**Description**  
Care Calendar may signpost urgent or emergency contact information, but it is not itself an emergency communication or response system.

**Validation evidence — Care Calendar**  
You decided that the app should provide emergency contact information but should not facilitate emergency contact itself. This keeps the appointment-specific communication channel from being mistaken for an urgent route to care and preserves the product's non-triage purpose.

### 1.8 Explain why the minimum project is limited to patients who can authorise their own carers, and why representative access for people lacking capacity requires a separate authority model

**Description**  
The minimum project covers patients who can authorise their own carer. Access on behalf of someone who cannot provide that authorisation introduces additional legal, authority and access-control questions.

**Validation evidence — Care Calendar**  
You limited the project to patients with capacity to authorise their own carer. You recognised that a carer acting for someone who cannot consent may have different responsibilities and possibly different access needs, but also that this cannot simply be inferred from the fact that they are a carer.

You identified possible future roles such as a legal guardian or other representative, but deliberately placed those cases outside the minimum path rather than expanding the scope before the relevant legal and information-governance questions are understood.

---

## 2. Clinical safety: foundational mental model

**Goal for this section:** understand and be able to explain how failures, stale or misleading information, and unsafe assumptions in Care Calendar could contribute to patient harm; how hazards, risk, controls, freshness, reconciliation, and degraded states relate; and how DCB0129 and DCB0160 divide but connect supplier-side and deployment-side clinical-safety responsibility.


### 2.1 Explain how a software defect or misleading system behaviour can become a clinical-safety issue when it contributes to a plausible chain of patient harm

**Description**  
A defect becomes clinically relevant when the software can contribute to a chain of events that results in patient harm. The software does not need to make a clinical decision itself.

**Validation evidence — Care Calendar**  
Given a scenario where Care Calendar showed an incorrect appointment time and the patient missed the visit, you explained why this could be more than a software defect or poor user experience. You identified several plausible routes to harm: a missed cancer-screening appointment could delay diagnosis, a missed medication review could delay an important medication change, and even a routine appointment could uncover something serious.

Your reasoning connected the software failure to the care process: misleading information can cause the patient to miss care, and missing care can plausibly contribute to harm. You also understood that not every missed appointment automatically causes harm; the clinical consequence depends on context.

### 2.2 Distinguish errors originating in an authoritative provider source from errors or divergence introduced by Care Calendar or its integrations

**Description**  
Care Calendar is not responsible for independently validating the factual correctness of authoritative provider records. It is responsible for faithfully representing the data it receives and for risks introduced by its own product or integration.

**Validation evidence — Care Calendar**  
You objected to a scenario that treated the provider's authoritative 10:00 appointment time as something Care Calendar might need to second-guess. You reasoned that if the provider's system says 10:00, then that is the appointment time Care Calendar should display; maintaining a separate version would create an unsafe competing record.

You then correctly distinguished that from a supplier-side failure: if the provider changes the appointment to 14:00 but our integration continues showing 10:00, Care Calendar has introduced or failed to control the divergence. The key boundary is whether the incorrect state originates in the provider source or in the product/integration that represents it.

### 2.3 Explain why appointment data can become clinically risky when it is stale, even if Care Calendar originally copied the provider source correctly

**Description**  
Information can be faithfully copied yet still become unsafe if it remains stale and users are led to rely on it as current.

**Validation evidence — Care Calendar**  
You explained that when the provider changes an appointment but our app fails to receive or reflect that change, the responsibility shifts to us because patients expect the coordination view to be current. You explicitly connected the issue to freshness, failure handling and provenance.

You also said the patient should be able to see not only the current appointment time but the history of the change, reinforcing that safe display depends on both currency and traceability.

### 2.4 Explain why making stale-data uncertainty visible is an important safety control but does not, by itself, demonstrate that the associated clinical risk is adequately controlled

**Description**  
Showing that information may be stale is a useful safety control, but a warning alone does not demonstrate that the risk has been adequately controlled.

**Validation evidence — Care Calendar**  
When asked whether showing “last refreshed 24 hours ago” was enough, you recognised that exposing the stale-data risk was useful but insufficient by itself. You expected a stronger operational strategy, such as a formal freshness expectation and a fallback mechanism that could reconcile against the provider source.

For a degraded state, you proposed continuing to show the last-known appointment time but with a clear explanation that it had not synchronised within the expected window and could be stale. You also proposed either a genuine manual synchronisation mechanism or instructions for contacting the provider to confirm the appointment. This showed that you understand transparency as one control within a broader safety strategy rather than as a complete discharge of responsibility.

### 2.5 Explain why appointment-data freshness thresholds should be derived from clinical-risk analysis and care context rather than chosen as arbitrary technical synchronisation intervals

**Description**  
There is no meaningful universal sync interval that can be chosen in isolation. Acceptable freshness depends on the care context, how soon the appointment is, and what harm could result from stale information.

**Validation evidence — Care Calendar**  
In a scenario with six-hour reconciliation, you immediately identified that clinical context matters and that temporal proximity matters independently. A six-hour delay may be tolerable for an appointment weeks away but unsafe if the appointment is inside or close to that six-hour window.

When asked what should determine whether one appointment needs a tighter interval than another, you identified risk analysis as the mechanism. This demonstrated that you understand freshness as a safety requirement derived from hazards and use context, not merely an arbitrary integration-performance target.

### 2.6 Distinguish service availability, integration-pipeline health, and end-state source reconciliation, and explain why none of these signals should be treated as interchangeable

**Description**  
A live server does not prove that the data pipeline is functioning, and a healthy pipeline does not by itself prove that Care Calendar matches the provider source. Different signals answer different questions.

**Validation evidence — Care Calendar**  
You questioned whether a provider posting to a `/health` endpoint every hour would be sufficient. You correctly identified the failure mode: the health ping could continue working while the provider's push-on-change logic had silently broken, creating false confidence.

You then explained that integration health should be derived from the actual data flow. You referenced message acknowledgements, queue lag, processing failures, dead-letter queues, expected sequence numbers or cursors as examples of signals that reveal whether the real pipeline is functioning. You understood that no single signal should be allowed to obscure silent failure in another part of the flow.

### 2.7 Explain why periodic reconciliation against the provider source gives stronger evidence of data currency than infrastructure or transport health signals alone

**Description**  
Periodic reconciliation compares Care Calendar's state with the provider's authoritative state. This can detect silent divergence even when individual infrastructure or transport signals appear healthy.

**Validation evidence — Care Calendar**  
You identified periodic reconciliation or “syncing” early in the discussion as the strongest mechanism for confidence that Care Calendar data is current. You proposed a normal push path plus a fallback pull/reconciliation path so missed push events could be discovered.

You later summarised the distinction yourself: reconciliation gives confidence that our data is current, while integration health is built from several data points to detect failure modes within the pipeline. This demonstrated that you understand reconciliation as an end-state check rather than just another infrastructure heartbeat.

### 2.8 Explain the role of a Clinical Safety Officer in formal clinical-risk management and how clinician, practitioner, and workflow expertise contributes without replacing that role

**Description**  
Formal clinical-safety judgement is overseen by a competent Clinical Safety Officer. Relevant clinicians, practitioners and workflow experts may provide essential input, but practitioner opinion alone is not the entire clinical-safety process.

**Validation evidence — Care Calendar**  
You asked whether “clinical-safety judgement” meant judgement from provider clinicians and then explored whether other sources were acceptable. Through that discussion, you distinguished questions requiring practitioner expertise from formal residual-risk judgements overseen by a Clinical Safety Officer.

You also explored whether a supplier normally has its own CSO and whether a deploying organisation performs a separate DCB0160 analysis. You understood that the supplier and provider can each have their own CSO responsibilities, informed by people who understand the relevant clinical and operational context.

### 2.9 Explain how DCB0129 and DCB0160 divide supplier-side and deployment-side clinical-risk responsibilities while requiring collaboration where risks cross the organisational boundary

**Description**  
DCB0129 addresses manufacturer-side clinical risk management. DCB0160 separately addresses the deploying organisation's use of the technology in its local environment. The two processes may need to interact where product assumptions meet provider workflows.

**Validation evidence — Care Calendar**  
You tested the model with a concrete organisational scenario: if the supplier's CSO considers the product acceptable under DCB0129 but the buyer's CSO identifies a local DCB0160 risk they cannot mitigate, can they come back to the supplier for changes?

You understood that the answer is collaborative rather than a simple transfer of responsibility. The buyer may need a product change, configuration change or other supplier-side mitigation, while the supplier may depend on provider-side workflow controls. You recognised that the two safety analyses address different scopes but may need complementary controls where the hazard crosses the organisational boundary.


### 2.10 Distinguish a product-level safety requirement from the provider-specific workflow used to satisfy it in deployment

**Description**  
Care Calendar should define safety requirements at the level of product behaviour and evidence, rather than silently prescribing a provider's internal operating model. A provider may use triage, direct clinician review, or another workflow. What matters to Care Calendar is whether the deployment can provide reliable evidence for any safety-relevant state the product intends to communicate. Provider-specific workflow design belongs to the deployment context; Care Calendar's responsibility is to avoid presenting a stronger state than the available evidence supports.

**Validation evidence — Care Calendar**  
Given the product-level requirement that Care Calendar must not imply attending-professional review unless reliable evidence of that review is available, you correctly separated that requirement from Provider X's internal triage-and-escalation workflow.

You identified Care Calendar's requirement as: the interface cannot display that a patient-submitted update has been reviewed by the attending professional unless the provider makes reliable evidence of that review available.

You then identified the provider's triage-and-escalation process as a deployment implementation rather than part of Care Calendar's product-level safety requirement.

You also correctly concluded that Care Calendar would need an exposed workflow state or equivalent evidence confirming attending-professional review before it could safely display that state to the patient. This demonstrates that you understand the difference between **what must be true for the product to communicate a state safely** and **how a particular provider's internal workflow makes that state true**.

A further nuance is that Care Calendar does not necessarily need every intermediate provider state to be exposed if the final state it needs to communicate can be evidenced reliably. For example, if the provider can reliably expose “reviewed by attending professional,” Care Calendar does not inherently need a separately exposed “escalated by triage” state unless that intermediate state is itself important to the product or safety model.
---

## 3. Request states, acknowledgement and human review

**Goal for this section:** understand and be able to explain the difference between technical delivery, provider receipt, human review, acceptance, action, and authoritative source-record change, so Care Calendar can communicate request progress without creating false reassurance about who knows what or what has actually changed.


### 3.1 Distinguish submitted, delivered/received, reviewed, accepted, acted on, and source-record-updated states, and explain why Care Calendar must not collapse them into a single request status

**Description**  
These are separate states. Progress through one does not imply progress through the others, and Care Calendar should expose only the state actually supported by the provider workflow.

**Validation evidence — Care Calendar**  
You repeatedly kept the request lifecycle separate from the authoritative appointment lifecycle. For example, when a patient requested a reschedule, you said the app should continue showing the current 10:00 appointment while displaying a separate “changes requested” state.

When the request was later marked accepted, you again kept the states separate: the app should show “request accepted” while continuing to display the provider's existing 10:00 appointment until the provider source itself changes. You explicitly described Care Calendar as having “no say over the appointment time” and only being able to display provider data, submit requests and show statuses.

### 3.2 Explain why technical delivery or receipt of patient/carer information is not evidence that an appropriate human has reviewed or understood it

**Description**  
A request reaching a provider-side system does not mean that a responsible person has read or understood it.

**Validation evidence — Care Calendar**  
In the scenario where a patient submitted an update saying they could not use their left arm, you said the information should be shown as submitted but not reviewed until the provider confirms actual review.

You understood that “sent” or “delivered” only describes technical progress through the communication path. It does not establish human awareness, much less awareness by the person who needs the information for the upcoming visit.

### 3.3 Explain how collapsing technical delivery and human review can create false reassurance, alter patient behaviour, and contribute to clinical risk

**Description**  
If a patient believes a clinician is aware of information that has only been technically delivered, the patient may fail to repeat it and make unsafe assumptions about subsequent care.

**Validation evidence — Care Calendar**  
You described a concrete causal chain: if the patient assumes the provider has received and understood the left-arm limitation, they may not mention it themselves at the visit. The clinician could then begin an activity that is inappropriate for someone without full use of the arm.

You added an important behavioural layer: the patient might not challenge the clinician because they think, “if the provider is asking me to do it, it must be safe.” That showed you understand how ambiguous status language can alter user behaviour and contribute to clinical risk even when the underlying message content is accurate.

### 3.4 Explain why a “reviewed” state establishes only the level of awareness actually evidenced by the workflow and must not imply acceptance, clinical action, or source-record change

**Description**  
Review establishes awareness only to the extent supported by the workflow. It does not imply acceptance, a changed treatment plan, a source-record update, or any particular clinical decision.

**Validation evidence — Care Calendar**  
When told that the provider had reviewed the left-arm update but had not changed the appointment plan or source record, you said the patient should be able to infer that the provider is aware of the limitation, but should not infer that the treatment plan has been amended because of it.

This demonstrated that you understand “reviewed” as a narrow evidence state rather than a shorthand for acceptance or action.

---

## 4. Stakeholders and organisational responsibility

**Goal for this section:** understand and be able to explain how responsibility is distributed across patients, carers, provider roles, Care Calendar, third-party integrations, and assurance actors; how product-level safety requirements differ from provider-specific workflows; and how cross-organisational dependencies and controls can be made explicit without inventing unsupported ownership or workflow assumptions.


### 4.1 Explain why responsibility in a provider organisation follows the specific actor, role, and workflow rather than attaching generically to “the provider”

**Description**  
“The provider” is not one undifferentiated actor. Scheduling staff, clinicians, administrative teams and other roles may each be responsible for different kinds of information and actions.

**Validation evidence — Care Calendar**  
In the scenario where the app said an update had been “reviewed by provider,” but only a scheduling administrator had seen it, you identified that the status was incomplete because it did not establish whether the update had been reviewed by the relevant responsibility actor.

You distinguished the workflow by request type. For a rescheduling request, a scheduling administrator may be exactly the right reviewer. For a patient-submitted limitation relevant to the clinical visit, the same “reviewed” state could wrongly imply that the visiting professional had seen it. Your answer showed that you understand responsibility as attached to the specific action and role rather than to the provider organisation as a whole.

### 4.2 Explain why a technically accurate internal status can still be unsafe or misleading if users are likely to infer a stronger operational fact than the system has established

**Description**  
A status may accurately describe an internal event while encouraging the user to infer something the system does not actually know.

**Validation evidence — Care Calendar**  
You recognised that “reviewed by provider” may technically be true if any provider employee has opened the request, while still being misleading in context. In the left-arm scenario, a patient could interpret that label as evidence that the clinician who will conduct the visit knows about the limitation.

You therefore identified a product responsibility not merely to display technically correct state, but to avoid wording that implies a stronger operational fact than the integration actually establishes.

### 4.3 Explain why Care Calendar, as the supplier-facing interface, is responsible for making provider and integration workflow states understandable without requiring patients to understand internal state machines

**Description**  
Users cannot be assumed to understand internal provider or integration state machines. Care Calendar must make clear what a status means and, where important, what it does not mean.

**Validation evidence — Care Calendar**  
You explicitly observed that Care Calendar may understand the provider's update-status lifecycle while the patient almost certainly does not. You said it is therefore our responsibility to be clear about what “reviewed” does not mean.

This goes beyond merely exposing raw provider statuses. Your answer demonstrated that product wording is itself part of safe communication: the user needs enough context to form the correct inference without having to understand provider operations.

### 4.4 Explain how responsibility should be separated when a third-party integration fails: Care Calendar owns the patient-facing workflow, the third party may own the immediate technical defect, and all parties need an agreed end-to-end recovery model

**Description**  
A third-party platform may own the immediate technical defect, but Care Calendar still owns the patient-facing reliability of the workflow it exposes. Responsibility therefore needs to be understood at multiple layers: user-facing product responsibility, technical fault ownership, and agreed recovery responsibilities across organisations.

**Validation evidence — Care Calendar**  
In a scenario where a request left Care Calendar successfully but was dropped by a third-party integration before reaching the provider, you said that from the patient's perspective the failure is ours. The patient used Care Calendar to send the request and reasonably expects it to reach its intended destination; they are unlikely to know or care that an intermediate platform failed.

You then separated that patient-facing responsibility from technical fault ownership. You identified the third-party platform as owning the immediate technical failure, while recognising that Care Calendar cannot simply treat “left our system” as proof of successful delivery.

Because this failure mode is foreseeable, you proposed an end-to-end validation and recovery strategy: detect whether information reached its intended destination, retry on failure, or expose a mechanism that allows the third-party platform to recover by requesting the information again. You also correctly said that the exact recovery design should be agreed across all involved parties rather than invented unilaterally by Care Calendar.

This answer demonstrated three distinct layers of responsibility:
1. Care Calendar owns the user's expectation that the workflow is reliable and honestly represented.
2. The third-party integration owns defects within its own technical component.
3. The organisations collectively need an agreed end-to-end recovery model so component boundaries do not create an unowned safety gap.


### 4.5 Distinguish operational actors, system dependencies, and assurance actors so responsibility, controls, and escalation are assigned to the right place

**Description**  
A trustworthy service map should distinguish between people or teams performing operational work, systems or integration services that transport or transform information, and assurance roles that assess whether risks are being managed appropriately. These categories matter because they carry different kinds of responsibility. Operational actors perform the care or administrative workflow; system dependencies can introduce or propagate technical failures; assurance actors review risk and governance but do not themselves operate the care process. Keeping those categories separate prevents the product team from assigning operational responsibility to an assurance role, treating a technical dependency as if it were a human decision-maker, or assuming that Care Calendar owns every failure that occurs somewhere in the wider service.

**Validation evidence — Care Calendar**  
Given a scenario involving a provider scheduling team, a third-party integration service, and the provider's Clinical Safety Officer, you correctly classified the scheduling team as the operational actor, the integration service as the system/dependency actor, and the CSO as the assurance actor.

You then connected the classification to responsibility. You explained that Care Calendar is not responsible for every possible failure across the full service. More precisely, our responsibility is tied to the behaviour of our product and to risks introduced, propagated, or left uncontrolled through the way it represents and depends on information from the wider service.

This demonstrates that you understand why a service map cannot stop at naming participants. The category of actor changes the kind of responsibility we should assign:
- the scheduling team owns provider-side appointment creation and changes;
- the integration service may own a technical failure in transporting an update;
- the CSO evaluates deployment risk and whether controls are adequate, but does not personally schedule the appointment or transmit the data;
- Care Calendar remains responsible for the behaviour of its own product, including how it represents source data, uncertainty, known failures, and foreseeable upstream failures that affect the reliability of what it shows.

Your answer therefore shows that you can separate **operational ownership**, **technical dependency ownership**, and **assurance responsibility** rather than collapsing them into a single idea of “who is responsible.”

### 4.6 Explain how immediate fault ownership differs from clinical-safety assurance responsibility

**Description**  
When a defect occurs inside Care Calendar, the product team owns the immediate technical failure and the operational work needed to detect, investigate, resolve, and prevent recurrence. Clinical-safety assurance is different: the relevant Clinical Safety Officer does not “own the bug” but is responsible for judging whether the hazard created by that class of failure has been identified, whether the proposed controls are adequate, and whether the residual clinical risk is acceptable within the applicable safety process. In a deployment, the provider-side CSO may separately need to consider whether local workflows add further controls or risks.

**Validation evidence — Care Calendar**  
In the scenario where the provider scheduling team correctly changed an appointment, the integration correctly transmitted it, Care Calendar correctly received it, but the frontend continued showing a stale cached time, you immediately identified Care Calendar as the owner of the technical failure. You also said that we are responsible for detecting the failure and escalating or resolving it.

You then challenged the phrase “assuring the failure,” which exposed an important wording distinction. You correctly reframed the CSO's role as determining whether the system adequately mitigates the clinical risk created by that failure through an appropriate detection and resolution plan. This demonstrates that you understand the difference between **fixing an implementation defect** and **assuring that the hazard associated with that defect is adequately controlled**.

Your answer also shows that you do not treat the CSO as an operational incident responder. The engineering/product organisation owns the faulty cached presentation and its remediation; the CSO evaluates the safety implications and whether the controls around that failure mode are sufficient.

### 4.7 Explain how cross-organisational controls can be independent and complementary without transferring ownership of the underlying failure

**Description**  
A failure can originate outside Care Calendar while still creating a risk condition that our product must manage. We do not need to own the upstream technical defect in order to own the way Care Calendar behaves when authoritative data becomes unavailable or uncertain. Provider-side and supplier-side controls can therefore operate independently against the same broader hazard chain. Independent controls add resilience because one control can still reduce risk if another fails, and because the same control may remain useful across several different failure scenarios. The important requirement is to understand which control each organisation owns, what assumptions connect them, and whether the combined strategy leaves any unowned gap.

**Validation evidence — Care Calendar**  
You clarified that you considered a provider outage to create a risk for Care Calendar because the app has lost access to the authoritative data it depends on, regardless of whether the immediate technical fault occurred in our infrastructure or the provider's. Your point was not that Care Calendar owns the provider's outage; it was that Care Calendar still has to control the risk created when it can no longer establish that the information it presents is current.

You also corrected your interpretation of the earlier downtime scenario. You had not understood the question as implying that one organisation would rely on the other organisation's control instead of maintaining its own. Once that was explicit, you identified two reasons for having controls on both sides of the boundary:
1. the controls are not necessarily coupled to one another and may be useful in different failure scenarios;
2. independent controls provide additional assurance if one control fails.

In the Care Calendar example, our stale-data detection and degraded-state behaviour can reduce risk when authoritative information cannot be confirmed, while the provider's telephone fallback can independently reduce the chance that the patient relies on stale appointment information. Your answer demonstrates that you understand complementary controls as layered resilience rather than as a transfer of responsibility from one organisation to another.

### 4.8 Explain how workflow-state semantics depend on both the provider integration and the safety analysis

**Description**  
Care Calendar should only expose workflow states whose meaning is actually supported by the provider integration. A label such as “received”, “reviewed”, “accepted” or “processed” is only safe if the product team knows what event produces that state, which actor or workflow it represents, and what the patient may and may not infer from it. The clinical risk analysis should identify which distinctions matter for safe use and what assumptions the product makes about provider workflows, but it does not magically create data the integration cannot expose. If a provider API only reports a coarse state such as “processed”, Care Calendar must either present that state narrowly, obtain richer workflow information, or avoid implying a more specific fact such as clinician review.

**Validation evidence — Care Calendar**  
In the scenario where a clinically relevant patient update reached the provider system but was never routed to the attending clinician, you correctly located the primary failure inside the provider workflow. You said Care Calendar could truthfully show that the information had been recorded in the provider system, but must not imply that the responsible actor had reviewed it.

You then identified an important implementation uncertainty: Care Calendar may not necessarily receive actor-level workflow detail from the provider. You questioned whether the integration would expose individual reviewers, only coarse states such as “accepted” or “processed”, or some intermediate set of statuses. You recognised that the safe meaning of each status is therefore relative to the actual provider workflow and the information available through the integration.

You also reasoned that these semantics should be considered during risk analysis: the team needs to understand which workflow states are visible, what events they represent, and what they do and do not allow the patient to infer. This demonstrated that you understand the general rule “do not imply more than the current state proves” must be made concrete for each integration and care workflow rather than applied as an abstract UI slogan.

The refinement established during validation is that risk analysis identifies the safety-relevant distinctions and assumptions, while the provider integration and workflow mapping determine what evidence is technically available. Where those do not align, the product must narrow its claims or seek a richer integration rather than invent a stronger status.


### 4.9 Explain why a supplier safety case should define product-level safety requirements and deployment dependencies without silently assuming a provider-specific workflow

**Description**  
A DCB0129 safety case should describe the product's safety-relevant behaviour, constraints, and dependencies at the supplier boundary. It should not silently assume that every provider follows a particular operational workflow, exposes a particular status, or routes information to a particular role unless that is an explicit condition of intended use. Provider-specific workflows belong to the deployment context and must be examined under DCB0160. Where safe use depends on a provider-side state such as attending-professional review, the supplier should express that as an explicit dependency or condition that must be evidenced in the deployment rather than treating the workflow as an established fact.

**Validation evidence — Care Calendar**  
A validation scenario incorrectly assumed that Care Calendar's original safety case already said, “Clinically relevant patient updates are reviewed by the attending professional before the appointment begins,” before we had established whether the provider workflow worked that way or whether the integration could expose that review state. You challenged the premise directly.

You pointed out that the provider using a triage workflow is primarily a deployment constraint and does not, by itself, change the underlying product-level safety requirement. The relevant Care Calendar requirement is narrower: the app must not represent an update as reviewed by the attending professional unless the deployment provides reliable evidence for that state, and any provider-side review dependency needed for safe use must be made explicit and validated for that deployment.

Your challenge demonstrated that you can distinguish a **supplier-level safety requirement** from a **provider-specific operational implementation**. It also exposed an important rule for future analysis: Care Calendar's DCB0129 work should not bake unverified provider workflows into the safety case and then treat differences discovered under DCB0160 as if the provider had invalidated our product assumption. The supplier defines the safe-use requirement and dependency; the provider's DCB0160 work establishes whether its actual workflow satisfies it.


### 4.10 Synthesize source state, request state, freshness, and cross-organisational responsibility without inventing unsupported workflow details

**Description**  
When several safety-relevant conditions occur at once, Care Calendar must keep each state separate: the provider's authoritative appointment state, the patient's request lifecycle, the freshness of Care Calendar's copy, and the responsibilities of each organisation in the wider service. The product should communicate only what the available evidence supports. Where the integration architecture or cause of a freshness failure is not specified, the correct response is to preserve that uncertainty rather than assign responsibility by assumption.

**Validation evidence — Care Calendar**  
In the final synthesis scenario, the provider source still showed a 10:00 appointment, the patient's rescheduling request had been acknowledged as received by the provider system, and Care Calendar's last successful reconciliation was outside the agreed freshness threshold.

You correctly said that Care Calendar should continue showing the 10:00 appointment because that is the last authoritative provider state available, while separately showing that the change request has been received. You also recognised that the appointment information must be shown in an explicit degraded state because our copy is no longer fresh enough to justify presenting it as confidently current.

You correctly identified several things Care Calendar must not imply:
- that the appointment has already changed;
- that the provider has refused the request;
- that a responsible person has reviewed the request;
- that the provider has acted on it.

You also correctly kept provider-side operational responsibility separate: the provider still owns reviewing the request and reaching an outcome, including either accepting or refusing it.

Most importantly, you refused to invent responsibility where the scenario did not provide enough information. You said you could not determine what responsibility remained with the third-party integration because the scenario did not establish whether it pushes updates, exposes data on request, or performs some other role. You also noted that the scenario did not tell us whether the freshness threshold was exceeded because Care Calendar failed to refresh or because the integration failed to supply current data.

That is the correct safety reasoning. Your answer was specifically about **degraded confidence in currency**: because the appointment time and request status had not been reconfirmed within the agreed freshness window, Care Calendar could no longer present either value with normal confidence. The last-known values may still be correct, but the app no longer has sufficient evidence that they remain current.

You also correctly separated this uncertainty from fault attribution. Care Calendar owns communicating the degraded-confidence state of the information it presents. The immediate technical cause of the stale state cannot be assigned until the architecture and failure evidence show whether the missed confirmation originated in Care Calendar, the third-party integration, or another dependency. This demonstrates that you can distinguish **uncertainty about whether a value is still current** from **certainty that the underlying value is factually wrong**.



## 5. Care/service journey, handovers and information provenance

**Goal for this section:** understand how information moves through the end-to-end home-care journey, where responsibility changes hands, and how Care Calendar should preserve source, freshness, provenance, and observable workflow state without becoming the source record itself or inventing relationships it cannot evidence.

### 5.1 Explain why information shown together in one appointment view can have different provenance and freshness

**Description**  
Care Calendar may combine provider-held appointment data, patient/carer submissions, workflow states, and Care Calendar reconciliation metadata in one interface. Those layers do not automatically share the same origin, authority, or freshness. Freshness belongs to the specific information flow that has actually been confirmed.

**Validation evidence — Care Calendar**  
You separated the appointment from the patient-submitted update. You identified the provider system as the source of the authoritative appointment state and Care Calendar's reconciliation timestamp as evidence of when that appointment state was last confirmed. For the patient request, you identified the patient as the actor-originator and Care Calendar as the system that manages the request record and its outbound lifecycle.

You initially assumed the appointment and request status shared the same 20-minute freshness because you assumed they used one reconciliation mechanism. When that assumption was challenged, you correctly explained that the two information flows may have independent reconciliation mechanisms. You therefore refined the rule to: a freshness timestamp can only be shared across information layers if the architecture actually confirms them together.

### 5.2 Explain why provenance must distinguish source-record event time from the time Care Calendar received or confirmed that event

**Description**  
Care Calendar may know that a provider-held appointment has changed without knowing exactly when the provider changed its authoritative source record. Provenance should distinguish timestamps supplied by the source from timestamps generated by Care Calendar itself.

**Validation evidence — Care Calendar**  
When the provider changed an appointment from 10:00 to 14:00 but did not expose the source-record change time, you said Care Calendar could show when it received the updated appointment state and could show that the provider's current state is 14:00. You correctly rejected inferring when the provider actually made the change.

This demonstrated that you understand the distinction between **source event time** and **Care Calendar observation/confirmation time**.

### 5.3 Explain why temporal sequence must not be presented as causal provenance unless the source explicitly links the events

**Description**  
Care Calendar may observe that one event happened before another, but timing alone does not prove that the first event caused the second. Causal relationships must come from explicit source evidence.

**Validation evidence — Care Calendar**  
In the scenario where a rescheduling request was received before the provider later changed the appointment from 10:00 to 14:00, you said Care Calendar could show both events and their timestamps but could not state that the request caused the time change. You explicitly identified the alternative possibility that the provider rescheduled the appointment for another reason and that the timing was coincidental.

You summarised the rule as: Care Calendar must not manufacture a causal relationship that the source does not establish.

### 5.4 Explain how authorship, record ownership, action ownership, and representation responsibility can differ within the same appointment journey

**Description**  
A record can be authored by one actor, managed by one system, acted on by another workflow, and represented by Care Calendar. These are distinct responsibilities and should be applied symmetrically to patient-side and provider-side information.

**Validation evidence — Care Calendar**  
For a patient note saying they may be 15 minutes late, you identified the provider system as owning the authoritative appointment record, Care Calendar as managing the request record, and the provider workflow as owning any resulting appointment action such as rescheduling.

You also clarified that when you say “Care Calendar is the source of the request,” you mean it is the managing system for that request record, just as the provider system manages the appointment record. You recognised that in both cases a human or organisational actor may originate the record. This led to the symmetric model: **actor/workflow originator → managing system/source of record → downstream representation**.

### 5.5 Explain why technically received data should not be exposed to users when its semantic meaning is undefined

**Description**  
A handover can succeed technically while failing semantically. Care Calendar should only translate provider data into patient-facing meaning when the integration contract establishes what that data means. Opaque workflow states should not be exposed if users could reasonably infer more than the evidence supports.

**Validation evidence — Care Calendar**  
When the provider supplied an appointment time, a preparation instruction, and an undefined `processed` status, you said the appointment time and preparation instruction could be displayed because their meaning was established. You would not display `processed` because Care Calendar did not know what it meant.

You explicitly identified the risk of harm through misunderstanding if an undefined status were shown to patients.

### 5.6 Explain how one appointment journey can span multiple provider organisations with different ownership responsibilities

**Description**  
A single appointment can involve one organisation owning the authoritative scheduling state and another organisation owning delivery of the care. Care Calendar should preserve those organisational boundaries rather than flattening them into a generic “provider.”

**Validation evidence — Care Calendar**  
In the shared-care scenario, you distinguished Provider A as owning the appointment schedule and Provider B as owning delivery of the visit. You modelled the service as three distinct entities—Provider A, Provider B, and Care Calendar—with information handovers between them.

You also treated the proposed gateway architecture (Care Calendar ↔ Provider A ↔ Provider B) as an assumption rather than a fact, recognising that the actual integration topology could differ.

### 5.7 Distinguish confidence in an authoritative appointment field from confidence in downstream care-delivery readiness

**Description**  
Care Calendar may have high confidence in one layer of the appointment while having lower confidence in another. A confirmed authoritative appointment time does not automatically prove that every downstream delivery actor is aligned with that time.

**Validation evidence — Care Calendar**  
After the scenario was rephrased with explicit layers, you said Care Calendar could confidently show the appointment time as 14:00 because Provider A was authoritative, while treating the care-delivery state as uncertain because Provider B had not been shown to be aligned.

You also corrected an imprecise formulation that suggested the “appointment itself” remained fully certain. You explained that confidence can be degraded at the broader appointment-delivery level while confidence in the **appointment time field itself** remains high.

### 5.8 Distinguish normal pending confirmation from degraded cross-provider coordination

**Description**  
An unconfirmed downstream state is not automatically a failure. The meaning depends on the expected workflow and prior state. A newly scheduled appointment may legitimately be awaiting downstream confirmation, whereas a previously aligned system that later diverges provides stronger evidence of degraded coordination.

**Validation evidence — Care Calendar**  
You explained that if 14:00 is the original appointment time, it may be normal for Provider A's scheduling system to confirm the appointment before Provider B's delivery workflow does. In that case, “waiting for confirmation” is more accurate than “degraded.”

You contrasted this with a case where the two providers had previously been aligned and a later change caused them to diverge. You identified the patient-facing value of distinguishing **waiting for confirmation** from **something may have gone wrong**.

### 5.9 Explain why a successful technical handover does not prove that the organisational handover needed for care delivery succeeded

**Description**  
End-to-end service mapping must include both system-to-system transfers and actor/workflow handovers. Information can move successfully between systems while failing to reach the person or team that needs to act on it.

**Validation evidence — Care Calendar**  
When Provider A successfully transmitted a 14:00 update to Provider B's system but Provider B's visiting professional still had 10:00 on their work list, you correctly identified the technical handover as successful and the internal organisational handover as failed.

You concluded that mapping only cross-system boundaries would hide the uncertainty in care delivery, and that the service map therefore needs handovers **between systems and between actors within those systems**.

### 5.10 Explain why unobservable service handovers still matter to the service model but should not generate Care Calendar UI states without evidence

**Description**  
The end-to-end service may contain provider-internal handovers that are relevant to real-world delivery but invisible to Care Calendar. They should be represented in the service map and provider-side risk reasoning, but Care Calendar should not invent uncertainty or workflow states for them unless the integration exposes evidence that allows the product to observe them.

**Validation evidence — Care Calendar**  
In a scenario where the provider's internal rescheduling workflow had failed but Care Calendar had no visibility into that workflow, you pointed out that Care Calendar would not know the failure had occurred. If the provider exposed only a confirmed 14:00 appointment state, Care Calendar would have no evidence-based reason to invent a separate care-delivery status.

You correctly separated the **omniscient service-map view**, where the failed internal handover matters, from the **Care Calendar product view**, where only observable evidence can drive patient-facing state.

### 5.11 Synthesize authoritative state, derived view, provenance, observable handovers, and unproven relationships without overstating certainty

**Description**  
Care Calendar should combine authoritative provider state, patient/carer submissions, and workflow information only to the extent that each relationship is supported by evidence. It must distinguish what is current and confirmed from what is merely adjacent in time, and distinguish observable handovers from real but unobservable provider workflow transitions.

**Validation evidence — Care Calendar**  
In the final synthesis scenario, Provider A's authoritative system showed the appointment at 14:00. The patient had submitted a left-arm limitation through Care Calendar, Provider A's system had accepted the submission, and a provider-side note later appeared saying “Patient reports limited use of left arm.” The provider did not expose who authored that provider note, whether it was created because of the patient's submission, or whether the visiting professional had reviewed it.

You correctly said Care Calendar can show the current 14:00 appointment state and the provider-side note, along with the provenance that Care Calendar observed the appointment record gaining that note at a known time. You also correctly kept the patient's submission and the provider-side note as separate provenance events.

You identified two unproven relationships: Care Calendar cannot infer that the patient submission caused the provider-side note to be added, and it cannot infer that the visiting professional has reviewed the note. You therefore avoided both causal overstatement and an invented organisational handover.



---

## 6. Bounded edge cases: capacity, safeguarding, medicines and outages

**Goal for this section:** understand which healthcare-specific edge cases introduce genuinely new responsibility or authority boundaries, and which merely require Care Calendar to transfer already-established principles without expanding its intended purpose.

### 6.1 Explain why mental capacity must be understood as decision-specific and time-specific rather than represented as one global patient property

**Description**  
Mental capacity is assessed for a particular decision at the time that decision needs to be made. Care Calendar should therefore not model capacity as one permanent global flag and derive every permission from it. Release 1 deliberately requires the patient to have the capacities needed for every decision involved in using the enabled product feature set, including relevant carer-authorisation decisions. Care Calendar does not assess capacity itself; any capacity determination it relies on sits upstream of the product.

The Release 1 rule does not establish that all current or future carer permissions necessarily form one legal capacity decision. If later features introduce materially different decisions or authority boundaries, those may need to be reconsidered separately. A future version could potentially support partial feature access where narrower capacity and authority boundaries are established, but Release 1 does not.

**Validation evidence — Care Calendar**  
You initially scoped the relevant capacity to being able to authorise a carer to help coordinate appointments and explicitly placed the act of determining capacity outside Care Calendar. You then refined the model after discussing permission granularity: you recognised that as the product evolves, different permissions may not necessarily fall under one capacity decision, even though the Release 1 product rule remains that the patient must have all capacities required for the enabled feature set.

You also distinguished authorisation renewal from capacity assessment. Periodically reconfirming that a carer should retain access could be a product decision, but that does not mean Care Calendar should periodically reassess mental capacity. In multiple-choice validation, you correctly identified the underlying principle that capacity is assessed in relation to a specific decision at the time it needs to be made, rather than being a stable global property.

### 6.2 Explain how Care Calendar may support safeguarding-related routing, status or visibility without itself deciding whether a safeguarding concern exists

**Description**  
Care Calendar should not analyse ordinary free text and decide that abuse or neglect has occurred or that statutory safeguarding criteria are met. It may, however, support an explicit user-selected concern-reporting route or represent a safeguarding-relevant state supplied by the provider. Once such a trustworthy state exists, it may legitimately affect routing, presentation, or visibility according to agreed provider rules.

The provider and relevant safeguarding professionals remain responsible for deciding whether safeguarding criteria are met, what action is required, and what information may or should be shared.

**Validation evidence — Care Calendar**  
You initially questioned how Care Calendar could provide special safeguarding routing without first interpreting message content. You resolved that apparent contradiction by separating **classification** from **representation/handling**. An ordinary user message can follow the normal workflow unless the provider later marks it as safeguarding-relevant. Alternatively, Care Calendar could provide an explicit “report a concern” route selected by the patient, which gives the product a routing signal without requiring it to infer meaning from prose.

You also identified a new visibility consequence: if the provider marks information as safeguarding-related, Care Calendar may need to display it differently or withhold it from an otherwise authorised carer, particularly if that carer could be implicated in the concern. In multiple-choice validation, you correctly selected the model in which Care Calendar can support explicit concern-reporting or provider-defined safeguarding states while leaving safeguarding judgement and response to provider/specialist workflows.

### 6.3 Apply the established semantic-integrity rule to appointment-relevant medicines information without creating a separate medicines-management responsibility

**Description**  
Medicines information can be safety-relevant, but the main Care Calendar principle is already established: preserve the provider's wording, provenance and semantic meaning rather than translating it into a stronger clinical interpretation. Medicines context does not by itself create a new product responsibility.

**Validation evidence — Care Calendar**  
You explicitly challenged the need for a full medicines lesson because it appeared to repeat the already-established rule that Care Calendar does not reinterpret provider information. We agreed that medicines is primarily a transfer context rather than a new conceptual area. In review, when the provider wording was “Medication offered; patient declined,” you correctly chose to preserve that wording rather than translate it into “medication missed” or another unsupported state.

### 6.4 Apply the established freshness/degraded-state model to provider outages without confusing upstream fault ownership with downstream Care Calendar responsibility

**Description**  
A provider outage remains an upstream fault, but if it prevents Care Calendar from confirming current appointment information, Care Calendar owns the resulting uncertainty in its own derived view. It should preserve the last confirmed source state while making degraded confidence in currency explicit.

**Validation evidence — Care Calendar**  
Outages had already been studied extensively earlier in the module, so this subsection was treated as review rather than new teaching. In multiple-choice review, you correctly selected the response that retains the last confirmed appointment value, marks it as degraded or potentially stale once the freshness threshold is exceeded, and explains that current provider data cannot presently be verified.

---

## 7. User-centred discovery

**Goal for this section:** understand user research as a way to validate and enrich the problem context that Care Calendar's product reasoning depends on, while recognising that user preferences do not override safety, provenance, legal, or assurance constraints.

### 7.1 Explain why early Care Calendar research should validate and enrich the problem context rather than primarily ask users to judge the proposed solution

**Description**  
Product reasoning is only as good as the context it is built on. In an unfamiliar domain, early research should temporarily bracket the proposed solution and investigate the real behaviours, constraints, workarounds, burdens and consequences that produced the product hypothesis. Research may confirm, complicate, or contradict the context model and should feed that richer context back into product reasoning.

**Validation evidence — Care Calendar**  
You reframed the purpose of research around the distance between the product team and the problem domain. You observed that deciding to build a product already implies some reasoned model of the problem, but when domain context is incomplete, the risk is that good reasoning is being applied to inaccurate or partial inputs. You therefore described research as validating the context we used to reason toward Care Calendar and building any missing context before judging whether the solution still follows.

In multiple-choice validation, you correctly selected the formulation that early research should validate and enrich the problem context while temporarily bracketing the current Care Calendar solution.

### 7.2 Explain why user preferences are evidence about usability needs but cannot authorise Care Calendar to weaken safety, provenance or semantic constraints

**Description**  
User research can reveal that the current presentation is confusing, burdensome, or cognitively expensive. That evidence should influence design, but it does not permit Care Calendar to infer provider meaning it does not possess or collapse distinct assurance-relevant states into unsupported conclusions. The product challenge is to satisfy the usability need without changing the semantics of the evidence.

**Validation evidence — Care Calendar**  
You identified an important overlap between user assumptions and assurance when considering whether source/freshness information or detailed request statuses are useful. You specifically challenged a hypothetical user preference for a binary “you need to do something / you don't need to do something” model because producing that state might require Care Calendar to interpret provider information, contradicting the product boundary already established.

We refined the implication: such feedback would be evidence that users need a simpler presentation, not permission to invent meaning. In multiple-choice validation, you correctly chose to explore clearer presentation, grouping, progressive disclosure or provider-defined guidance while preserving the underlying source semantics.

### 7.3 Explain why discovery should pay attention to evidence that confirms, complicates or contradicts the context model rather than requiring a predetermined binary product kill criterion

**Description**  
Bounded research should have clear decision relevance, but it does not need an artificial binary threshold that determines whether the whole product survives. The important discipline is to know which parts of the current context model are assumptions and remain alert to evidence that changes those assumptions. Product direction can then evolve because the underlying information changed.

**Validation evidence — Care Calendar**  
You challenged the original instruction to decide in advance exactly what evidence would change the product direction, arguing that this itself embeds assumptions. You proposed a better framing: because product teams can reasonably make good decisions from the information available, research should focus on whether that information is accurate and complete. We adopted that refinement and replaced the binary “decision threshold” idea with attention to how research informs and changes the context model.

### 7.4 Identify a strong first Care Calendar discovery hypothesis that tests the coordination problem without prematurely asserting a solution or clinical harm outcome

**Description**  
The first discovery hypothesis should sit close to observable user behaviour and burden. It should not assume Care Calendar works, that a calendar is necessarily the right interface, or that coordination complexity causes clinically significant missed care. Stronger consequential claims can emerge as findings and be investigated separately.

**Validation evidence — Care Calendar**  
You agreed that the strongest initial hypothesis is that people coordinating appointments across multiple health and care services experience meaningful manual burden from consolidating fragmented appointment information and managing changes. You also considered whether the more consequential hypothesis—coordination complexity putting people at risk of missing important care—might be more important, but recognised that it is a stronger claim requiring different evidence.

We therefore kept missed/delayed care as a potential consequential finding rather than the primary first-study claim. In multiple-choice validation, you correctly selected the fragmentation/manual-burden hypothesis over claims that Care Calendar reduces missed care, that users prefer calendars, or that request statuses reduce anxiety.

### 7.5 Define a bounded first discovery study that investigates current behaviour while minimising unnecessary sensitive-data collection

**Description**  
A suitable first study is a small qualitative discovery exercise with relevant patients and carers who coordinate appointments across more than one service. Questions should begin from recent real behaviour—how information arrived, how it was consolidated, how changes were managed, what created uncertainty, and what consequences followed—rather than asking whether participants like the Care Calendar concept.

Because participants may naturally discuss health and care experiences, the study should avoid collecting unnecessary diagnoses, medication histories or detailed clinical narratives when the research question can be answered through service, channel, coordination and workflow information.

**Validation evidence — Care Calendar**  
Through discussion, you accepted the proposed primary context hypothesis and the need to bracket the product itself. The applied research plan therefore focuses on current coordination behaviour, includes both patients and carers with multi-service experience, and explicitly separates potential consequential findings such as missed care from claims the initial study could actually establish.

The resulting `care-calendar-initial-user-discovery-plan.md` is the applied output for this learning outcome.

---

## 8. Evidence-control operating model

**Goal for this section:** understand how to record what Care Calendar evidence actually proves, how strongly a claim is supported, what kind of scrutiny or assurance has been applied, and when a statement is important enough to track formally—without allowing evidence administration to replace learning, reasoning or building.

### 8.1 Explain the distinction between evidence maturity and assurance status as claim state versus judgement state

**Description**  
The E and A scales answer different questions.

- **Evidence maturity (E)** asks: **How strongly is this claim supported? What proof do we possess?**
- **Assurance status (A)** asks: **What level of independent, competent or formal judgement has been applied to that support?**

Useful mental models include:

- **E = claim state / proof state**
- **A = judgement state / scrutiny state**
- **E = how do we know?**
- **A = who or what has judged whether that is enough?**

A secondary intuition is **inside versus outside the building loop**. Evidence is often produced by the team building the product. Assurance increasingly asks whether that evidence has been checked beyond the act of building—through explicit technical validation, specialist judgement, or formal organisational/regulatory process. This is a gradient rather than a strict organisational boundary: what matters is the independence, competence and authority of the judgement.

**Validation evidence — Care Calendar**  
You initially found the E/A labels hard to distinguish because “E2 — demonstrated in a bounded project” and “A1 — technically validated within a stated scope” both sound like evidence-producing activities. Through discussion, you developed several compatible mental models and concluded that **claim state versus judgement state** is the cleanest primary distinction, while **inside versus outside the building loop** remains a useful intuition for why assurance exists.

In multiple-choice validation, you correctly selected the formulation that evidence maturity tracks how strongly the claim itself is supported, while assurance status tracks the independence, competence and formality of the judgement applied to that support.

### 8.2 Distinguish E0, E1, E2 and E3 as increasing maturity of the claim's supporting evidence

**Description**  
The evidence scale describes what support exists for a narrow claim:

- **E0 — Unverified:** assumption or reasoned proposition without the relevant evidence.
- **E1 — Source verified:** an appropriate authoritative source supports the factual claim.
- **E2 — Demonstrated in a bounded project:** the claim has been shown in Care Calendar within a stated project scope.
- **E3 — Independently reviewed:** someone independent of producing the specific result has reviewed or confirmed it.

E3 strengthens the evidence state but does not by itself imply specialist or formal assurance.

**Validation evidence — Care Calendar**  
You correctly reasoned that an independently reviewed reconciliation implementation could move a narrow technical claim from E2 to **E3** while remaining at **A1** if the scrutiny is still technical rather than specialist or formal. This demonstrated that you can separate independent confirmation of the evidence from the authority of the assurance applied to it.

### 8.3 Distinguish A0, A1, A2, A3 and AX as increasing forms of scrutiny or assurance

**Description**  
The assurance scale records the type of judgement applied to a claim or result:

- **A0 — Educational simulation only:** no higher assurance has been applied.
- **A1 — Technically validated within a stated scope:** the result has been checked against an explicit technical criterion.
- **A2 — Specialist opinion obtained:** an appropriately competent specialist has reviewed a specific conclusion within their remit.
- **A3 — Formal organisational or regulatory assurance:** the conclusion has passed through an appropriate formal assurance process.
- **AX — Formal assurance unavailable or not claimable in this project:** the portfolio project cannot legitimately make that formal assurance claim.

The building team must not treat its own confidence in an implementation as equivalent to specialist or formal assurance.

**Validation evidence — Care Calendar**  
You correctly identified an integration test that proves a degraded-state warning appears after a 60-minute threshold as **E2/A1**: demonstrated in the bounded project and technically validated against an explicit criterion.

You also correctly identified that a Clinical Safety Officer agreeing that a specific hazard and causal chain are clinically plausible may raise that narrow conclusion to **A2**, but does not establish acceptable residual risk, DCB0129 compliance, formal assurance or overall clinical safety.

### 8.4 Explain why A1 technical validation requires criterion, method, result and limitation

**Description**  
A1 is not simply “we tested it.” A technically validated result should record:

1. **Criterion** — what had to be true.
2. **Method** — how the criterion was tested.
3. **Result** — what happened.
4. **Limitation** — what the test does not establish.

The limitation is especially important because it prevents a narrow technical test from silently becoming a broader safety, usability, reliability or compliance claim.

**Validation evidence — Care Calendar**  
The degraded-state example established the distinction: a test may prove that the UI shows a warning when data exceeds a configured threshold, while saying nothing about whether that threshold is clinically appropriate. You consistently distinguished technical behaviour from the specialist judgement required to assess its adequacy.

### 8.5 Explain why claim status belongs to the narrow statement or result rather than the whole artefact

**Description**  
A single Care Calendar document can contain source-backed facts, project assumptions, implemented results, untested design hypotheses and specialist-dependent conclusions. Giving the entire artefact one E/A pair would obscure these differences.

Statuses should therefore attach to the narrowest meaningful statement, implementation result, test result or reviewed conclusion.

**Validation evidence — Care Calendar**  
Across the module, you repeatedly rejected attempts to broaden what evidence established. For example, a tested reconciliation behaviour supports a narrow claim about detecting and correcting a tested divergence; it does not support a whole-system statement that Care Calendar “reliably keeps provider information synchronised.”

This same discipline was validated in the module synthesis review, where you selected the narrow reconciliation statement over broader claims about reliability, clinical safety or full integration assurance.

### 8.6 Prefer descriptive claims over interpretive or evaluative claims unless the broader conclusion has earned sufficient evidence

**Description**  
Care Calendar claims can be thought of as a progression:

- **Descriptive:** what was built, observed, sourced or tested.
- **Interpretive:** what those facts mean in a particular context.
- **Evaluative:** how good, reliable, safe, effective, trustworthy, accessible or useful the resulting system is.

Descriptive claims are often easiest to support precisely because they contain fewer hidden propositions. Interpretive and evaluative claims are not forbidden, but they need evidence for the additional conclusions embedded in their wording.

A useful rule is:

> **Stick to the details. Facts first; conclusions earn their way in.**

**Validation evidence — Care Calendar**  
You noticed that the strongest narrow examples were factual and resembled technical writing, while the problematic broader examples were usually qualitative conclusions. You reframed the lesson from merely “avoid broad claims” to **prefer factual detail**, because it is much harder to overclaim when summarising exactly what the system does and what was tested.

In multiple-choice validation, you correctly identified “Care Calendar displays provider source-update time separately from the time its own reconciliation last confirmed the record” as a descriptive claim, distinguishing it from broader claims about reliability, transparency or trustworthiness.

### 8.7 Decide proportionately which conclusions deserve active claim records

**Description**  
Not every useful fact should become an active claim. A formal claim record is justified where:

- a current product decision depends on it;
- another active lesson depends on it;
- misunderstanding it could materially alter the work;
- it is likely to support a public case-study statement.

The approximate 15–20 active-foundational-claim ceiling is a cognitive-load and proportionality guardrail, not a completeness target.

**Validation evidence — Care Calendar**  
In validation, you correctly chose the source-record versus coordination-view distinction as worth an active claim record because architecture, provenance, safety reasoning, request handling and later assurance work all depend on it. You rejected incidental facts such as the framework used by the UI or the existence of a calendar screen as unnecessary claim administration.

### 8.8 Explain why specialist review and independent review do not automatically imply formal assurance

**Description**  
Independent review strengthens evidence. Specialist review adds assurance within a specific competence. Neither automatically creates formal organisational or regulatory assurance.

A senior engineer reviewing a technical implementation may support E3 while the assurance remains A1. A CSO reviewing a narrow hazard conclusion may support A2. A3 requires an appropriate formal process, not merely a knowledgeable reviewer.

**Validation evidence — Care Calendar**  
You correctly answered both review scenarios:

- independent senior-engineer review can support **E3/A1**;
- CSO review of one hazard conclusion can support **A2** for that conclusion without establishing formal compliance or overall clinical safety.

This demonstrates that you understand why the framework tracks evidence maturity separately from the authority of the judgement applied to it.

---

## Current revision status

### Foundational module status

**Module 1 — Foundations and care-service context is complete.**

Completed sections:

- **1. Product purpose and information boundaries**
- **2. Clinical safety: foundational mental model**
- **3. Request states, acknowledgement and human review**
- **4. Stakeholders and organisational responsibility**
- **5. Care/service journey, handovers and information provenance**
- **6. Bounded edge cases**
- **7. User-centred discovery**
- **8. Evidence-control operating model**

The foundational module integration review is complete. The synthesis review confirmed that the concepts form one connected service model rather than a set of isolated topics: source and provenance determine what Care Calendar knows; handovers and responsibility determine who must act; clinical-safety reasoning examines how failures can contribute to harm; user research validates and enriches the problem context; and the evidence/assurance model controls what can legitimately be claimed about the product and its results.

### Delivery conclusions established during Module 1

- Track progress by **learning module**, not calendar week.
- Start sections with explicit, high-resolution learning outcomes.
- Teach new concepts before validation.
- Use discussion as core learning time.
- Classify later material as **new concept**, **new implication**, or **transfer example** to avoid redundant teaching.
- When understanding is already established through discussion, validate with multiple choice rather than repeated open-ended explanation.
- Treat correct reuse of earlier concepts as retention evidence.
- Use formal review selectively for concepts that have not naturally recurred, caused hesitation, exposed corrections, or are important prerequisites.
- Avoid broad free-recall review questions during concept learning; reserve that style for later interview-preparation retrieval practice.
- Create repo-ready Care Calendar artefacts only after their substantive contents have been learned and validated.
- Use descriptive-first claims and allow broader conclusions to earn their way in through sufficient evidence and assurance.

### Current applied Care Calendar artefacts

- `care-calendar-intended-purpose-and-exclusions.md`
- `care-calendar-foundational-clinical-safety-model.md`
- `care-calendar-stakeholder-and-responsibility-map.md`
- `care-calendar-care-service-journey-and-handovers.md`
- `care-calendar-initial-user-discovery-plan.md`

The learning-outcomes document is revision/evidence material rather than a product artefact.

### Next module

**Module 2 — NHS assurance and evidence landscape**

Start Module 2 in a new conversation using:

- the frozen v0.3.1 curriculum;
- `care-calendar-learning-delivery-wrapper.md`;
- this learning-outcomes document;
- `care-calendar-module-1-integration-review.md`;
- the current repo-ready Care Calendar artefacts.
