# Care Calendar Learning Plan — Delivery Wrapper

## Purpose

This document defines **how to deliver** the frozen `trustworthy-healthcare-social-care-learning-plan-v0.3.1` curriculum after lessons learned during execution of the foundational material.

It does **not** replace the curriculum, its primary-source discipline, evidence/assurance model, competence boundaries, minimum Care Calendar journey, or public-claim controls.

Instead, it replaces the original **calendar-week delivery wrapper** with a **module-based learning model** that better reflects:

- the actual depth required;
- overlap between topics;
- the learner's preferred learning method;
- cumulative reinforcement through later material;
- the need to create repo-ready artefacts only after the underlying material has been learned and validated.

The frozen v0.3.1 plan remains the curriculum authority unless execution reveals a specific substantive problem.

---

# 1. Overall learning objective

The programme exists to support the following objective:

> Become a senior product and frontend engineer who understands how to build trustworthy, clinically safe, inclusive and effective healthcare and social-care products—and who can go deeper into medical-device software when a product requires it.

The portfolio project is **Care Calendar**, a fictional patient-and-carer coordination product that is being built as a product within the AdamBelton.com project.

The narrow minimum journey remains:

> A person and authorised carer review an upcoming home-care visit, see which organisation owns the next action, inspect the source and freshness of the information, update a communication need, and request correction of inaccurate information.

Do not broaden that minimum journey unless later learning establishes a concrete need.

---

# 2. Why the delivery model changed

The original plan estimated:

- 12 weeks;
- 66–78 total hours;
- usually 5–7 focused hours per week.

Actual execution showed that the **content remains useful**, but the week-based time model is not realistic for the desired learning depth.

The foundational material alone took substantially longer than one nominal week because:

- healthcare concepts overlap heavily;
- meaningful discussion and model refinement are core learning activities;
- primary-source verification adds time;
- nuanced validation reveals misunderstandings that passive reading would miss;
- applied Care Calendar artefacts require careful boundary and evidence work;
- the learning method itself was refined during execution.

The original time estimates should therefore be treated as **historical v0.3.1 estimates**, not constraints.

Future time estimates are working estimates only and should be recalibrated using actual focused time.

---

# 3. Primary unit of progress: modules, not calendar weeks

The programme should now be executed as a sequence of **learning modules**.

A module:

- groups materially related concepts;
- respects dependencies from the frozen plan;
- may span multiple real-world weeks;
- ends when its learning outcomes have been established and its necessary applied work is complete;
- ends with an integration review.

Calendar time does not determine completion.

## Module completion gate

A module is complete when:

1. required learning outcomes have been taught;
2. understanding has been established through discussion and/or validation;
3. important misconceptions have been corrected;
4. relevant cumulative review has been completed;
5. repo-ready applied outputs contain only material already learned and validated;
6. unresolved specialist dependencies are explicit;
7. the module integration review is complete.

---

# 4. Standard module delivery cycle

Every module should use the following sequence.

## Stage 1 — Module overview

At the beginning of a module, show:

- **Module name**
- **Purpose**
- **How it builds on previous modules**
- **Learning sections**
- **Learning outcomes**
- **Primary source families**
- **Expected applied outputs**
- **Initial working time estimate**
- **Known prerequisite concepts from earlier modules**

Do not present an undifferentiated reading list.

## Stage 2 — Section learning outcomes

Before teaching a section, state its outcomes explicitly using language such as:

> After this section, I should understand...

or:

> After this section, I should be able to explain...

The outcomes must be specific enough to make the section's purpose obvious.

## Stage 3 — Classify the material before teaching it

Before creating a full lesson, determine whether the subsection is:

### A. New concept

It materially extends the mental model.

Use:
- source-grounded teaching;
- examples;
- discussion;
- nuanced validation if needed.

Example from the foundational module:

> Mental capacity is decision-specific and time-specific.

### B. New implication of an established concept

The existing principle is known, but the new context introduces a meaningful consequence.

Use:
- concise teaching focused on the new implication;
- discussion;
- validation only if understanding is not already demonstrated.

Example:

> Safeguarding metadata can affect visibility as well as routing.

### C. Transfer example

No new conceptual model is introduced.

Do **not** reteach the principle.

Use:
- a short review or multiple-choice question later.

Example:

> Applying the already-established semantic-integrity rule to “Medication offered; patient declined.”

This classification is a key efficiency control.

---

# 5. Preferred learning rhythm

For a genuinely new topic, use this order:

## 1. Teach first

Present a concise, source-grounded explanation with examples tied to Care Calendar.

Questions should **not be the primary mechanism for introducing the concept**.

## 2. Discuss and refine the model

Allow challenge, comparison, terminology clarification, architecture reasoning, and product implications.

Discussion is core learning time.

Do not rush to the next validation question while an important distinction remains unclear.

## 3. Validate only what remains uncertain

Use open-ended scenario questions when:

- the concept is genuinely new;
- nearby concepts are easy to confuse;
- discussion has not already demonstrated understanding;
- the distinction is important enough to require high-confidence validation.

When understanding has already been established through discussion, validation should normally be **multiple choice only**.

## 4. Record established learning

Update the learning-outcomes revision document only after an outcome is genuinely established.

## 5. Apply to Care Calendar

Create or update repo-ready artefacts only when the substantive material they contain has already been learned and validated.

---

# 6. Validation-question rules

## Open-ended validation

Use for unresolved nuance.

Questions should:

- test a stated learning outcome;
- define any necessary conceptual layers before asking;
- use terminology consistently;
- avoid silently introducing unverified provider workflows, system capabilities, source-of-truth rules, or safety requirements;
- explicitly label hypothetical assumptions when they are part of the scenario;
- avoid asking the learner to infer information Care Calendar itself could not observe.

If the learner exposes a flaw in the scenario, correct the scenario rather than treating the answer as deficient.

## Multiple-choice validation and review

Use for:

- concepts already demonstrated through discussion;
- cumulative review;
- transfer of established concepts into a new context.

Question-writing requirements:

- distribute correct answers across A, B, C, and D;
- keep answer options at similar length and resolution;
- avoid making the correct answer the only nuanced or qualified option;
- use plausible distractors based on nearby misconceptions;
- test knowledge, not test-taking pattern recognition.

---

# 7. Cumulative reinforcement and review

Later modules should naturally build on earlier concepts.

Correct reuse of an earlier concept in a later context counts as **retention evidence**.

Example:

The foundational principle:

> Care Calendar does not invent semantic meaning from provider information.

was reinforced naturally through:

- request states;
- provenance;
- handovers;
- medicines information;
- safeguarding.

Once a concept has been correctly reused across several later contexts, reduce its explicit review frequency.

## Formal review should focus on

- concepts that have not naturally recurred;
- distinctions the learner hesitated over;
- corrections made during the module;
- terminology requiring precision;
- prerequisites for the next module;
- high-impact misconceptions.

Do not comprehensively quiz every established concept merely because it appeared earlier.

Broad free-recall questions primarily test retrieval rather than coherent conceptual understanding. During the learning programme, prefer guided scenarios, comparisons, and multiple-choice synthesis. Reserve broad free-recall practice for later interview preparation where spontaneous retrieval is itself the target skill.

---

# 8. Learning outcomes revision document

Maintain a single canonical Markdown revision document:

`care-calendar-learning-outcomes.md`

The top of the document should use progressive disclosure:

1. **Sections list**
2. **How the sections fit together**
3. detailed sections

Each detailed learning outcome should contain:

### Learning outcome

A high-resolution statement of the competence established.

### Description

A concise but sufficiently detailed explanation of what the outcome means, including important boundaries and nearby distinctions.

### Validation evidence — Care Calendar

Detailed evidence showing:

- the scenario or discussion context;
- the reasoning demonstrated;
- important distinctions made;
- any corrections;
- how the understanding applies to Care Calendar.

Do not include the full teaching material.

If a later review question is answered incorrectly, point back to the relevant outcome in this document before reteaching from scratch.

---

# 9. Applied Care Calendar artefact gate

Repo-ready product artefacts must obey a stricter rule than learning notes:

> **A Care Calendar product artefact may contain only material that has already been learned and validated, plus explicit E0/A0 product decisions made during that work.**

An artefact may contain unresolved questions or specialist dependencies.

It must **not** pre-populate future learning, claims, source conclusions, or assurance positions that the learner cannot yet explain confidently.

This rule was introduced after premature source-register and claims/assumptions artefacts were created and then removed from the repo.

## Current repo-ready foundational artefacts

- `care-calendar-intended-purpose-and-exclusions.md`
- `care-calendar-foundational-clinical-safety-model.md`
- `care-calendar-stakeholder-and-responsibility-map.md`
- `care-calendar-care-service-journey-and-handovers.md`
- `care-calendar-initial-user-discovery-plan.md`

The learning-outcomes document is revision/evidence material rather than a product artefact.

---

# 10. Evidence and assurance model

Retain the frozen plan's two-dimensional model.

## Evidence maturity

- **E0 — Unverified**
- **E1 — Source verified**
- **E2 — Demonstrated in a bounded project**
- **E3 — Independently reviewed**

## Assurance status

- **A0 — Educational simulation only**
- **A1 — Technically validated within a stated scope**
- **A2 — Specialist opinion obtained**
- **A3 — Formal organisational or regulatory assurance**
- **AX — Formal assurance unavailable or not claimable in this project**

Assign E/A pairs to the **narrowest meaningful claim, implementation result, test result, or reviewed conclusion**.

Do not assign one status to a whole artefact when different contents have different support.

For every A1 result, record:

1. criterion;
2. method;
3. result;
4. limitation.

Independent review does not imply formal compliance.

---

# 11. Source discipline

Retain the frozen plan's source rules.

When teaching or validating factual claims:

- use the primary source registered by the curriculum;
- verify current primary sources where required;
- cite the exact passage, section, clause, or heading where practical;
- separate source text from interpretation;
- do not silently fill gaps with general knowledge;
- say when the source does not settle the question;
- identify specialist judgement boundaries.

Prefer official sources such as:

- NHS England;
- NHS digital clinical-safety resources;
- DTAC materials;
- ICO;
- CQC;
- legislation.gov.uk;
- MHRA;
- NCSC;
- W3C;
- official FHIR and SNOMED CT materials;
- BSI, IEC and ISO when later curriculum reaches them.

Do not activate later source families simply for completeness.

---

# 12. Competence boundaries

The learning process may support reasoning, research, structure, implementation, and bounded technical validation.

It does not substitute for:

- Clinical Safety Officer;
- clinician;
- Data Protection Officer;
- information-governance specialist;
- lawyer;
- security assessor;
- regulatory professional;
- FHIR specialist;
- clinical terminologist;
- accessibility specialist;
- disabled-user testing;
- health or social-care practitioner review.

Whenever a conclusion depends on one of these roles:

- identify the boundary;
- mark the conclusion appropriately;
- formulate the question the specialist should answer;
- do not present the conclusion as settled.

---

# 13. Administrative proportionality

The original plan's principle remains important:

> Do not allow recordkeeping to replace learning, reasoning, or building.

The original approximate 20% administration cap should now be assessed over a **module or milestone**, not a calendar week.

Do not create claim records for every interesting fact.

The approximate 15–20 active foundational-claim ceiling remains a useful guardrail when formal claim tracking begins.

---

# 14. Time tracking

Stop treating 5–7 hours per curriculum week as a commitment.

For each module:

### At start

Record:

> **Initial working estimate**

This is planning guidance only.

### At end

Record:

- actual focused learning/discussion time;
- validation/review time;
- applied/build time;
- pure administration time;
- total;
- administration percentage.

Use actual module data to improve estimates for later modules.

Do not extrapolate the full programme duration from the foundational module alone, because Module 1 also included substantial refinement of the learning method itself.

---

# 15. Module integration review

Run the integration review at the **end of each module**, not every calendar week.

Keep the original ten questions:

1. What did I learn in this module?
2. Which product decision changed because of it?
3. Which belief became less certain?
4. Which claim is currently blocking dependent work?
5. What correction or source update is required?
6. What can I now explain without notes?
7. What remains specialist-dependent?
8. What is the next smallest useful product increment?
9. Is the validation process consuming too much time?
10. Is this work still aligned with current target roles?

Add:

11. **Which concepts were genuinely new, and which were applications or transfer examples of concepts already established?**

Keep written answers concise.

Also record:
- total time;
- pure administration time;
- administration percentage;
- whether the admin guardrail was exceeded;
- what delivery should be simplified in the next module.

---

# 16. Milestones as competence gates

The frozen plan's milestones remain useful, but interpret calendar labels such as “end of Week 2” as **competence gates**.

The first audit milestone should occur after:

> the foundational context module + the initial NHS assurance module

have both been learned, validated, and applied.

The audit should still test:

- whether sources support claims;
- whether claims are narrow enough;
- whether misconceptions are being detected;
- whether product reasoning is changing;
- whether the evidence system is proportionate;
- whether the Care Calendar project remains coherent.

Do not require a completed application at that milestone.

---

# 17. Public-claim controls

Retain the frozen public-claim restrictions throughout.

Do not claim that Care Calendar:

- meets DTAC;
- complies with DCB0129;
- is clinically safe;
- is legally compliant;
- has a legally sufficient DPIA;
- is interoperable merely because it uses FHIR;
- fulfils the Accessible Information Standard;
- is accessible without defining scope and evidence;
- is or is not a medical device without the appropriate later analysis;
- is suitable for real care;
- is clinically validated.

Public case-study language must remain proportional to evidence maturity and assurance status.

---

# 18. Updated curriculum wrapper

The original v0.3.1 curriculum remains authoritative.

The module names below are an **execution wrapper**, not a replacement curriculum.

## Module 1 — Foundations and care-service context

### Purpose

Build the foundational mental model needed to reason safely about Care Calendar and later NHS assurance material.

### Sections completed

1. Product purpose and information boundaries
2. Foundational clinical-safety mental model
3. Request states, acknowledgement and human review
4. Stakeholders and organisational responsibility
5. Care/service journey, handovers and provenance
6. Bounded edge cases
7. User-centred discovery
8. Evidence-control operating model

### Module status

**Complete.**

The foundational module integration review is recorded in:

`care-calendar-module-1-integration-review.md`

### Current applied artefacts

- intended purpose and exclusions;
- foundational clinical-safety model;
- stakeholder and responsibility map;
- care/service journey and handover map;
- initial user discovery plan.

### Important concepts established

The learner can now reason confidently about:

- provider source record vs Care Calendar coordination view;
- requests vs authoritative provider state;
- provenance and freshness;
- source event time vs Care Calendar observation time;
- chronology vs causation;
- technical delivery vs human review;
- request acknowledgement vs acceptance/action;
- supplier vs provider responsibility;
- operational actors vs technical dependencies vs assurance actors;
- technical vs organisational handovers;
- observable vs unobservable workflow states;
- stale/current/degraded information;
- failure → hazard → harm → risk → controls → residual risk;
- product-level safety requirements vs provider deployment implementation;
- decision-specific/time-specific mental capacity;
- safeguarding routing/visibility without Care Calendar making safeguarding judgements;
- user research as validation/enrichment of problem context rather than solution preference testing.
- evidence maturity as claim/proof state versus assurance as judgement/scrutiny state;
- the useful inside/outside-the-building-loop intuition for assurance independence;
- E0–E3 and A0–A3/AX applied to narrow Care Calendar claims;
- descriptive → interpretive → evaluative claim progression;
- descriptive-first public/technical writing: facts first, conclusions only when earned.

These concepts should be treated as prerequisites and naturally reused in later modules rather than repeatedly retaught.

---

# 19. Module 2 — NHS assurance and evidence landscape

This module corresponds to the next major curriculum block after the foundations, including the v0.3.1 Week 2 DTAC/DSPT material.

## Purpose

Understand how an NHS-facing product is assessed through the initial assurance landscape, especially:

- what DTAC is and is not;
- how DTAC 2.0 is structured;
- the difference between product evidence/readiness and “approval” language;
- how organisational DSPT assurance differs from product-level technical evidence;
- where evidence overlaps so Care Calendar does not duplicate assurance work unnecessarily;
- which evidence Care Calendar can genuinely produce in an educational project and which requires organisational assurance.

## Module 2 should build directly on Module 1

Reuse, rather than reteach:

- supplier vs provider responsibility;
- product vs organisational responsibility;
- technical validation vs formal assurance;
- E/A evidence maturity;
- source discipline;
- competence boundaries;
- prohibition on overclaiming;
- descriptive-first claim discipline: facts first, conclusions earn their way in.

The key new concepts should therefore be the **assurance frameworks themselves and how evidence is organised/reused**, not another generic lesson on responsibility.

## Expected learning areas

At minimum, Module 2 should cover the v0.3.1 DTAC/DSPT material, including:

- DTAC purpose and scope;
- DTAC 2.0 domain structure;
- DTAC readiness/evidence vs “DTAC approval”;
- current DTAC transition/currency requirements;
- DSPT purpose and organisational self-assessment;
- product evidence vs organisational DSPT status;
- evidence overlap/de-duplication where the official material supports it;
- first bounded Care Calendar evidence-gap mapping.

Do not pre-populate detailed conclusions before the learner has worked through the registered primary sources.

## Expected applied outputs

Only after learning and validation, likely outputs include:

- a bounded **DTAC/DSPT evidence-gap map** for Care Calendar;
- any source/claim records required by the frozen milestone;
- updated Care Calendar assumptions where the assurance material actually changes them.

Do not create those artefacts in advance.

## Primary source families

Use the current primary sources registered in v0.3.1 for:

- DTAC Form 2.0;
- official DTAC usage/guidance;
- official DTAC transition/currency announcement;
- Data Security and Protection Toolkit overview/guidance.

Verify currency at the start of Module 2.

## Module 2 handoff instruction

A new conversation starting Module 2 should be given:

1. this delivery-wrapper document;
2. the frozen v0.3.1 curriculum;
3. the latest `care-calendar-learning-outcomes.md`;
4. the current repo-ready Care Calendar artefacts;
5. the completed Module 1 integration review.

The new conversation should begin by:

- confirming Module 1 is closed;
- summarising only the prerequisite concepts relevant to Module 2;
- verifying the current DTAC/DSPT primary sources;
- presenting Module 2's learning outcomes and section outline;
- starting with teaching material before validation questions.

---

# 20. Later curriculum

Later modules should continue to preserve the **order and dependencies of v0.3.1**, but should be grouped by concept rather than forced into calendar-week boundaries.

Known later curriculum families include areas such as:

- privacy, confidentiality, lawful basis, consent/authority, and information governance;
- accessibility, inclusion, Accessible Information Standard, WCAG, and the supporting Deque strand;
- interoperability, including FHIR and SNOMED CT;
- deeper formal clinical-safety work;
- medical-device/regulatory extension where product intended purpose requires it.

Do **not** treat this high-level list as a replacement for the frozen plan's detailed sequence.

Before starting each later module:

1. inspect the corresponding v0.3.1 curriculum material;
2. identify dependencies from completed modules;
3. classify overlap as new concept / new implication / transfer example;
4. create a module outline accordingly.

---

# 21. New-conversation startup template

When beginning a subsequent module in a new conversation, use the following context:

> We are continuing the Care Calendar trustworthy-healthcare/social-care learning programme. The frozen curriculum is `trustworthy-healthcare-social-care-learning-plan-v0.3.1`; the attached delivery wrapper governs how the curriculum is now executed. Do not redesign the substantive curriculum unless execution reveals a specific problem.
>
> Use module-based delivery rather than calendar weeks. For every section: state high-resolution learning outcomes, teach from current primary sources first, discuss until the model is clear, validate only what remains uncertain, use multiple-choice for already-established understanding, update the learning-outcomes record, and create repo-ready Care Calendar artefacts only after their contents have been learned and validated.
>
> Treat correct reuse of earlier concepts as retention evidence. Do not reteach established principles merely because they appear in a new domain context.
>
> Preserve the E/A model, competence boundaries, source discipline, minimum Care Calendar journey, proportional administration, and public-claim controls.
>
> Start by locating the current module in the delivery wrapper, checking prerequisite learning in the learning-outcomes document, verifying the module's primary sources, and presenting the module overview and learning outcomes before beginning the first lesson.

---

# 22. Current handoff state

**Module 1 — Foundations and care-service context is complete.**

The next conversation should start:

> **Module 2 — NHS assurance and evidence landscape**

## Required handoff documents

Provide the new conversation with:

1. `trustworthy-healthcare-social-care-learning-plan-v0.3.1.md` — frozen substantive curriculum;
2. `care-calendar-learning-delivery-wrapper.md` — governing delivery method;
3. `care-calendar-learning-outcomes.md` — established learning and detailed validation evidence;
4. `care-calendar-module-1-integration-review.md` — module synthesis and delivery conclusions;
5. current repo-ready Care Calendar artefacts.

## Module 1 prerequisites established

Do not reteach these generically in Module 2:

- Care Calendar is a coordination view, not the provider source record.
- Provider-derived state, patient requests and workflow states remain distinct.
- Provenance, freshness and uncertainty must be represented only to the extent evidenced.
- Technical handovers do not imply organisational/human handovers.
- Supplier, provider, technical-dependency and assurance responsibilities are distinct.
- Clinical-safety reasoning connects failure, hazard, harm, risk, controls and residual risk.
- Product-level safety requirements differ from provider deployment implementation.
- Capacity is decision- and time-specific; safeguarding judgement remains outside Care Calendar.
- User research validates and enriches problem context and does not override assurance constraints.
- **Evidence maturity describes claim/proof state; assurance describes judgement/scrutiny state.**
- Independent review, technical validation, specialist opinion and formal assurance are distinct.
- Prefer descriptive claims; broader interpretive/evaluative conclusions require additional evidence.

## Module 2 startup sequence

The new conversation should:

1. confirm the attached handoff documents are available;
2. verify current DTAC 2.0 and DSPT primary sources before teaching;
3. present Module 2 purpose, learning outcomes, section outline, expected outputs and initial working time estimate;
4. identify which Module 1 concepts will be reused naturally;
5. classify each Module 2 subsection as new concept / new implication / transfer example;
6. begin with source-grounded teaching before validation.

Do not create Module 2 repo-ready assurance artefacts before their substantive contents have been learned and validated.
