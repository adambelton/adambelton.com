# Care Calendar — Initial User Discovery Plan

## Purpose

This research is intended to validate and enrich the problem context that Care Calendar's product reasoning depends on.

It is **not** intended to:
- ask users whether they like the current Care Calendar concept;
- prove that Care Calendar reduces missed appointments;
- validate clinical safety, legal compliance, or assurance requirements;
- justify simplifying provider states in ways that change their meaning.

The research should temporarily bracket the solution and focus on how patients and carers currently coordinate appointments across multiple health and care services.

---

## Primary context hypothesis

> People who coordinate appointments across multiple health and care services experience meaningful manual burden from having to consolidate fragmented appointment information and manage changes across providers and channels.

This is a product-context hypothesis, not an assurance claim.

---

## What the research should help us understand

The study should explore:

- how appointment information currently reaches patients and carers;
- which channels are involved, such as letters, phone calls, SMS, portals, apps, or verbal communication;
- whether people manually copy appointment information into another calendar or record;
- who performs that coordination work;
- how patients and carers share responsibility;
- what happens when an appointment changes;
- how people determine which information is current;
- how they know whether a provider has received or acted on a request;
- where duplication, uncertainty, or follow-up work occurs;
- what consequences follow when coordination breaks down.

Potential consequential findings, such as missed or delayed care, should be recorded if they emerge, but the study is not designed to establish prevalence or causation.

---

## Product reasoning this research informs

The research should help us decide whether the context underlying the Care Calendar direction is substantially correct.

In particular:

> Is fragmented cross-provider appointment coordination a real, recurring, and meaningful enough problem to justify continuing to build around a unified coordination view?

The research may:
- support the current context model;
- reveal missing context;
- show that the burden is different from what we assumed;
- reveal a more important adjacent problem;
- weaken the case for the current product direction.

No single binary "kill criterion" is required. The important discipline is to notice evidence that confirms, complicates, or contradicts the context model we are using.

---

## Participants

The first study should include people with direct experience of the coordination problem.

### Patients

Adults who:
- receive ongoing health and/or social care;
- interact with more than one service or provider;
- manage at least some of their own appointment coordination.

### Carers

People who:
- actively help another adult coordinate health or care appointments;
- deal with more than one service or provider;
- perform some of the practical work of tracking appointments or changes.

A mix of patients and carers is preferable because their coordination work may differ.

Provider staff are not the primary participant group for this first question. They may be useful in later research about workflow and implementation.

---

## Proposed method

### Semi-structured interviews

Initial target:

> 5–8 relevant participants.

This is exploratory qualitative research.

The purpose is to identify recurring patterns and missing context, not to estimate population prevalence.

### Interview approach

Start with recent real behaviour rather than feature preference.

Example opening prompt:

> Tell me about the last time you had to coordinate appointments with more than one health or care service. How did you keep track of everything?

Useful follow-up areas:

- Where did each appointment arrive from?
- Did you copy the information somewhere else?
- Who else needed to know about it?
- How did you handle changes?
- How did you know which information was current?
- Did you ever need to contact a provider to correct or change something?
- How did you know whether the provider had received or acted on that request?
- What parts required the most effort?
- What created uncertainty?
- What happened when something went wrong?

Avoid leading questions such as:

> Would you like one app that shows all your appointments?

That tests preference for a proposed solution rather than the underlying context.

---

## Evidence to pay attention to

### Evidence supporting the current context model

Examples may include:
- manually consolidating appointments from several channels;
- maintaining personal or carer calendars because no joined-up view exists;
- uncertainty about whether information is current;
- repeated phone calls or follow-up work;
- difficulty coordinating changes across providers;
- duplicate record-keeping between patient and carer.

### Evidence that complicates or challenges the current model

Examples may include:
- participants already have a reliable joined-up source;
- appointment tracking itself creates little burden;
- a different problem consistently dominates the coordination experience;
- the calendar model does not reflect how people naturally organise care;
- the most difficult part is not information fragmentation but another service issue.

These findings should change the context model rather than be treated as inconvenient exceptions.

---

## Relationship to assurance constraints

User research can reveal usability needs and preferences, but it does not override safety, provenance, legal, or assurance requirements.

Example:

If participants prefer a simple:

> "You need to do something" / "You don't need to do anything"

model for provider request states, that is evidence of a usability need.

Care Calendar must then ask:

> Can we make the underlying provider state easier to understand without inferring meaning that the source does not support?

Possible responses may include:
- clearer wording;
- grouping;
- progressive disclosure;
- provider-defined guidance.

Care Calendar should not manufacture a stronger semantic state merely because users prefer a simpler presentation.

---

## Privacy and ethical boundaries

Because participants may discuss health and care experiences, the study should minimise unnecessary collection of sensitive information.

The research question usually does not require:
- diagnoses;
- medication histories;
- detailed clinical histories.

Prefer questions about:
- services involved;
- channels used;
- coordination work;
- information flow;
- changes and follow-up.

Participants should understand:
- the purpose of the research;
- what will be recorded;
- how notes or recordings will be handled;
- whether quotes may be used;
- that they do not need to disclose unnecessary clinical information.

A real research exercise should use appropriate privacy and consent arrangements for the method chosen.

---

## Research record

For each interview, capture only what is necessary to support analysis.

Useful fields may include:
- participant type: patient / carer;
- number or type of services involved at a broad level;
- appointment-information channels;
- coordination methods;
- manual work identified;
- uncertainty points;
- change-management behaviour;
- consequences of coordination failures;
- observations that support, complicate, or contradict the current context model.

Avoid storing unnecessary identifiable or clinical details.

---

## Evidence and assurance status

Before research:

> **E0 / A0**

The context hypothesis is currently a reasoned product assumption.

After a bounded qualitative study:

> A narrow conclusion may reach **E2 / A0** if the problem is demonstrated among the participants studied.

That would not establish:
- prevalence across the wider NHS or social-care population;
- that Care Calendar solves the problem;
- that the interface is usable;
- that the product improves appointment attendance;
- clinical safety or organisational assurance.

---

## Likely next research question

If the context hypothesis is supported, a later study could investigate:

> Does a unified Care Calendar prototype reduce coordination burden without introducing new confusion or obscuring source, freshness, and responsibility?

That would be a separate product-validation step and should not be conflated with this initial discovery study.
