# Trustworthy Healthcare and Social-Care Product Engineering
## Auditable Learning, Validation and Portfolio Roadmap

**Owner:** Adam Belton  
**Version:** 0.3.1  
**Status:** Working-plan integrity release  
**Revision date:** 28 July 2026  
**Primary objective:** Become a senior product and frontend engineer who understands how to build trustworthy, clinically safe, inclusive and effective healthcare and social-care products—and who can go deeper into medical-device software when a product requires it.

---

# 1. Strategic objective


The learning progression remains:

```text
Healthcare and social-care context
        ↓
Trustworthy product engineering
        ↓
DTAC as an NHS-facing assurance map
        ↓
Data governance, confidentiality, authority and permissions
        ↓
Accessibility, usability and inclusive communication
        ↓
Security, resilience and interoperability
        ↓
DCB0129 clinical-risk management
        ↓
Intended purpose and the medical-device boundary
        ↓
Optional IEC 62304 specialism
```

IEC 62304 is not the organising centre. It is a later, evidence-gated specialism for roles involving regulated monitoring, diagnostics, clinical decision support, medical-device manufacturers or other software with an intended medical purpose.

The plan is designed to prevent **compound misunderstandings**. A proposition must not silently become a foundation for later work merely because it appeared in an earlier lesson.

---

# 2. Scope and competence boundaries

## 2.1 What this plan can establish

Through source study and bounded project work, the learner can establish:

- that a factual statement has been traced to an identified current source;
- that a plain-language interpretation is consistent with that source;
- that the concept has been applied coherently to a fictional scenario;
- that software behaviour and evidence satisfy explicitly stated project requirements;
- that uncertainties and specialist dependencies have been identified;
- that a named competent reviewer has reviewed a specific conclusion, where such review is available.

## 2.2 What this plan cannot establish through self-study

Self-study and a fictional portfolio project cannot independently establish:

- compliance with law;
- legal sufficiency of a lawful-basis or confidentiality conclusion;
- adequacy of a real DPIA;
- organisational DTAC readiness;
- DSPT status;
- DCB0129 or DCB0160 compliance;
- completeness of a clinical hazard analysis;
- correct clinical severity, likelihood or residual-risk acceptability;
- formal clinical safety;
- clinical validity or effectiveness;
- real-world workflow suitability;
- medical-device qualification or classification;
- IEC 62304 conformity;
- ISO 14971 or ISO 13485 conformity;
- genuine FHIR conformance without a specified implementation guide and validation;
- clinically correct terminology modelling without appropriate review;
- accessibility of an entire product or service without defined scope and sufficient user evidence.

## 2.3 Permitted portfolio framing

Permitted:

> “I applied selected principles from current NHS assurance, accessibility, privacy, security and clinical-safety sources to a bounded educational project.”

Not permitted without stronger evidence:

> “The product meets DTAC, is DCB0129 compliant, clinically safe, legally compliant, accessible, interoperable or outside medical-device regulation.”

---

# 3. Overall mental model

## 3.1 Trustworthiness model

```text
Needs, rights and lived context
        ↓
Intended product purpose and boundaries
        ↓
Care organisations, roles and responsibilities
        ↓
Information, authority and workflow
        ↓
Potential harm, exclusion, misuse and failure
        ↓
Controls implemented across product and organisation
        ↓
Evidence, review and assurance
        ↓
Deployment, training and local use
        ↓
Monitoring, incidents, correction and change
```

Trustworthiness is not a property of source code alone. It depends on the product, information, workflow, organisations, people, deployment and continuing operation.

## 3.2 Assurance landscape

| Area | Core question | Primary framework or source family | Typical accountable competence |
|---|---|---|---|
| Product purpose | What is this product intended to do and not do? | Product definition; MHRA when device scope is relevant | Product leadership; regulatory input where needed |
| Clinical safety | How could use or failure contribute to clinical harm? | DCB0129 / DCB0160 | Clinical Safety Officer and multidisciplinary team |
| Data protection | Is personal-data processing lawful, fair, necessary and accountable? | UK GDPR, DPA 2018, DUAA 2025, ICO | Controller, DPO, IG and legal |
| Confidentiality | May confidential care information be used or disclosed in this way? | Common-law duty, Caldicott principles, organisational policy | IG, Caldicott Guardian or legal |
| Authority and permissions | On whose behalf may this user act, and what may they do? | Legal/organisational authority plus product controls | Service, IG/legal and product |
| Security | Is information and service operation appropriately protected? | NCSC guidance, DSPT and organisational assurance | Security and operational leadership |
| Accessibility | Can disabled users perceive, understand and operate the product? | Equality Act context, accessibility regulations, WCAG | Product team, accessibility specialists and disabled users |
| Inclusive communication | Are communication needs identified, recorded, flagged, shared, met and reviewed? | DAPB1605 AIS | Provider organisation with product support |
| Interoperability | Is information exchanged with preserved meaning and provenance? | FHIR profiles, terminology standards and NHS APIs | Interoperability and terminology specialists |
| Provider quality | Does technology support safe, person-centred and governed care? | CQC regulations and guidance | Registered provider |
| Medical-device lifecycle | Does software with an intended medical purpose follow appropriate regulated lifecycle controls? | UK MDR, MHRA, IEC 62304 and related standards | Manufacturer, regulatory and quality specialists |

## 3.3 DTAC and DSPT

DTAC is an NHS-facing assessment structure for software-based digital health technologies. It organises evidence across clinical safety, data protection, technical security, interoperability, and usability and accessibility.

DSPT is an organisational self-assessment tool through which organisations processing health and care data measure performance against national data-security expectations.

They are not interchangeable:

- DTAC asks whether a particular digital health technology has relevant assurance evidence.
- DSPT concerns the organisation’s wider data-security and protection arrangements.
- DTAC 2.0 reduces duplication with DSPT and other assurance evidence.
- A solo project can map possible evidence but cannot complete or satisfy an organisational DSPT.

## 3.4 Supplier and provider responsibilities

Where it applies, DCB0129 concerns clinical-risk management in the manufacture of health IT. Where it applies, DCB0160 concerns deployment and use by health organisations.

A supplier can provide product hazards, controls, limitations and deployment information. The deploying organisation must assess local workflows, configuration, staff, integrations and operational controls.

This distinction is a prerequisite for all later clinical-safety work.

## 3.5 Data protection, confidentiality, authority and product permissions

These must remain separate:

1. **Article 6 lawful basis** — the legal basis for processing personal data.
2. **Article 9 condition** — the additional condition required for special-category data such as health data.
3. **Common-law confidentiality** — whether confidential information may be used or disclosed.
4. **Caldicott considerations** — principles supporting justified, necessary and proportionate use and sharing.
5. **Product permission** — what the software permits a user to do.
6. **Delegated or proxy authority** — whether someone may act for or support another person.
7. **Professional role-based access** — access granted through employment and care responsibilities.

A positive answer at one layer does not settle the others.

## 3.6 Accessibility and inclusive communication

Four related but distinct questions must be answered:

- **WCAG conformance evidence:** Does defined web content satisfy specified success criteria?
- **Usability:** Can intended users complete tasks effectively and recover from errors?
- **Inclusive service design:** Does the broader journey accommodate diverse needs and circumstances?
- **AIS fulfilment:** Does the applicable organisation identify, record, flag, share, meet and review communication needs?

A product can pass automated accessibility checks while failing users. It can also conform to WCAG within a tested scope without enabling an organisation to fulfil the Accessible Information Standard.

## 3.7 Clinical safety and medical-device status

Clinical-risk management and medical-device regulation are separate questions.

A health IT system may contribute to clinical harm without being a medical device. DCB0129 can therefore be relevant even where medical-device rules are not.

Medical-device analysis begins with the exact intended purpose, claims, users, inputs, outputs and clinical significance. The following is a discussion prompt, not a classification rule:

```text
Store or transmit
→ display
→ organise
→ apply operational flags
→ interpret against clinical criteria
→ produce clinically significant recommendations
→ diagnose, predict, monitor or influence treatment
```

## 3.8 Optional IEC 62304 depth

IEC 62304 adds controlled software-lifecycle processes for software that is itself a medical device or forms part of one. It does not replace clinical safety, data governance, accessibility, security, clinical evidence, device-level risk management or organisational quality management.

---

# 4. Authoritative source register

**Access date for this register:** 28 July 2026.  
**Currency rule:** Recheck unstable sources immediately before the dependent stage or any public claim.

## 4.1 Source hierarchy

1. Legislation and statutory instruments
2. Current NHS information standards, regulator publications and formal codes
3. Official implementation guidance
4. Normative technical standards
5. Non-normative explanatory material
6. Official training
7. Secondary commentary, used only when primary sources are insufficient

A guidance page must not be cited as though it were legislation. A non-normative W3C note must not be cited as though it creates WCAG conformance requirements.

## 4.2 Register

| ID | Source | Status | Version/date | Scope and use | Key passage | Recheck | URL |
|---|---|---|---|---|---|---|---|
| SRC-DTAC-FORM | DTAC Form 2.0 — NHS England | Official NHS assurance form | v2.0, updated 24 Feb 2026 | Current form content and five domains | Introduction and domain headings | 3 months | https://transform.england.nhs.uk/documents/219/DTAC_Form_2.0_February_2026.docx |
| SRC-DTAC-GUIDE | Using DTAC — NHS Innovation Service/NHS England | Official guidance | Live | Purpose, scope and application | Purpose and assessment guidance | 6 months | https://www.digitalregulations.innovation.nhs.uk/regulations-and-guidance-for-developers/all-developers-guidance/using-the-digital-technology-assessment-criteria-dtac/ |
| SRC-DTAC-TRANS | Updated NHS England Digital Technology Assessment Criteria (DTAC) form and guidance — NHS Innovation Service | Official NHS transition announcement | Published 4 Mar 2026 | Transition to DTAC 2.0; retirement of previous form; de-duplication with DSPT and PAQ | “What’s changed?” bullets and final transition sentence | 3 months | https://innovation.nhs.uk/news/updated-nhs-england-digital-technology-assessment-criteria-dtac-form-and-guidance/ |
| SRC-DSPT | Data Security and Protection Toolkit overview and FAQs — NHS England | Official organisational assurance guidance | Current annual service | Organisational self-assessment; relationship to project evidence | Overview and annual completion | Before each mapping | https://www.dsptoolkit.nhs.uk/Help/3 |
| SRC-DCB0129 | DCB0129 — NHS England | NHS information standard within applicable scope | Current publication; under 2026 review | Clinical-risk management in manufacture/development where applicable | Scope and “About” section | Monthly during review | https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems |
| SRC-DCB0160 | DCB0160 — NHS England | NHS information standard within applicable scope | Current publication; under 2026 review | Deployment/use where applicable | Scope and “About” section | Monthly during review | https://digital.nhs.uk/data-and-information/information-standards/information-standards-and-data-collections-including-extractions/publications-and-notifications/standards-and-collections/dcb0160-clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems |
| SRC-DCB-REVIEW | Review of DCB0129 and DCB0160 — NHS England | Official consultation | Opened 29 Jun 2026; closes 11 Sep 2026 | Current review status | Consultation dates and purpose | Monthly | https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/review-of-digital-clinical-safety-standards-dcb0129-and-dcb0160 |
| SRC-DCB-TRAIN | Digital Clinical Safety Training — NHS England | Official training information | Live | Essentials, Intermediate and Practitioner facts | Audience, access, prices and prerequisites | Before enrolment | https://digital.nhs.uk/services/clinical-safety/clinical-risk-management-training |
| SRC-CONF-CODE | Code of practice on confidential information — NHS England | Formal NHS code | Published 2 May 2025 | General handling, use and sharing of confidential health and care information | “Must, should and may” requirements | 6 months | https://digital.nhs.uk/data-and-information/looking-after-information/data-security-and-information-governance/codes-of-practice-for-handling-information-in-health-and-care/code-of-practice-on-confidential-information |
| SRC-CALDICOTT | The Caldicott Principles — National Data Guardian | Official principles | Eight principles, 8 Dec 2020 | Necessity, minimum use, need-to-know, duty to share and accountability | Principles 1–8 | Annually | https://www.gov.uk/government/publications/the-caldicott-principles |
| SRC-UKGDPR | UK GDPR and DPA 2018 overview — GOV.UK | Law overview | Live | Data-protection framework | Legislative overview | Annually | https://www.gov.uk/data-protection |
| SRC-ICO-SPECIAL | Special category data — ICO | Regulator guidance | Current | Article 6 plus Article 9 | “At a glance” and checklist | 6 months | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data/ |
| SRC-ICO-LAWFUL | A guide to lawful basis — ICO | Regulator guidance | Current at access | Article 6 selection, documentation and review | Lawful-basis checklist and documentation sections | 6 months | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/ |
| SRC-DUAA | DUAA 2025 data-protection changes and commencement — DSIT | Government implementation guidance | Royal Assent 19 Jun 2025; majority Part 5 commenced 5 Feb 2026 | Only selected project-relevant changes | Commencement and topic-specific guidance | 3 months | https://www.gov.uk/guidance/data-use-and-access-act-2025-data-protection-and-privacy-changes |
| SRC-RECORDS | Records Management Code of Practice — NHS England | Official code/guidance | Replacement published 1 Jun 2026 | Source records, retention, amendment, disposal | Relevant record lifecycle sections | Annually | https://digital.nhs.uk/data-and-information/information-governance/guidance/records-management-code-of-practice |
| SRC-MCA-ACT | Mental Capacity Act 2005 | Primary legislation | 2005, as amended | England and Wales; decision-making capacity and action for people who lack capacity | Sections 1–4 and relevant authority provisions | Before legal claims | https://www.legislation.gov.uk/ukpga/2005/9/contents |
| SRC-MCA-CODE | Mental Capacity Act Code of Practice — Ministry of Justice | Statutory code/guidance | Current published code; 2013 publication page | Practical interpretation for people acting/caring | Principles, assessing capacity, attorneys/deputies | 6 months; watch replacement | https://www.gov.uk/government/publications/mental-capacity-act-code-of-practice |
| SRC-CARE-ACT | Care Act 2014, sections 42–46 | Primary legislation | 2014, as amended | Adult safeguarding in England | Section 42 and related safeguarding provisions | Annually | https://www.legislation.gov.uk/ukpga/2014/23/part/1/crossheading/safeguarding-adults-at-risk-of-abuse-or-neglect |
| SRC-CARE-GUIDE | Care and Support Statutory Guidance, chapter 14 — DHSC | Statutory guidance | Updated 22 Jul 2025 at access | Adult safeguarding and Making Safeguarding Personal | Chapter 14 | 6 months | https://www.gov.uk/government/publications/care-act-statutory-guidance/care-and-support-statutory-guidance |
| SRC-AIS | Accessible Information Standard requirements DAPB1605 — NHS England | NHS information standard | Republished 30 Jun 2025; page updated 3 Mar 2026 | Applicable NHS/adult-social-care organisations | Identify, Record, Flag, Share, Meet, Review | 6 months | https://www.england.nhs.uk/long-read/accessible-information-standard-requirements-dapb1605/ |
| SRC-WCAG22 | Web Content Accessibility Guidelines 2.2 — W3C | **Normative W3C Recommendation** | Recommendation 5 Oct 2023; current editorial copy | Technical web-content conformance | Success criteria and conformance requirements | Annually | https://www.w3.org/TR/WCAG22/ |
| SRC-WCAG-UNDERSTAND | Understanding WCAG 2.2 — W3C WAI | **Non-normative explanatory material** | Living supporting material | Interpretation, intent and examples | Relevant success-criterion pages | Before evaluation | https://www.w3.org/WAI/WCAG22/Understanding/ |
| SRC-WCAGEM | WCAG-EM — W3C WAI | Evaluation methodology; non-normative guidance | Current methodology | Defining evaluation scope and sample | Evaluation steps and reporting | Annually | https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/ |
| SRC-APG | ARIA Authoring Practices Guide — W3C WAI | Non-normative design guidance | Living guide | Custom widget patterns only where used | Pattern-specific keyboard and semantics guidance | Before use | https://www.w3.org/WAI/ARIA/apg/ |
| SRC-EQUALITY | Equality Act 2010 | Primary legislation | 2010, as amended | Disability discrimination and reasonable-adjustment duties | Section 20 and applicable schedules | Before legal claims | https://www.legislation.gov.uk/ukpga/2010/15/contents |
| SRC-PSBAR | Public Sector Bodies Accessibility Regulations 2018 | Primary legislation | SI 2018/952, as amended | Public-sector websites/mobile apps within scope | Regulations and schedules | Before applicability claim | https://www.legislation.gov.uk/uksi/2018/952/contents |
| SRC-PSBAR-GUIDE | Public-sector accessibility requirements — GOV.UK | Official guidance | Live | Engineer-oriented interpretation and accessibility statements | Meeting requirements | Annually | https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps |
| SRC-CQC | Digital record systems principles — CQC | Regulator guidance to providers | Live | Adult social-care provider outcomes and governance | Person-centred, accurate, accessible records | 6 months | https://www.cqc.org.uk/guidance-providers/adult-social-care/digital-record-systems-adult-social-care-services/principles-support-good-outcomes-people |
| SRC-CQC-MAR | Medicines administration records in adult social care — CQC | Regulator guidance to providers | Updated 4 Nov 2025 | Accurate, secure and current medicines-administration records | Record-content and record-quality sections | Annually | https://www.cqc.org.uk/guidance-providers/adult-social-care/medicines-administration-records-adult-social-care |
| SRC-NHS-SERVICE | NHS service standard — NHS Digital Service Manual | Official service-design guidance | Live | User needs, whole service, joined-up journeys and iteration | Points 1–3 and relevant standard points | 6 months | https://service-manual.nhs.uk/standards-and-technology/service-standard |
| SRC-NHS-DESIGN | NHS design principles — NHS Digital Service Manual | Official design guidance | Live | Product discovery and design decisions | Principles, especially people and outcomes | 6 months | https://service-manual.nhs.uk/design-system/design-principles |
| SRC-NCSC | Basic risk assessment method — NCSC | Official security guidance | Live | Bounded threat/risk modelling | Scope, assets, threats, vulnerabilities and treatment | Annually | https://www.ncsc.gov.uk/collection/risk-management/a-basic-risk-assessment-and-management-method |
| SRC-FHIR-GOV | UK Core FHIR R4 governance — NHS England | Active NHS information standard | DAPB4020 Amd 33/2021 | Governance/status only | Standard status and governance scope | Before mapping | https://digital.nhs.uk/services/fhir-uk-core |
| SRC-FHIR-TECH | NHS API technologies — NHS England | Official technical guidance | Updated 24 Jun 2026 | Distinguishes FHIR R4, UK Core and NHS England implementation guides | FHIR technology descriptions | 6 months | https://digital.nhs.uk/developer/guides-and-documentation/our-api-technologies |
| SRC-FHIR-IG | Selected implementation guide/profile | Normative or implementation-specific technical source | **To be selected just in time** | Exact mapping exercise | Canonical profile and version | Every exercise | Record exact canonical URL |
| SRC-SNOMED | SNOMED CT NHS overview and official browser | Official terminology resources | NHS page updated 19 Jan 2026; browser live | Concept existence, edition and status | Concept and edition records | Every exercise | https://digital.nhs.uk/services/terminology-and-classifications/snomed-ct |
| SRC-MHRA-SAMD | Software and AI as a Medical Device — MHRA | Regulatory guidance hub | Updated 3 Feb 2025; regime changing | GB qualification, intended purpose and classification | Relevant qualification/intended-purpose guidance | Immediately before stage | https://www.gov.uk/government/publications/software-and-artificial-intelligence-ai-as-a-medical-device/software-and-artificial-intelligence-ai-as-a-medical-device |
| SRC-MHRA-FUTURE | Future regulation implementation — MHRA | Government implementation update | Updated 12 Mar 2026 | Planned GB regime changes | Implementation timetable | 3 months | https://www.gov.uk/government/publications/implementation-of-the-future-regulation-of-medical-devices/implementation-of-the-future-regulations |
| SRC-IEC62304 | IEC 62304:2006 + AMD1:2015 consolidated | Normative international standard; paid | Current published consolidated edition at access | Medical-device software lifecycle | Normative clauses | Before study | https://webstore.iec.ch/en/publication/22794 |

## 4.3 DTAC transition source resolution

`SRC-DTAC-TRANS` is now resolved.

The official NHS Innovation Service announcement states that:

- the refreshed DTAC form reduced questions and was de-duplicated with the Data Security and Protection Toolkit and Pre-Acquisition Questionnaire;
- the previous DTAC form should be retired;
- full transition to the updated form was required by **6 April 2026**.

Claim use:

- form version and five-domain content → `SRC-DTAC-FORM`;
- DTAC purpose and application → `SRC-DTAC-GUIDE`;
- retirement date and de-duplication statements → `SRC-DTAC-TRANS`.

Each claim remains narrow. The transition announcement does not by itself establish that a product has met DTAC or that all duplicated evidence has been removed.

## 4.4 DUAA bounded scope

Study only provisions that materially affect the project or a later feature:

- complaint-handling changes;
- recognised legitimate interests where relevant;
- automated decision-making only if Release 3 introduces it;
- transparency or data-subject-right changes identified in current ICO/DSIT guidance;
- changed terminology or accountability obligations directly used in the project.

For each selected provision record:

- what changed;
- what did not change;
- effective date;
- current guidance status;
- project consequence;
- specialist dependency.

All other DUAA provisions remain awareness-only or out of scope.

# 5. Learning-assurance operating model

Every material proposition follows this cycle:

```text
Locate authoritative source
→ capture exact passage
→ state proposition precisely
→ write bounded plain-language interpretation
→ test adjacent misconception
→ apply only when a real decision needs it
→ assign E/A status
→ record dependencies and public wording
→ recheck when unstable
```

## 5.1 Just-in-time operating rule

1. Register the essential source.
2. Verify only foundational claims needed for the next increment.
3. Build and test the next bounded product increment.
4. Add claims when a real product decision, dependent lesson or public statement requires them.
5. Put non-blocking questions in a backlog.
6. Archive resolved and superseded claims.

The validation system supports learning; it must not become the main project.

## 5.2 Weekly integration review — 30 minutes

Record concise answers:

1. What did I learn this week?
2. Which product decision changed because of it?
3. Which belief became less certain?
4. Which claim is blocking dependent work?
5. What correction or source update is required?
6. What can I now explain without notes?
7. What remains specialist-dependent?
8. What is the next smallest useful product increment?
9. Is validation administration consuming more than 20% of time?
10. Is this work still aligned with current target roles?

## 5.3 Material-claim trigger

Create a claim record only when the interpretation could materially affect:

- legal or regulatory understanding;
- clinical-safety reasoning;
- authority, permissions or information sharing;
- accessibility obligations or public claims;
- security or interoperability claims;
- medical-device scope;
- product requirements;
- portfolio or interview statements.

## 5.4 User-centred discovery check

For each assurance-heavy decision, ask:

> What product assumption can this documentation not validate, and which user, carer or practitioner research would test it?

At least one minimum-path exercise must turn an assurance assumption into a research question and a small review or test plan.

# 6. Evidence maturity, assurance status and working states

The plan records two independent dimensions. **Evidence maturity** describes how far a proposition or artefact has been checked. **Assurance status** describes what kind of assurance, if any, has actually been obtained.

A high evidence-maturity level does not create formal assurance. Independent review is not the final rung of compliance.

## 6.1 Evidence maturity

### E0 — Unverified

The proposition, interpretation or artefact has not yet been adequately checked.

### E1 — Source verified

Requirements:

- current authoritative source identified;
- exact section, heading, clause or page recorded;
- plain-language interpretation compared with the source;
- scope, applicability and instability recorded;
- relevant misconception test passed.

Suitable for:

- definitions;
- formal scope;
- responsibility distinctions;
- current versions;
- terminology;
- framework domains;
- required document types.

### E2 — Demonstrated in a bounded project

Requirements:

- prerequisite factual claims have reached E1;
- concept applied to a defined fictional scenario;
- artefact or behaviour is internally consistent;
- acceptance criteria and results recorded;
- limitations, project assumptions and unresolved dependencies visible.

Suitable for:

- permissions models;
- provenance;
- degraded states;
- accessibility implementation;
- threat modelling;
- traceability;
- test evidence;
- technical requirements.

### E3 — Independently reviewed

Requirements:

- a suitably competent person reviews the interpretation or application within a recorded scope;
- the reviewer role, questions, evidence and limitations are preserved;
- disagreements and changes are recorded;
- review is not represented as certification, approval or universal correctness.

E3 may apply to one workflow assumption, one candidate hazard, one accessibility journey or one terminology choice. It does not automatically apply to the surrounding product.

## 6.2 Assurance status

### A0 — Educational simulation only

The work exists to support learning. It has not obtained technical, specialist, organisational or regulatory assurance.

### A1 — Technically validated within a stated scope

Defined technical criteria have been checked using an identified test method, tool, validator or repeatable manual process.

Examples:

- a named FHIR resource passes a stated validator against an exact profile;
- a tested interaction satisfies defined acceptance tests;
- a bounded WCAG evaluation records passed and failed success criteria.

A1 does not establish clinical, legal, organisational or whole-system assurance.

### A2 — Specialist opinion obtained

A relevant specialist or practitioner has reviewed a clearly bounded question. The review is an opinion within that scope, not formal organisational acceptance.

Examples:

- a clinician reviews one candidate hazard;
- a social-care practitioner reviews one workflow assumption;
- a security engineer reviews a threat model;
- an accessibility specialist and disabled user review one journey;
- an IG professional reviews privacy questions in an educational DPIA.

### A3 — Formal organisational or regulatory assurance

An accountable organisation, regulator, statutory process or formal assurance route has accepted or approved the relevant work within its actual authority.

This status is expected to be rare or absent in a solo portfolio project.

### AX — Formal assurance unavailable or not claimable in this project

Use AX where the portfolio cannot responsibly obtain the required formal assurance.

Expected AX examples:

- organisational DTAC acceptance;
- DSPT completion;
- DCB0129 or DCB0160 compliance;
- legally sufficient DPIA;
- complete clinical safety;
- medical-device qualification or classification;
- IEC 62304 conformity;
- whole-product accessibility;
- real service suitability.

## 6.3 Examples

| Work | Evidence maturity | Assurance status | Correct interpretation |
|---|---|---|---|
| Current DTAC definition traced to official guidance | E1 | A0 | Source-verified learning only |
| Permission flow implemented and tested | E2 | A1 | Technically validated within fictional scope |
| FHIR resource passes validator against named profile | E2 | A1 | Profile validation only, not system interoperability |
| Candidate hazard reviewed by clinician | E3 | A2 | Bounded clinical opinion, not complete clinical safety |
| Threat model reviewed by security engineer | E3 | A2 | Specialist opinion, not proof the system is secure |
| DPIA exercise reviewed by IG professional | E3 | A2 or AX | Educational review; legal/organisational adequacy remains unclaimable |
| One journey tested with disabled users | E3 | A2 | User evidence for stated journey, not whole-product accessibility |
| Mock DTAC evidence map | E2 | AX | Educational mapping; no formal acceptance |
| Medical-device classification exercise | E2 or E3 | AX | Educational analysis; formal classification not claimable here |

## 6.4 Assigning E/A pairs

> Assign evidence maturity and assurance status to the narrowest meaningful proposition, implementation result, test result or reviewed conclusion. Do not assign one E/A pair to an entire artefact when its contents have different levels of support.

A single artefact may contain mixed states. An artefact inherits no higher status than the specific content being cited from it.

Examples:

### Educational DPIA exercise

- cited legal proposition: **E1/A0**;
- fictional data-flow model tested for internal consistency: **E2/A1**;
- one question reviewed by an information-governance specialist: **E3/A2**;
- overall legal adequacy of the DPIA: **AX**.

### Accessibility report

- individual WCAG test result: **E2/A1**;
- disabled-user review of one journey: **E3/A2**;
- whole-product accessibility: **AX**.

### Clinical-safety artefact

- source-derived DCB0129 proposition: **E1/A0**;
- implemented safety requirement and passing project test: **E2/A1**;
- one candidate hazard reviewed by a clinician or CSO: **E3/A2**;
- complete clinical safety or DCB0129 compliance: **AX**.

### FHIR resource

- claim about the selected profile requirement: **E1/A0**;
- resource passing a named validator: **E2/A1**;
- semantic review by a domain specialist: **E3/A2**;
- end-to-end interoperability of the product: **AX**.

## 6.5 A1 limitation rule

A1 means only that a defined technical result has been validated against an explicitly stated criterion within a stated scope.

A1 does **not** mean:

- correct in all contexts;
- legally adequate;
- clinically safe;
- semantically correct;
- usable in practice;
- organisationally assured;
- compliant with a framework.

Every A1 record must answer:

1. What exactly was tested or validated?
2. Against which requirement, profile, rule or acceptance criterion?
3. Which tool or method was used?
4. What was the result?
5. What does the result not establish?

Examples:

- Unit tests validate implementation against selected project requirements, not whether those requirements are clinically correct.
- A WCAG check validates selected criteria in the tested sample, not general usability or AIS fulfilment.
- A FHIR validator checks the named profile and version, not semantic appropriateness or system interoperability.
- Dependency scanning identifies defined known vulnerabilities, not that the system is secure.
- A state-machine test validates product behaviour, not the legal authority represented by the state.

### A1 record fields

| Criterion or profile | Tested scope | Tool or method | Result | Limitations / not established |
|---|---|---|---|---|

## 6.6 Working states

- Not started
- Source located
- Interpretation drafted
- Interpretation disputed
- Dependency blocked
- Review requested
- Superseded
- Archived

Working state is separate from the E/A pair.

## 6.7 Confidence labels

| Label | Meaning |
|---|---|
| Low | Source, applicability or interpretation remains incomplete or disputed |
| Moderate | Current source is clear and bounded project application is coherent |
| High within stated scope | Evidence and appropriate review align for the narrow stated question |
| Not claimable | Required organisational, legal, clinical or regulatory assurance is unavailable |

No confidence label overrides AX.

# 7. Claim and dependency register

## 7.1 Claim-record template

| Field | Entry |
|---|---|
| Claim ID | CLM-<AREA>-### |
| Learning claim | Exact proposition |
| Primary source ID | SRC-… |
| Relevant passage | Section, clause, page or heading |
| Plain-language interpretation | Learner explanation |
| Scope and limits | Applicable and inapplicable situations |
| Counterexample | Nearby rule or exception |
| Applied project example | Bounded product consequence |
| Validation method | Source comparison, scenario, validator or review |
| Validator/reviewer | Self, tool, practitioner or specialist |
| Evidence maturity | E0–E3 |
| Assurance status | A0–A3 or AX |
| A1 criterion/method/result/limitation | Mandatory when assurance status is A1 |
| Dependencies | Claims this relies on |
| Dependants | Claims or artefacts relying on this |
| Recheck date | Date |
| Public wording | Permitted phrasing |
| Working state | Current state |

## 7.2 Foundational claim budget

During the 12-week minimum path:

- maintain no more than **15–20 active foundational claims**;
- add a claim only when a product decision, dependent lesson or public statement requires it;
- put useful but non-blocking questions in a backlog;
- archive superseded or resolved claims;
- prioritise unstable, legal, clinical-safety and public-claim dependencies.

Source, claim, dependency and correction administration should normally consume **no more than approximately 20% of available learning time** during the minimum path.

Exceptions are permitted for:

- legal or regulatory statements;
- clinical-safety dependencies;
- unstable current guidance;
- claims intended for publication;
- corrections affecting several downstream artefacts.

### Active foundational claim definition and triage

A claim is active when:

- a current product decision depends on it;
- a later minimum-path lesson depends on it;
- it supports a public case-study statement;
- misunderstanding it would materially alter legal, safety, accessibility, security or product reasoning.

Do not count:

- Release 2 or Release 3 claims not yet activated;
- optional medical-device topics;
- background facts that do not drive a decision;
- resolved claims retained only for traceability;
- low-risk observations awaiting later exploration.

Triage each proposed claim:

1. Does a current decision depend on it?
2. Could misunderstanding it materially affect the project?
3. Will it appear in public work?
4. Is it a prerequisite for another active claim?

If every answer is no, place it in the backlog.

## 7.3 Minimum-path foundational claims

| Claim ID | Learning claim | Primary source(s) | Required E/A | Key dependants |
|---|---|---|---|---|
| CLM-DTAC-001 | DTAC 2.0 contains five assessment domains and is not a national product certificate | SRC-DTAC-FORM and SRC-DTAC-GUIDE | E1/A0 | Mock DTAC map and case-study wording |
| CLM-DTAC-002 | The official 4 March 2026 transition announcement states that the previous DTAC form should be retired, full transition should occur by 6 April 2026, and v2.0 was de-duplicated with DSPT and PAQ processes | SRC-DTAC-TRANS | E1/A0 | Source register and currency claims |
| CLM-DSPT-001 | DSPT assesses organisational data-security and protection arrangements, not a solo product repository | SRC-DSPT | E1/A0 | DTAC/DSPT mapping |
| CLM-DCB-001 | DCB0129 and DCB0160 distinguish applicable manufacture/development from applicable deployment/use responsibilities | SRC-DCB0129 and SRC-DCB0160 | E1/A0 | Candidate hazards and responsibility map |
| CLM-DP-001 | Special-category processing requires an Article 6 basis and an Article 9 condition | SRC-ICO-SPECIAL and SRC-ICO-LAWFUL | E1/A0 | Privacy exercise |
| CLM-CONF-001 | Data-protection lawfulness does not alone settle confidentiality and disclosure | SRC-CONF-CODE and SRC-CALDICOTT | E1/A0; application E3/A2 or AX | Sharing and authority workflows |
| CLM-MCA-001 | Capacity is assessed for a specific decision and time; disability or diagnosis alone does not establish incapacity | SRC-MCA-ACT and SRC-MCA-CODE | E1/A0; application specialist-dependent | Capacity and proxy scenarios |
| CLM-AUTH-001 | Being an unpaid carer does not by itself establish authority to access or act | SRC-MCA-ACT, SRC-MCA-CODE and service-specific authority source when applied | E1/A0; real application AX | Permission model |
| CLM-AIS-001 | DAPB1605 contains Identify, Record, Flag, Share, Meet and Review requirements for organisations within scope | SRC-AIS | E1/A0 | AIS matrix |
| CLM-WCAG-001 | WCAG 2.2 is the normative technical conformance source; Understanding WCAG and APG are explanatory guidance | SRC-WCAG22, SRC-WCAG-UNDERSTAND and SRC-APG where relevant | E1/A0 | Accessibility requirements |
| CLM-ACC-001 | WCAG evidence, usability, inclusive design, disabled-user testing and AIS fulfilment are distinct | SRC-WCAG22, SRC-WCAGEM, SRC-AIS, SRC-EQUALITY and SRC-PSBAR | E1/A0; journey E2/A1 or E3/A2 | Public accessibility claims |
| CLM-SAFE-001 | Adult-safeguarding duties and professional decisions cannot be reduced to a product workflow | SRC-CARE-ACT and SRC-CARE-GUIDE | E1/A0; practitioner application E3/A2 | Safeguarding scenario |
| CLM-FHIR-001 | FHIR governance, version, implementation guide, profile and validator are separate evidence objects | SRC-FHIR-GOV, SRC-FHIR-TECH and activated exact IG/profile | E1/A0; applied resource E2/A1 | Interoperability claim |
| CLM-SNOMED-001 | Browser lookup establishes concept existence/status, not clinical appropriateness | SRC-SNOMED | E1/A0; semantic use E3/A2 | Terminology example |
| CLM-MHRA-001 | Medical-device analysis depends on current intended purpose, claims, users, inputs, outputs and current MHRA guidance | SRC-MHRA-SAMD and SRC-MHRA-FUTURE | E1/A0; classification AX | Release 3 |
| CLM-UCD-001 | Assurance documentation cannot replace research into user needs and end-to-end service journeys | SRC-NHS-SERVICE and SRC-NHS-DESIGN | E1/A0; project research E2/A0 or E3/A2 | Product discovery and case study |

## 7.4 Dependency graph

```text
Data protection basis
    → confidentiality
        → authority/proxy rules
            → product permission model
                → public permission claims

Mental-capacity principles
    → no global capacity boolean
        → authority evidence model
            → correction and delegation journeys

DTAC form + guidance + transition announcement
    → current DTAC claims
        → DTAC/DSPT evidence-gap map

DCB applicability distinction
    → candidate hazard analysis
        → safety requirements
            → traceability
                → Release 2 public wording

WCAG 2.2 + evaluation method + AIS
    → accessibility requirements
        → bounded evaluation
            → disabled-user/specialist review
                → scoped public claim

FHIR governance
    → exact IG/profile
        → validator
            → bounded validation result
                → no system-level interoperability claim

Current MHRA regime
    → intended-purpose analysis
        → unresolved/potential device-scope label
            → optional IEC 62304 study
```

## 7.5 Blocking rule

> A stage may continue experimentally, but no dependent claim may be treated as established or used publicly as fact until its prerequisite evidence-maturity gate is passed. Formal assurance remains AX unless it has actually been obtained through the appropriate accountable route.

Examples:

- Build a permissions prototype while authority rules remain unresolved, but label it E2/A0.
- Draft candidate hazards before clinical review, but do not score or present completeness as established.
- Explore FHIR-shaped resources before validation, but call them conceptual mappings.
- Compare medical-device scenarios, but use “potentially within scope”, “unresolved” or “regulatory advice required”.

# 8. Misconception-testing method

Every stage uses the same seven-part test:

1. **Closed-book concept map**
2. **Teach-back explanation**
3. **Normal scenario**
4. **Counterexample**
5. **Deliberately misleading case**
6. **Source comparison and correction**
7. **Spaced recheck after approximately 14 days**

A cumulative check is required before entering a dependent stage.

## 8.1 Correction log rule

When an answer is wrong:

- record the original belief;
- record why it was wrong;
- cite the correcting source;
- identify dependent artefacts;
- mark them for review;
- repeat the question after 14 days.

## 8.2 Core misconception bank

### DTAC

**Question:** A supplier has completed a DTAC form. Is the product now “DTAC approved”?  
**Answer:** No. DTAC is an assessment structure and evidence set, not a universal product certification. Adoption decisions and local assurance remain with relevant organisations.  
**Sources:** SRC-DTAC-FORM, SRC-DTAC-GUIDE and SRC-DTAC-TRANS.

**Misleading case:** A procurement page says “must meet DTAC”. This still does not create a national certificate called “DTAC approval”.

### DSPT

**Question:** Can a product repository demonstrate that the supplier has completed DSPT?  
**Answer:** No. DSPT concerns organisational measures and a published organisational self-assessment. Project evidence may contribute to relevant outcomes but cannot substitute for organisational assurance.  
**Sources:** SRC-DSPT.

### DCB0129 and DCB0160

**Question:** The supplier produced a product hazard log. Has the deploying NHS organisation therefore completed its clinical-safety responsibilities?  
**Answer:** No. Deployment introduces local workflow, configuration, users, integrations and controls assessed under the deploying organisation’s responsibilities.  
**Sources:** SRC-DCB0129 and SRC-DCB0160.

### Data protection and confidentiality

**Question:** The organisation has an Article 6 lawful basis. May it therefore share confidential health information with any product user who has permission?  
**Answer:** No. Special-category processing requires an Article 9 condition, and confidentiality, authority, necessity and role access remain separate questions.  
**Sources:** SRC-ICO-SPECIAL, SRC-CONF-CODE and SRC-CALDICOTT.

**Misleading case:** A checkbox labelled “I consent” may be a product instruction or sharing preference without being the organisation’s legal basis for all processing.

### Proxy access and professional access

**Question:** A carer and a clinician both need access. Can they use the same role because both are helping the person?  
**Answer:** No. Their authority, purpose, duties, scope, duration and accountability differ.  
**Validation:** Source-verified distinction plus specialist review for any real authority model.

### Accessibility and AIS

**Question:** The interface meets WCAG AA in an audit. Does that establish AIS fulfilment?  
**Answer:** No. AIS includes organisational identification, recording, flagging, sharing, meeting and review of needs. WCAG evidence concerns defined digital content and interactions.  
**Sources:** SRC-AIS, SRC-WCAG22, SRC-WCAGEM and SRC-PSBAR-GUIDE.

### Missing versus normal

**Question:** No concern data was received, so may the product show “normal”?  
**Answer:** No unless the system has evidence that a valid normal result was recorded. Absence, delay, failure and normality are distinct states.  
**Validation:** Product requirement and tests; clinical implications require review.

### Acknowledgement, ownership and resolution

**Question:** A professional clicked “acknowledge”. Can the concern leave the unresolved queue?  
**Answer:** Not unless the defined workflow makes acknowledgement equivalent to accepted ownership and this is safe. The project should model receipt, ownership, action and resolution separately.

### Intended purpose

**Question:** A product interprets observations against clinical thresholds but its marketing calls the feature “administrative prioritisation”. Is it necessarily outside medical-device scope?  
**Answer:** No. The truthful functionality, intended purpose, output and clinical use matter; wording cannot safely replace regulatory analysis.  
**Sources:** SRC-MHRA-SAMD and SRC-MHRA-FUTURE.

### FHIR

**Question:** JSON uses `resourceType: "Patient"`. Is it FHIR conformant?  
**Answer:** Not on that fact alone. Record the FHIR version, implementation guide/profile, terminology and validator results.  
**Sources:** SRC-FHIR-GOV, SRC-FHIR-TECH and the activated exact implementation guide/profile.

### Clinical-safety artefacts

**Question:** A detailed hazard log proves the project is DCB0129 compliant.  
**Answer:** No. Completeness, clinical scoring, governance, CSO accountability, lifecycle evidence and organisational process remain absent.  
**Sources:** SRC-DCB0129 and SRC-DCB-TRAIN.

---

# 8A. Pre-execution source activation

Do not complete the full source register before starting. Activate and recheck sources immediately before the stage in which a product decision or learning claim depends on them.

## Week 1–2 active source subset

| Source ID | Status/current use | Selected reading | Claims depending on it | Recheck |
|---|---|---|---|---|
| SRC-CQC | Current CQC provider guidance | Person-centred, accurate, accessible record principles | Provider/supplier boundary and record-quality assumptions | Before Week 1, then 6 months |
| SRC-CQC-MAR | CQC provider guidance updated 4 Nov 2025 | Record accuracy, security and currency only | Medicines-record scenario; no medicines-management curriculum | Before Week 1, then annually |
| SRC-RECORDS | NHS England Records Management Code replacement published 1 Jun 2026 | Source record, derived view, amendment and retention concepts used by the journey | Source/derived-view and correction assumptions | Before Week 1, then annually |
| SRC-NHS-SERVICE | Official NHS service-design guidance | User needs, whole-service perspective and iteration | CLM-UCD-001 and service map | Before Week 1, then 6 months |
| SRC-NHS-DESIGN | Official NHS design principles | Start with people, design for outcomes and inclusion | CLM-UCD-001 and first research question | Before Week 1, then 6 months |
| SRC-DTAC-FORM | Current DTAC 2.0 form | Introduction and five domain headings only | CLM-DTAC-001 | Before Week 2, then 3 months |
| SRC-DTAC-GUIDE | Official DTAC purpose/application guidance | Purpose, scope and assessment use | CLM-DTAC-001 | Before Week 2, then 6 months |
| SRC-DTAC-TRANS | Official transition announcement published 4 Mar 2026 | De-duplication bullet and 6 Apr 2026 transition sentence | CLM-DTAC-002 | Before Week 2, then 3 months |
| SRC-DSPT | Current organisational toolkit overview | Definition, organisational self-assessment and annual cycle | CLM-DSPT-001 | Before Week 2 and before any later mapping |

The Mental Capacity Act, safeguarding, privacy, AIS, WCAG, DCB, FHIR, SNOMED and MHRA sources are not activated in Weeks 1–2. Recheck them just before their dependent stage.

> Recheck and activate a source immediately before the stage in which a product decision or learning claim depends on it.

# 9. Revised learning paths

## 9.1 Standard minimum path — 12 weeks

**Commitment:** 5–7 focused hours per week  
**Headline total:** **66–78 hours**  
**Accelerated option:** 10 weeks only when capacity is consistently above 7 hours and the same outputs remain achievable.

The headline total matches the weekly schedule below: the minimum weekly estimates sum to 66 hours and the maximum estimates sum to 78 hours.

**Product scope:**

> A person and authorised carer review an upcoming home-care visit, see which organisation owns the next action, inspect the source and freshness of the information, update a communication need, and request correction of inaccurate information.

Release 1 must not broaden beyond this journey.

### Weekly schedule

The table separates learning, building and the combined validation/administration block. The combined block includes technical validation as well as record maintenance; pure administration is tracked separately and is expected to use only **9–11 hours** of the total.

| Week | Learning | Building | Validation/admin | Integration review | Total range |
|---|---:|---:|---:|---:|---:|
| 1 | 2–2.5 | 2–2.5 | 1.5 | 0.5 | 6–7 |
| 2 | 2–2.5 | 2–2.5 | 0.5 | 0.5 | 5–6 |
| 3 | 2.5–3 | 1.5–2 | 1.5 | 0.5 | 6–7 |
| 4 | 2–2.5 | 2–2.5 | 1.5 | 0.5 | 6–7 |
| 5 | 2.5–3 | 1.5–2 | 1.5 | 0.5 | 6–7 |
| 6 | 1–1.5 | 3.5–4 | 1 | 0.5 | 6–7 |
| 7 | 0.5–1 | 2.5–3 | 2.5 | 0.5 | 6–7 |
| 8 | 1.5–2 | 2–2.5 | 1 | 0.5 | 5–6 |
| 9 | 1.5–2 | 2–2.5 | 1 | 0.5 | 5–6 |
| 10 | 1.5–2 | 1.5–2 | 1.5 | 0.5 | 5–6 |
| 11 | 1–1.5 | 2–2.5 | 1.5 | 0.5 | 5–6 |
| 12 | 1–1.5 | 2–2.5 | 1.5 | 0.5 | 5–6 |
| **Total** | **19–25** | **24.5–30.5** | **16.5** | **6** | **66–78** |

Arithmetic:

- minimum: **66 hours**;
- maximum: **78 hours**;
- average: **5.5–6.5 hours per week**;
- weekly integration reviews: **6 hours**, already included;
- pure source/claim/dependency/correction/public-claim administration: **9–11 hours**, or approximately **13.6%–14.1%** of the total;
- build and applied learning, including source interpretation, misconception testing, technical validation and substantive feedback: **57–67 hours**, or approximately **85.9%–86.4%**.

The headline total therefore exactly matches the weekly ranges.

### Administrative cap

Validation administration means:

- source-register maintenance;
- claim-register maintenance;
- dependency updates;
- correction-log maintenance;
- public-claim logging;
- identifier maintenance;
- audit paperwork that does not itself deepen understanding or validate an applied result.

It does **not** include:

- reading and interpreting a primary source;
- misconception testing;
- applying a concept to the product;
- running technical validation;
- receiving substantive specialist feedback;
- correcting implementation after new understanding.

At each weekly integration review, record:

| Total hours | Administration hours | Administration % | Cap exceeded? | Reason | Simplification next week |
|---:|---:|---:|---|---|---|

Temporary exceptions are permitted for foundational legal/regulatory claims, major corrections, source replacement and pre-publication review. If administration repeatedly exceeds 20%, postpone or remove lower-value recordkeeping before reducing building or applied learning.

### Minimum artefacts

1. Intended purpose and boundaries
2. Stakeholder, service and responsibility map
3. Source register and 15–20 active foundational claims
4. Scoped identity, authority and permissions model
5. AIS requirement matrix and bounded WCAG evaluation
6. One cross-domain candidate-hazard-to-requirement-to-test chain
7. Compact DTAC/DSPT evidence-gap map
8. Evidence/correction and public-claim logs
9. Concise case study

## 9.2 Recommended path — Release 2 and stronger validation

**Additional duration:** 8–12 weeks  
**Additional effort:** 60–90 hours

Adds:

- educational DPIA;
- fuller threat model;
- broader resilience analysis;
- selected FHIR mapping using an exact profile and validator;
- Intermediate Digital Clinical Safety training at the start of Release 2;
- concern/review/ownership/handover workflow;
- DCB0129-style educational artefacts;
- incident and corrective change;
- practitioner, lived-experience or specialist review where available;
- focused clinical-safety article.

Intermediate training is **not required for completion of the narrow Release 1 minimum path**.

## 9.3 Extended medical-device specialism

Proceed only after the evidence gate shows relevance to target roles or project direction.

Adds:

- current-regime MHRA checkpoint;
- intended-purpose comparison;
- regulatory-professional review where available;
- optional BSI course;
- Release 3 experimental branch;
- lawfully accessed IEC 62304 clause study;
- related ISO/IEC context;
- medical-device comparison article;
- TÜV SÜD decision.

Applications continue throughout all paths.

# 10. Revised learning stages

## Stage 1 — Healthcare and social-care context

### Material claims

- Software suppliers and regulated care providers have different responsibilities.
- Care coordination crosses organisational, professional and legal boundaries.
- CQC guidance is directed to provider practice, while products may support or obstruct that practice.
- Records must preserve accountability, accuracy, source and continuity.

### Sources

SRC-CQC, SRC-CQC-MAR and SRC-RECORDS.

### Activities

- Create stakeholder and responsibility map.
- Create one care journey showing handovers and source records.
- Distinguish source record, derived view and user-entered coordination information.
- Test safeguarding, capacity, medicines and outage scenarios without implementing all of them.
- Record each workflow assumption.

### Social-care scenario tests

1. A care worker records that medication was offered but not taken. What must a coordination view preserve from the source record?
2. A carer disputes a care-plan summary. Should the original provider record be deleted from the coordination layer?
3. A person may lack capacity for one decision but not another. Why is a single global “lacks capacity” flag unsafe?
4. An integration outage prevents new visit notes arriving. What may the product say, and what must it not imply?
5. Safeguarding information is highly sensitive but may need urgent sharing. Which issues require organisational and specialist judgement?

### Validation

- E1 for provider/supplier distinctions.
- E2 for bounded product support and failure states.
- E3 practitioner review before describing workflow assumptions as credible beyond the fictional scenario.


## Stage 1A — User-centred NHS service design

Use SRC-NHS-SERVICE and SRC-NHS-DESIGN to keep product discovery central.

Exercise:

> Identify one product assumption that assurance documentation cannot validate, then define the person, carer or practitioner research needed to test it.

Output:

- assumption;
- why assurance evidence cannot answer it;
- target participants;
- research method;
- ethical/privacy constraints;
- decision threshold;
- current E/A status.

## Stage 2 — DTAC and DSPT

### Material claims

- DTAC 2.0 is the current form and replaced the previous form by 6 April 2026.
- DTAC has five core domains.
- DTAC is not a national approval certificate.
- DSPT is an organisational self-assessment and contractual assurance mechanism for relevant organisations.
- Project evidence can map to DTAC or DSPT concerns without satisfying the organisational process.

### Activities

Create a mapping table:

| DTAC question/domain | Related DSPT concern | Project evidence | Missing organisational evidence | Accountable role | Evidence maturity and assurance status |
|---|---|---|---|---|---|

Do not attempt a fictional full DSPT submission.

### Validation

- E1 source mapping.
- Misleading procurement scenario test.
- Recheck DTAC every three months.
- Recheck DSPT cycle before public use.

## Stage 3 — Data governance, confidentiality, authority and permissions

### Material claims

- Health data is special-category data.
- Article 6 and Article 9 are separate requirements.
- DUAA 2025 amended, rather than replaced, the UK GDPR and DPA 2018.
- Confidentiality remains a separate legal and ethical layer.
- Caldicott principles support justified, necessary and proportionate use and sharing.
- Product permissions do not establish lawful basis, confidentiality authority or capacity.
- Source records, amendments, disputes and derived views need different handling.

### Source-verified exercise

For one sharing scenario, complete:

| Layer | Question | Source | Educational conclusion | Specialist question |
|---|---|---|---|---|
| Article 6 | What lawful basis might the controller consider? | SRC-ICO-LAWFUL | Hypothesis only | DPO/legal confirmation |
| Article 9 | Which condition may be relevant? | SRC-ICO-SPECIAL | Hypothesis only | DPO/legal confirmation |
| Confidentiality | Is use/disclosure consistent with confidence? | SRC-CONF-CODE and SRC-CALDICOTT | Unresolved | IG/Caldicott/legal |
| Caldicott | Is use justified, necessary and proportionate? | SRC-CALDICOTT | Questions identified | Caldicott/IG |
| Product permission | What action does the UI permit? | Product requirement | Demonstrable | Product and security review |
| Proxy authority | On whose behalf may the carer act? | Service-specific authority source required | Unresolved | Service/legal/IG |
| Professional access | What does the staff role require? | Organisational policy required | Fictional role model | Provider/IG/security |

### Records and correction exercise

Model:

- original source record;
- derived coordination view;
- person/carer correction request;
- provider amendment;
- disputed information;
- replacement or superseding information;
- audit and downstream propagation.

Do not assume deletion is the correct response to inaccuracy.

### Validation

- E1 for legal distinctions.
- E2 for product-state model.
- E3 required for legal conclusions or DPIA adequacy.


### Mental capacity and authority controls

Use SRC-MCA-ACT and SRC-MCA-CODE.

Learning boundaries:

- capacity is assessed for a particular decision at the relevant time;
- a person must not be treated as unable to decide merely because of disability, diagnosis, appearance or an unwise decision;
- a product cannot determine legal capacity;
- an unpaid carer does not automatically have authority;
- authority source, scope and evidence must be represented separately from product role.

Scenario output:

- no global `lacksCapacity` boolean;
- decision/context-specific capacity status only where supplied by an authoritative process;
- authority source, date, scope and reviewer;
- explicit legal/safeguarding escalation points.

Expected status: source distinctions E1/A0; product model E2/A0 or A1; real authority conclusion AX.

### Bounded adult-safeguarding awareness

Use SRC-CARE-ACT and SRC-CARE-GUIDE.

Focus only on:

- recognising that workflows may surface a safeguarding concern;
- recording without silently resolving;
- access control and audit;
- visible escalation state;
- preserving source and chronology;
- handing responsibility to competent people and local policy.

The project does not validate safeguarding policy or professional judgement. Workflow assumptions require practitioner review for E3/A2.

## Stage 4 — Accessibility, usability, equality and AIS

### Material claims

- WCAG 2.2 is the normative technical source used for conformance claims; Understanding WCAG 2.2, WCAG-EM and APG serve different explanatory/evaluation roles.
- Public-sector accessibility regulations apply in defined scope and require accessible websites/apps and an accessibility statement.
- Equality Act duties and reasonable adjustments form a broader legal context.
- WCAG evidence, usability, inclusive design and AIS fulfilment are related but distinct.
- DAPB1605 applies to relevant organisations and contains six connected requirement areas.
- Organisational processes are required to meet needs; a product alone cannot prove fulfilment.

### AIS requirement-by-requirement validation matrix

Create one row for each official DAPB1605 requirement or subrequirement used by the project:

| Official requirement reference | Exact source passage | Project interpretation | Product requirement | Implementation | Verification | Organisational dependency | Status |
|---|---|---|---|---|---|---|---|

Minimum project coverage:

- Identify
- Record
- Flag
- Share
- Meet
- Review
- Separate person and carer needs
- Source and confirmation status
- Update and review behaviour
- Sharing limitation and audit

### Source use

- Use SRC-WCAG22 for success criteria and conformance requirements.
- Use SRC-WCAG-UNDERSTAND for non-normative interpretation.
- Use SRC-WCAGEM to define evaluation scope and reporting where appropriate.
- Use SRC-APG only for relevant custom-widget patterns; it does not replace WCAG.
- Use SRC-EQUALITY and SRC-PSBAR for bounded legal context; seek legal advice for applicability.

### Layered accessibility evidence

1. Automated checks
2. Keyboard testing
3. Screen-reader testing
4. Zoom, reflow and contrast checks
5. Cognitive-load and error-state review
6. Relevant disabled-user testing where feasible
7. Specialist review where appropriate

Every report records:

- tested scope;
- assistive technologies and versions;
- requirements;
- methods;
- results;
- defects;
- user feedback;
- limitations;
- unresolved risks;
- evidence maturity and assurance status.

### Validation

- E1 for legal and standard distinctions.
- E2 for tested project behaviour.
- E3 for broad usability/accessibility claims involving users or specialist judgement.
- Never describe the whole product as “accessible” without defining scope and evidence.

## Stage 5 — Security, resilience and interoperability

### Material claims

- Security evidence spans organisation, product, development and operation.
- Secure product design cannot by itself establish organisational DSPT status.
- Missing, delayed, stale, duplicated and conflicting data are distinct.
- Provenance is necessary to interpret combined information safely.
- FHIR conformance requires an exact version, implementation guide/profile and validation.
- SNOMED semantic correctness requires more than plausible labels.

### Threat-model sufficiency

Complete when it identifies:

- scope and assets;
- actors;
- trust boundaries;
- misuse cases;
- threats and vulnerabilities;
- controls;
- residual risks;
- verification;
- ownership;
- specialist questions.

### FHIR application protocol

Before applied mapping:

1. Record exact FHIR base version.
2. Select current UK/NHS implementation guide and profile.
3. Preserve canonical URL and version.
4. Map only a small number of fields.
5. Run an official or recognised validator.
6. Store validator output.
7. Separate syntax/profile validation from workflow and semantic correctness.
8. Obtain interoperability review before strong claims.

Permitted wording:

> “This resource passed the named validator against profile X, version Y, on date Z.”

Not permitted:

> “The system is interoperable.”

### SNOMED protocol

- Use an official browser or terminology service.
- Record edition and release date.
- Record concept identifier and term.
- Avoid creating clinically meaningful mappings without terminology or clinical review.
- Mark examples as illustrative until reviewed.

## Stage 6 — DCB0129 clinical-risk management

### Current status checkpoint

Before beginning:

- recheck SRC-DCB0129, SRC-DCB0160, SRC-DCB-REVIEW and SRC-DCB-TRAIN;
- record whether revised standards have replaced the current versions;
- record training access, provider-stated format, price and prerequisites;
- remove inherited duration estimates not explicitly published by the provider.

### Current training facts at 28 July 2026

- Essentials is the introductory pathway.
- Intermediate builds on Essentials and covers activities and documents in a care scenario.
- The official page states non-NHS access to the e-learning costs **£50 plus VAT**.
- Practitioner training follows Intermediate and is designed for direct clinical-safety roles or those supporting them.
- Practitioner training does not independently make the learner a qualified or appointed CSO.

### Clinical-safety evidence sequence

1. Complete official training assessment.
2. Map key concepts to current DCB sources.
3. Create an **educational candidate-hazard log**.
4. Create one traceability chain.
5. Seek clinician or CSO review of selected examples where obtainable.
6. Preserve reviewer disagreements and unresolved assumptions.

### Clinical-assumption register

| ID | Assumption | Source/evidence | Potential safety impact | Required reviewer | Status | Dependants |
|---|---|---|---|---|---|---|

Use **candidate hazard** until clinically reviewed.

Producing a hazard log does not demonstrate:

- completeness;
- correct severity or likelihood;
- acceptable residual risk;
- DCB0129 compliance;
- release suitability.

## Stage 7 — Intended purpose and medical-device boundary

### Mandatory current-regime checkpoint

Immediately before this stage:

- recheck MHRA qualification and software guidance;
- recheck future-regime implementation updates;
- record the current Great Britain regulatory position;
- record changes under consultation or planned implementation;
- archive the exact source versions used.

### Classification-exercise record

| Field | Required content |
|---|---|
| Exact intended purpose | Full bounded statement |
| Claims | Public and product claims |
| Users | Intended users |
| Inputs | Data supplied |
| Outputs | Information or action produced |
| Clinical significance | How output may affect care |
| Professional judgement | Role and limits |
| MHRA source and passage | Current guidance |
| Analysis label | Likely outside scope / potentially within scope / unresolved |
| Uncertainty | What is not known |
| Advice trigger | Point requiring regulatory professional |
| Review status | Unreviewed / reviewed |

Never turn the store–display–interpret spectrum into a classification algorithm.

No definitive “not a medical device” statement is permitted without competent external review.

## Stage 8 — Optional IEC 62304

### Entry gates

- Stage 7 current-regime checkpoint completed.
- Medical-device relevance demonstrated by target roles or project direction.
- Lawful access to current IEC 62304 edition and amendments.
- Time/cost decision passed.

### Study protocol

For each studied requirement record:

- clause;
- normative text summary;
- explanatory guidance source;
- applicability;
- project artefact;
- verification evidence;
- uncertainty;
- reviewer.

Secondary summaries may orient the learner but cannot support strong claims about the standard.

Review by someone with practical regulated-software or quality experience is required before publishing strong lifecycle interpretations.

---

# 11. Revised portfolio releases

## Release 1 — Trustworthy coordination

### Product purpose

Help a person and authorised carer understand an upcoming home-care visit, source and freshness of information, ownership of the next action, a communication need and correction of inaccurate information.

### Core journey

1. Person or carer signs in under a clearly displayed role.
2. Upcoming visit shows organisation, named/role owner, source and timestamps.
3. User inspects whether information is current, delayed, disputed or incomplete.
4. User updates a communication need within their permitted scope.
5. User requests correction of inaccurate information.
6. Product preserves original/source distinction and pending status.
7. User can inspect relevant access/change history.

### Release 1 evidence

- intended purpose and exclusions;
- source and claim register;
- stakeholder and responsibility map;
- authority and permission hypothesis;
- AIS matrix;
- accessibility evidence;
- provenance and correction model;
- compact security and degraded-state assessment;
- one cross-domain candidate hazard chain;
- public-claim review.

### Release 1 does not require

- full organisational DPIA;
- complete threat model;
- production authentication;
- broad FHIR integration;
- formal clinical-safety file;
- every health/social-care workflow;
- every specialist review.

## Release 2 — Clinically consequential workflow

Adds concern submission, professional review, acknowledgement, ownership, handover, escalation route, unresolved state and incident handling.

All hazards remain **candidate hazards** unless reviewed.

Required distinctions:

- received;
- acknowledged;
- owned;
- actioned;
- resolved;
- closed.

Candidate scenarios:

- stale record appears current;
- absence appears normal;
- filtered records disappear;
- acknowledgement lacks ownership;
- inaccessible escalation information;
- ambiguous unit;
- delayed integration;
- conflicting source records;
- alert disappears before acknowledgement;
- communication need does not reach reviewer.

## Optional Release 3 — Medical-device comparison branch

A bounded rules feature interprets observations against fictional clinical criteria and prioritises professional review.

Purpose is to examine changed intended purpose and lifecycle consequences, not algorithm sophistication.

Required labels:

- **Potentially within medical-device scope**
- **Educational analysis**
- **Regulatory advice required**
- **No clinical validity claimed**

---

# 12. Product and workflow validation plan

## 12.1 Assumption register

Every major workflow assumption records:

- assumption;
- why it matters;
- evidence source;
- participant/reviewer evidence;
- conflicting evidence;
- decision;
- confidence;
- evidence maturity and assurance status;
- fictional limitations;
- downstream dependencies.

## 12.2 Review participants

Seek, where feasible:

- people with experience coordinating complex care;
- unpaid carers;
- at least one healthcare professional;
- at least one social-care practitioner or service manager;
- disabled users relevant to tested journeys;
- accessibility specialist;
- other specialists for bounded questions.

Do not use real patient information.

## 12.3 Review distinction

- **Lived-experience review:** Does the journey reflect this participant’s experience and needs?
- **Practitioner workflow review:** Is the assumed workflow plausible in the reviewer’s context?
- **Accessibility user test:** Can this participant complete the defined task and what barriers occur?
- **Clinical review:** Are selected assumptions/hazards clinically plausible?
- **Clinical validation:** Not performed.
- **Regulatory validation:** Not performed unless explicitly reviewed by a competent professional, and even then not an authority decision.

## 12.4 Review protocol

For each review:

- define the artefact and question;
- state what is not being certified;
- provide scenario and assumptions;
- record reviewer role and relevant experience;
- record comments verbatim or accurately;
- record disagreement;
- decide whether to change, retain or mark unresolved;
- update dependencies and public claims.

Unavailable review is recorded as:

> “Specialist review required but not obtained; conclusion remains E1 or E2 educational work.”

---

# 13. Specialist-review matrix

| Area | Appropriate reviewer | Review question | Not being asked to certify |
|---|---|---|---|
| Care workflow | Health or social-care practitioner | Is this bounded workflow plausible and where is it wrong? | General suitability or safety |
| Carer experience | Unpaid carer or lived-experience reviewer | Does the journey represent agency, burden and permission concerns? | Clinical correctness |
| Privacy | DPO, IG or privacy specialist | Are the identified data risks and questions reasonable? | Legal compliance or DPIA approval |
| Confidentiality | IG, Caldicott or legal specialist | What confidentiality duties and authorities apply? | Universal legal answer |
| Accessibility | Accessibility specialist and disabled users | What barriers exist in the tested scope? | Whole-product conformance |
| Security | Security engineer or assurance specialist | Are trust boundaries, threats and controls credible? | Pen-test or organisational assurance |
| DCB0129 | CSO or experienced clinical-safety practitioner | Are selected candidate hazards and controls plausible? | Compliance, completeness or release |
| FHIR | NHS interoperability engineer or FHIR specialist | Is the stated profile/version used correctly? | End-to-end interoperability |
| SNOMED CT | Terminologist or clinician | Is the selected concept semantically appropriate? | General clinical validity |
| Medical-device boundary | Regulatory professional | Is the intended-purpose analysis reasonable under current regime? | Formal regulator determination |
| IEC 62304 | Regulated-software or quality professional | Are clause interpretations and artefact links credible? | Certification or conformity |

## 13.1 Disagreement handling

When reviewers disagree:

- preserve each view;
- identify differences in context, assumptions or competence;
- do not average incompatible conclusions;
- seek a more authoritative source or additional reviewer;
- mark the claim disputed;
- block dependent public statements until resolved or caveated.

---

# 14. Artefact sufficiency criteria

## 14.1 Intended purpose complete when it states

- users;
- population/context;
- problem supported;
- functions;
- inputs and outputs;
- expected use;
- exclusions;
- external responsibilities;
- claims not being made;
- unresolved scope questions.

## 14.2 DPIA educational exercise complete when it identifies

- purpose;
- data categories;
- people affected;
- data flows;
- necessity and proportionality;
- risks;
- mitigations;
- unresolved legal/IG questions;
- residual uncertainty;
- specialist decisions;
- source versions.

It is never labelled legally sufficient without E3 review and organisational ownership.

## 14.3 Threat model complete when it identifies

- scope;
- assets;
- trust boundaries;
- actors;
- misuse cases;
- threats and vulnerabilities;
- controls;
- residual risks;
- verification;
- ownership;
- specialist questions.

## 14.4 Accessibility evidence complete when it records

- tested scope;
- requirements and standard version;
- tools/assistive technologies and versions;
- automated, keyboard, screen-reader, zoom/reflow, contrast and cognitive methods;
- results;
- defects;
- fixes and retests;
- user feedback;
- limitations;
- unresolved risks;
- evidence maturity and assurance status.

## 14.5 AIS matrix complete when

- every project-relevant official requirement is referenced;
- interpretation and implementation are separated;
- product and organisational responsibilities are explicit;
- verification exists for implemented behaviour;
- unmet organisational dependencies remain visible.

## 14.6 Permission model complete when it separates

- identity;
- role;
- authority source;
- represented person;
- scope;
- actions;
- information categories;
- duration;
- revocation;
- exceptional access;
- audit;
- unresolved legal/service rules.

## 14.7 Traceability example complete when it connects

```text
Source-verified concept
→ candidate hazard or user need
→ control
→ requirement
→ design/component
→ verification method
→ result
→ residual limitation
→ public wording
```

## 14.8 Interoperability example complete when it records

- exact FHIR version;
- implementation guide/profile and version;
- source URL;
- terminology edition;
- mapping;
- validator and version;
- validator result;
- semantic review status;
- provenance;
- limitations.

---

# 15. Evidence and correction log

| ID | Issue | Original understanding | Source/reviewer challenge | Corrected understanding | Affected claims/artefacts | Required rework | Resolution date |
|---|---|---|---|---|---|---|---|

## 15.1 Foundational correction rule

When a foundational claim changes:

1. Mark the old claim superseded.
2. Identify all dependants.
3. Block their verified/public status.
4. Re-evaluate artefacts.
5. Record rework.
6. Repeat relevant misconception tests.
7. Re-run public-claim review.

---

# 16. Public-claim controls

## 16.1 Required pre-publication check

For every material public statement ask:

1. What is the exact scope?
2. What evidence maturity was reached?
3. What assurance status was reached?
4. What remains unreviewed?
5. Which wording would overstate the evidence?


For every material statement ask:

1. What is the exact scope?
2. What evidence maturity was reached?
3. What assurance status was reached?
4. What remains unreviewed or unresolved?
5. Which wording would imply more than the evidence supports?
6. Is the underlying source still current?
7. Does any dependency remain blocked?

## 16.2 Claim-review record

| Claim | Scope | Source | Evidence maturity | Assurance status | Permitted wording | Prohibited wording | Caveat |
|---|---|---|---|---|---|---|---|

## 16.3 Permitted examples

- “This claim is **E1/A0**: source verified and used only in an educational simulation.”
- “This FHIR resource is **E2/A1** within the named profile, version and validator scope.”
- “This workflow assumption is **E3/A2** after review by a community-care practitioner.”
- “These candidate hazards are **E2/A0** and have not been clinically reviewed.”
- “A clinician reviewed this individual candidate hazard as **E3/A2**; this does not establish complete clinical safety.”
- “The tested journey has **E3/A2** accessibility evidence within the stated participant, technology and task scope.”
- “I mapped the available and missing project evidence against DTAC 2.0 as **E2/AX**.”

## 16.4 Prohibited examples

- “The product meets DTAC.”
- “The product is clinically safe.”
- “The DPIA is legally sufficient.”
- “The system is interoperable.”
- “The workflow is DCB0129 compliant.”
- “The feature is not a medical device.”
- “The entire product is accessible.”
- “Independent review proves compliance.”
- “The carer has legal authority” where the project only models a hypothetical permission.

## 16.5 Domain examples

| Domain | Permitted | Not permitted |
|---|---|---|
| DTAC | “Mapped against DTAC 2.0; E2/AX” | “DTAC approved” |
| DSPT | “Project evidence mapped to selected DSPT concerns; E2/AX” | “DSPT compliant” |
| DCB0129 | “Selected principles applied to candidate hazards; E2/A0 or E3/A2” | “Clinically safe” or “DCB0129 compliant” |
| AIS | “Project requirements mapped to cited DAPB1605 requirements; E2/A0” | “Fulfils AIS” |
| Accessibility | “Named journey evaluated using stated methods; E2/A1 or E3/A2” | “The product is accessible” |
| FHIR | “Resource passed validator X against profile Y version Z; E2/A1” | “The system is interoperable” |
| SNOMED CT | “Concept exists in edition/date X; E1/A0” | “Clinically correct concept” without review |
| Medical device | “Potentially in scope; regulatory advice required; E2/AX” | Definitive classification |
| Security | “Threat model reviewed by a security engineer; E3/A2” | “The system is secure” |

# 16A. First milestone audit package

Conduct the first practical audit **at the end of Week 2**, before expanding into privacy and authority work.

The package contains:

- the active Week 1–2 source subset;
- the current foundational claim records;
- dependency map;
- first misconception-test results and corrections;
- stakeholder and responsibility map;
- early product assumptions;
- two concise weekly integration-review summaries;
- administration-percentage log;
- unresolved questions;
- corrections that propagated into dependent work;
- a one-paragraph decision on whether the learning system is helping or obstructing progress.

A completed product is not required. The milestone tests whether the source, claim, dependency and correction system works in practice.

# 17. Course decision gates

## 17.1 Digital clinical-safety training

### Essentials — minimum path

Complete during week 10.

Record:

- current official course page;
- provider-stated format;
- provider-stated duration only if published;
- completion/assessment evidence;
- corrections to the learner’s model.

Completion does not confer a clinical-safety role or assurance status.

### Intermediate — recommended path / start of Release 2

Intermediate is not required for Release 1.

At 28 July 2026, the official page states that it:

- builds on Essentials;
- covers activities and documents associated with DCB0129 and DCB0160 in a care scenario;
- costs £50 plus VAT for non-NHS e-learning access;
- is a prerequisite for Practitioner training.

Recheck availability, price, format, eligibility and prerequisites immediately before enrolment. Do not invent a duration where the provider does not publish one.

### Practitioner — role-dependent

Defer unless:

- a future role includes direct clinical-safety responsibility;
- organisational support and governance exist;
- prerequisites are met;
- the employer or role context justifies it.

Practitioner training does not by itself create A3 assurance or appoint the learner as a CSO.

## 17.2 BSI medical-device course

Current listing at 28 July 2026:

- one day;
- live online;
- £1,395 plus VAT;
- introductory level;
- medical-device software, classification, lifecycle and EN/IEC 62304 orientation.

Recheck exact dates, syllabus, prerequisites, price and cancellation terms immediately before purchase.

Use the existing 0–2 scoring gate:

- **12–16:** take;
- **7–11:** defer;
- **0–6:** do not take yet.

## 17.3 TÜV SÜD

Consider only after:

- a current suitable course is verified;
- Release 2 or interviews identify an implementation gap;
- the syllabus offers practical lifecycle work;
- employer-based experience is not a better route;
- opportunity cost is acceptable.

# 18. Costs and dependencies

## 18.1 Costs

| Path | Likely direct cost |
|---|---:|
| 12-week minimum | £0–£30 for tools/hosting; Essentials expected free where accessible |
| Recommended / Release 2 | Add £50 + VAT for Intermediate non-NHS e-learning at the current published price, plus optional reviewer costs |
| Extended | BSI currently £1,395 + VAT; paid standards and any TÜV SÜD course additional |

All prices and access conditions must be reverified before commitment.

## 18.2 Unresolved source and specialist dependencies

| Dependency | Needed for | Current treatment |
|---|---|---|
| DCB replacement outcome after 2026 review | Release 2 source currency | Monthly recheck; revised publication supersedes old claim set |
| Current MCA Code replacement status | Capacity scenarios | Use current published code; monitor update |
| DPO/IG/legal review | Applied lawful basis, confidentiality and proxy conclusions | E1/E2 learning only; formal adequacy AX |
| Social-care practitioner | Workflow credibility | Project remains fictional until E3/A2 review |
| Disabled users/accessibility specialist | User evidence | Technical scope may be E2/A1; broad claim AX |
| Clinician/CSO | Candidate hazard plausibility | Candidate hazards remain E2/A0 if unavailable |
| Exact FHIR IG/profile and validator | Applied conformance statement | Conceptual only until selected |
| Terminologist/clinician | SNOMED semantic appropriateness | Concept existence only without review |
| Regulatory professional | Medical-device scope/classification | AX in solo project |
| Regulated-software/quality professional | IEC 62304 interpretation | Strong public claims blocked without review |

## 18.3 Unresolved but non-blocking items

- DCB0129 and DCB0160 may be revised after the active 2026 review; recheck before Release 2.
- The published Mental Capacity Act Code may be replaced or updated; recheck before Week 4.
- Practitioner, disabled-user, IG, security, clinical-safety, terminology and regulatory reviewers may be unavailable; retain the corresponding E/A ceiling and disclose the gap.
- Exact FHIR implementation guide, profile and validator are intentionally inactive until the recommended path.
- Medical-device classification and formal IEC 62304 assurance remain AX in the solo project.
- Formal organisational DTAC acceptance, DSPT completion, DCB compliance and whole-product accessibility remain AX.

None of these items blocks Week 1 or the narrow Release 1 journey.

## 18.4 Replacement-source rule

If a revised DCB standard, DTAC form, MHRA regime document or other foundational source is published:

1. mark old claims superseded;
2. block dependent public wording;
3. compare changed scope and requirements;
4. update source and claim records;
5. re-run misconception tests;
6. revise affected artefacts;
7. preserve the historical version used for prior work.

# 19. Milestones and stopping points

| Milestone | Validation achieved | Value if paused |
|---|---|---|
| Source system established | Register, claim template, correction process | Prevents unsupported learning |
| Foundational distinctions passed | E1 for DTAC, DCB, data layers and AIS | Credible interview model |
| Minimum product slice built | E2 for bounded behaviours | Portfolio evidence |
| Minimum case study reviewed | Public claims matched to evidence | Publishable work |
| Release 2 candidate hazards built | E2 technical chain; clinical review status explicit | Clinical-safety learning |
| Practitioner feedback integrated | Selected E3 reviews | Greater workflow credibility |
| Medical-device checkpoint | Current MHRA analysis | Evidence-based decision to stop or specialise |
| IEC stage complete | Clause-level study and practical review | Regulated-software specialism |

Applications continue throughout. Completion of later milestones is not a prerequisite for employment.

---

# 20. Completion criteria

## 20.1 Minimum path

Complete when:

- source register is current enough for all active claims;
- no more than 15–20 foundational claims remain active;
- foundational misconception tests pass initially and after approximately two weeks;
- administration remained near or below 20% unless an explicit exception was recorded;
- the narrow Release 1 journey works end to end;
- authority and capacity conclusions remain hypothetical where specialist input is absent;
- AIS mapping references current DAPB1605 requirements;
- the bounded accessibility evaluation records WCAG 2.2 source, method, scope, results and limits;
- provenance, freshness, source/derived view and correction states are demonstrated;
- one candidate hazard is traced to a tested control;
- each cited proposition, technical result or reviewed conclusion has an E/A pair at the narrowest meaningful scope;
- every A1 record states criterion, method, result and limitation;
- AX areas are explicit;
- the case study passes pre-publication review.

## 20.2 Recommended path

Complete when:

- Intermediate training is completed or a reason for deferral recorded;
- Release 2 distinguishes receipt, acknowledgement, ownership, action and resolution;
- candidate hazards and clinical assumptions remain correctly labelled;
- one incident triggers dependency and correction review;
- selected user, carer, practitioner or specialist feedback changes the product;
- any FHIR resource identifies version, IG, profile, validator, date, errors/warnings and semantic limits;
- the focused clinical-safety article passes E/A claims review.

## 20.3 Extended path

Complete when:

- medical-device relevance is evidenced by roles, interviews or project direction;
- current MHRA sources are checked immediately before analysis;
- device-scope wording remains tentative and AX unless formally available;
- IEC 62304 study uses a lawfully accessed current edition/amendments;
- clause interpretations connect to artefacts;
- selected work receives practical regulated-software review;
- course decisions are evidence-based.

# 21. Audit log

| ID | Finding | Change in v0.3 | Status |
|---|---|---|---|
| AUD2-001 | Independent review could be mistaken for final correctness | Split evidence maturity (E0–E3) from assurance status (A0–A3/AX) | Resolved |
| AUD2-002 | Primary W3C accessibility sources missing | Added WCAG 2.2, Understanding WCAG, WCAG-EM and APG with normative status | Resolved |
| AUD2-003 | Equality Act guidance lacked primary legislation | Added Equality Act 2010 and bounded legal learning | Resolved |
| AUD2-004 | Capacity/proxy scenarios lacked MCA sources | Added MCA 2005 and Code; added decision/time-specific claim | Resolved |
| AUD2-005 | Safeguarding scenarios lacked bounded source set | Added Care Act 2014 and statutory guidance; retained practitioner boundary | Resolved |
| AUD2-006 | Confidentiality hierarchy relied too heavily on contextual guidance | Added 2025 NHS Code of Practice as primary general NHS source | Resolved |
| AUD2-007 | DTAC transition claims not separated from form content | Split form, guidance and official transition announcement; mapped transition and de-duplication wording to the exact source | Resolved |
| AUD2-008 | DCB wording risked universality | Added “where applicable/within scope” and replacement-source procedure | Resolved |
| AUD2-009 | Intermediate training was too close to minimum path | Moved to recommended path/start of Release 2 | Resolved |
| AUD2-010 | DUAA scope could become excessive | Limited study to project-relevant provisions | Resolved |
| AUD2-011 | FHIR governance source could stand in for technical profile | Required exact version, IG, canonical profile and validator | Resolved |
| AUD2-012 | Assurance emphasis risked weakening product discovery | Added NHS service standard/design principles and research exercise | Resolved |
| AUD2-013 | Minimum path remained optimistic | Standardised at 12 weeks and 66–78 hours | Resolved |
| AUD2-014 | Validation administration could dominate | Added 20% cap and 15–20 active-claim budget | Resolved |
| AUD2-015 | Learning and building needed regular integration | Added 30-minute weekly review | Resolved |
| AUD2-016 | Public claims used one-dimensional validation | Rewritten around E/A pairs and AX | Resolved |

# 21A. Identifier-integrity report

| Check | Count found | Count corrected | Remaining exceptions |
|---|---:|---:|---|
| Registered source IDs | 39 | 0 | Future-stage sources may remain deliberately inactive |
| Unique source-ID references | 39 | 18 stale references normalised; 2 missing relied-upon sources registered | None |
| Undefined source-ID references | 18 before correction | 18 | 0 |
| Registered foundational claim IDs | 16 | 0 | All are intentionally active or staged |
| Undefined claim-ID references | 0 | 0 | 0 |
| Duplicate source IDs | 0 | 0 | 0 |
| Duplicate claim IDs | 0 | 0 | 0 |
| Dependency IDs | 0 explicit IDs | 0 | Dependencies are represented by claim IDs and the dependency graph |
| Misconception-test IDs | 0 | 0 | Tests use named headings; no unresolved ID references |
| Artefact IDs | 0 | 0 | Artefacts are named rather than separately numbered |
| Audit-log IDs | 16 | 0 | Existing IDs remain unique |
| Unresolved source placeholders | 1 before correction | 1 resolved | 0 |
| Stale legacy validation-ladder terminology | 1 historical revision-log phrase | 1 clarified as historical wording | 0 operative uses |

The check preserves deliberately inactive future-stage sources. An unused registered source is not an error when it is clearly retained for a later activated stage.

# 21B. Working Plan Freeze Checklist

- [x] DTAC transition claims are sourced.
- [x] All source IDs resolve.
- [x] All claim and dependency references resolve.
- [x] No operative stale validation-level terminology remains.
- [x] E/A assignment operates at the narrowest meaningful level.
- [x] A1 requires criterion, method, result and limitation.
- [x] The 12-week arithmetic is internally consistent.
- [x] Weekly reviews are included in totals.
- [x] Administration is planned below the 20% operating cap.
- [x] Active foundational claims are limited to 15–20.
- [x] Week 1–2 sources are confirmed.
- [x] Intermediate training remains outside the minimum path.
- [x] The minimum journey has not broadened.
- [x] The first milestone audit package is defined.
- [x] Remaining unresolved issues are documented and non-blocking.

> **Freeze this version as the working plan. Do not perform another broad pre-execution audit. Begin Week 1 and conduct the next audit against actual learning evidence at the first milestone.**

# 22. Revision history and final-integrity change log

| Version | Date | Summary |
|---|---|---|
| 0.1 | 28 Jul 2026 | Initial audit-friendly restructuring |
| 0.2 | 28 Jul 2026 | Added source register, claims, the then-current validation model, dependencies, misconception tests and public-claim controls |
| 0.3 | 28 Jul 2026 | Split evidence maturity from assurance status; added W3C, Equality Act, MCA, safeguarding, NHS confidentiality and service-design sources; tightened DTAC/DCB/FHIR/SNOMED controls; moved Intermediate training to Release 2; made minimum path 12 weeks; capped validation administration |
| 0.3.1 | 28 Jul 2026 | Final integrity pass: resolved DTAC transition evidence, normalised stale identifiers, added narrow E/A assignment and A1 limitation rules, verified the 66–78-hour schedule, activated Week 1–2 sources, defined the first milestone audit and froze the working plan |

## 22.0 Final-integrity change log from v0.3

- Resolved `SRC-DTAC-TRANS` with the official NHS Innovation Service announcement published 4 March 2026.
- Normalised 18 stale source references inherited from v0.2.
- Registered two sources already relied upon by the text: ICO lawful-basis guidance and CQC medicines-administration-record guidance.
- Confirmed that all source and foundational claim references resolve.
- Removed operative legacy validation-ladder terminology.
- Added narrow-proposition E/A assignment and mixed-state artefact examples.
- Made criterion, method, result and limitation mandatory for every A1 record.
- Recalculated the 12-week schedule to 66–78 hours, including six hours of weekly integration review.
- Separated pure administration from substantive validation and set the planned administrative load at 9–11 hours.
- Defined the Week 1–2 source subset and end-of-Week-2 milestone audit package.
- Confirmed Essentials in the minimum path, Intermediate at Release 2, and Practitioner as role-dependent.
- Added the Working Plan Freeze Checklist and execution instruction.

## 22.1 Newly added source families

- WCAG 2.2 W3C Recommendation
- Understanding WCAG 2.2
- WCAG-EM
- WAI-ARIA Authoring Practices Guide
- Equality Act 2010
- Mental Capacity Act 2005
- Mental Capacity Act Code of Practice
- Care Act 2014 adult-safeguarding provisions
- Care and Support Statutory Guidance chapter 14
- NHS England Code of Practice on Confidential Information
- NHS service standard
- NHS design principles
- Official DTAC 2.0 transition announcement

## 22.2 Claims whose wording or confidence changed

- “Independent review” no longer implies final validation; it is E3 and usually A2.
- DTAC mapping is E2/AX, not readiness or approval.
- DSPT mapping is E2/AX, not organisational completion.
- Clinical hazards remain “candidate hazards”; clinician review may make one E3/A2 but not complete safety.
- A reviewed DPIA remains educational and formal adequacy is AX.
- Accessibility is claimed only for a named journey, methods and participants.
- WCAG 2.2 is normative; Understanding WCAG and APG are guidance.
- Capacity is decision-specific and time-specific; no global capacity boolean is acceptable.
- Being a carer does not establish authority.
- Safeguarding workflows support recording/escalation but do not validate safeguarding practice.
- FHIR validation is bounded to exact version/profile/validator.
- SNOMED browser lookup establishes existence/status, not clinical appropriateness.
- Medical-device qualification/classification remains AX.
- Intermediate clinical-safety training is no longer a minimum Release 1 requirement.

## 22.3 Proportionality assessment

The plan remains rigorous but usable because:

- the minimum path is one journey, not a broad platform;
- active foundational claims are capped;
- administration is capped at about 20%;
- only decision-relevant claims are registered;
- formal assurance is usually AX rather than simulated;
- Essentials, not Intermediate, sits in the minimum path;
- new legal and safeguarding sources create scenarios and constraints rather than new product features;
- later specialist depth remains optional;
- applications continue throughout.

The main residual risk is source maintenance during active 2026 change, particularly DCB review outcomes, DUAA/ICO guidance and MHRA implementation. These are managed through short recheck intervals rather than broader pre-emptive study.

# 23. Execution-readiness statement

The plan is ready to execute.

The exact DTAC transition source is resolved; identifier references are internally consistent; the E/A model is scoped to the narrowest meaningful proposition; A1 cannot be recorded without an explicit limitation; the 12-week arithmetic matches the 66–78-hour headline; weekly reviews and administrative controls are included; the first two weeks require only a bounded active source subset; and all remaining dependencies are non-blocking for Week 1.

> **Freeze v0.3.1 as the working plan. Begin Week 1. The next audit should examine actual learning evidence at the end-of-Week-2 milestone, not reopen the whole curriculum.**

# Appendix A — Blank learning-claim record

| Field | Entry |
|---|---|
| Claim ID |  |
| Learning claim |  |
| Primary source ID |  |
| Relevant passage |  |
| Plain-language interpretation |  |
| Scope and limits |  |
| Counterexample |  |
| Applied project example |  |
| Validation method |  |
| Validator/reviewer |  |
| Evidence maturity | E0–E3 |
| Assurance status | A0–A3 or AX |
| A1 criterion/method/result/limitation | Required when A1 |
| Dependencies |  |
| Dependants |  |
| Recheck date |  |
| Public wording |  |
| Status |  |

# Appendix B — Blank clinical-assumption record

| Field | Entry |
|---|---|
| Assumption ID |  |
| Assumption |  |
| Evidence/source |  |
| Potential safety impact |  |
| Required reviewer |  |
| Current status |  |
| Dependants |  |
| Resolution |  |

# Appendix C — Blank public-claim record

| Field | Entry |
|---|---|
| Claim |  |
| Source |  |
| Evidence maturity | E0–E3 |
| Assurance status | A0–A3 or AX |
| A1 criterion/method/result/limitation | Required when A1 |
| Permitted wording |  |
| Prohibited wording |  |
| Required caveat |  |
| Reviewer |  |
| Publication status |  |
