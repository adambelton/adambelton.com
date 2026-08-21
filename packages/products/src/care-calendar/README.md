# Care Calendar

Care Calendar is a structured healthcare and social-care product-engineering
learning project and the repository's next product. The work uses a bounded
patient-and-authorised-carer coordination concept to develop and demonstrate
care-domain understanding, trustworthy product reasoning, and appropriate
assurance boundaries.

The product is currently in its learning and definition phase. A host-owned
public overview page presents that work through the website, but no Care Calendar runtime,
interactive user interface, integration, or deployable product has been
implemented. The documents in [`docs/`](docs/) are the sources of truth; this
README provides only a high-level entry point and progress summary.

## Implemented structure

```txt
care-calendar/
├── docs/                          Authoritative learning and definition records
└── README.md                      Product guide and status
```

The website description is owned by
`apps/client/src/products/pages/CareCalendarOverviewPage.tsx`; it is not Care
Calendar product implementation.

## Current progress

The project has established its initial intended-purpose boundary, foundational
clinical-safety model, stakeholder and responsibility map, care-service journey
and information handovers, learning outcomes, target-sector briefing, and
structured learning roadmap. These artefacts record their own evidence,
assurance status, limitations, and unresolved questions.

Further learning, validation, specialist review, and product definition remain
before implementation. Nothing in this repository claims that Care Calendar is
a clinically assured, compliant, production-ready, or deployable healthcare
product.

## Authoritative documents

- [Intended purpose and exclusions](docs/care-calendar-intended-purpose-and-exclusions.md)
- [Care/service journey and information handover map](docs/care-calendar-care-service-journey-and-handovers.md)
- [Stakeholder and responsibility map](docs/care-calendar-stakeholder-and-responsibility-map.md)
- [Foundational clinical-safety model](docs/care-calendar-foundational-clinical-safety-model.md)
- [Learning outcomes](docs/care-calendar-learning-outcomes.md)
- [Trustworthy healthcare and social-care learning plan](docs/trustworthy-healthcare-social-care-learning-plan.md)
- [Target healthtech and social-care product briefing](docs/target-healthtech-social-care-product-briefing.md)

Read the relevant source document before relying on or changing a Care Calendar
concept. Detailed learning, domain conclusions, product boundaries, and
assurance statements should be maintained there rather than duplicated in this
README.
