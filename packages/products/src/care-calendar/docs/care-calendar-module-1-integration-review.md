# Care Calendar — Module 1 Integration Review

## Module

**Module 1 — Foundations and care-service context**

## Status

**Complete**

## Conceptual synthesis

The foundational concepts form a connected model for understanding how Care Calendar fits into a larger health and care service.

- **Source and provenance** determine what Care Calendar knows and how confidently it knows it.
- **Handovers and responsibility** determine who must act across technical, organisational and provider boundaries.
- **Clinical-safety reasoning** considers how failures or misleading states can contribute to harm and how controls reduce risk.
- **User-centred discovery** checks whether the problem context underlying product reasoning is accurate and sufficiently complete.
- **Evidence and assurance** control what the project can legitimately claim about everything above.

A central service-design principle established during the module is that Care Calendar is not an isolated application: it is one component in a wider care-delivery service.

## Synthesis review results

### Authoritative state, requests and human review

Given a current provider appointment time and a patient request marked only as received by the provider system, the correct model is:

- show the authoritative provider appointment state;
- show the request's evidenced workflow state separately;
- do not infer human review, acceptance or action.

**Result:** understood and retained.

### Source disagreement

Where the provider source says one appointment time and the patient believes another time was communicated, Care Calendar should:

- continue presenting the provider source as authoritative;
- preserve the patient's disagreement as a request/dispute;
- avoid creating a competing appointment state.

**Result:** understood and retained.

### Narrow technical claims

A reconciliation test that detects and corrects a tested divergence supports the narrow descriptive conclusion that the tested mechanism performs that behaviour. It does not establish whole-system reliability, clinical safety or complete integration assurance.

**Result:** understood and retained.

### User research versus assurance constraints

If users prefer a simpler status model, that is evidence of a usability need. Care Calendar should explore simpler presentation without inventing meaning that provider evidence does not support.

**Result:** understood and retained.

### Specialist and technical assurance

A CSO may provide specialist assurance for a narrow hazard conclusion while automated tests technically validate a control. These results have different assurance states and neither establishes overall clinical safety or formal compliance.

**Result:** understood and retained.

## Delivery/process review

### Original schedule

The original 5–7 focused hours per curriculum week was too low for the depth of source work, discussion, validation and applied artefact creation required.

**Decision:** use module-based progress rather than calendar-week progress.

### Preferred learning method

The most effective sequence is:

1. explicit learning outcomes;
2. source-grounded teaching;
3. discussion and model refinement;
4. validation only where needed;
5. multiple-choice review for already-established understanding;
6. applied Care Calendar output;
7. update the learning-outcomes record.

### Information overlap

Later healthcare contexts often reuse established principles rather than introducing new concepts.

**Decision:** classify material before teaching it as:

- new concept;
- new implication;
- transfer example.

Do not reteach transfer examples.

### Retention and review

Correct reuse of an earlier concept in later material counts as retention evidence.

**Decision:** formal review should focus on:

- concepts that have not naturally recurred;
- concepts that caused hesitation;
- corrections;
- precise terminology;
- prerequisites for the next module.

Broad free-recall questions primarily test retrieval rather than coherent understanding and should be reserved for later interview preparation.

### Artefact gating

Repo-ready artefacts must contain only:

- material already learned and validated;
- explicit E0/A0 product decisions made during that learning;
- clearly identified unresolved questions or specialist dependencies.

Do not pre-populate future learning or assurance conclusions.

## Evidence-control conclusions

### Evidence versus assurance

Use these mental models:

- **E = claim state / proof state / how do we know?**
- **A = judgement state / scrutiny state / who or what has judged whether that proof is enough?**

A useful secondary intuition is:

- evidence is often produced **inside the building loop**;
- assurance increasingly tests the output **beyond the act of building**, through technical validation, specialist competence, or formal organisational/regulatory process.

This is an intuition, not a strict organisational rule.

### Claim style

Prefer:

> **descriptive → interpretive → evaluative**

Descriptive claims state what was built, observed, sourced or tested. Interpretive and evaluative claims contain additional conclusions and require additional evidence.

Working rule:

> **Stick to the details. Facts first; conclusions earn their way in.**

## Time and proportionality

The original Week 1/Module 1 time estimate was materially too low.

The exact historical focused-time total was not tracked accurately enough to report a defensible number retrospectively.

For future modules, record time contemporaneously by:

- learning/discussion;
- validation/review;
- applied/build work;
- pure administration.

Assess the approximate 20% administration guardrail at module or milestone level rather than by calendar week.

## Module 2 readiness

Module 1 provides the prerequisite mental model for:

**Module 2 — NHS assurance and evidence landscape**

The next module should reuse rather than reteach:

- supplier versus provider responsibility;
- product versus organisational responsibility;
- technical validation versus formal assurance;
- source/provenance discipline;
- E/A claim and assurance states;
- competence boundaries;
- descriptive-first claim discipline;
- prohibition on overclaiming.

Module 2 should introduce the assurance frameworks themselves, beginning with current DTAC 2.0 and DSPT primary sources.
