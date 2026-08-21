import { ProductOverviewSection } from "apps/client/src/products/components/ProductOverviewSection";
import { ProductOverviewSubsection } from "apps/client/src/products/components/ProductOverviewSubsection";
import { ProductOverviewTitleSection } from "apps/client/src/products/components/ProductOverviewTitleSection";

export function CareCalendarOverviewPage() {
  return (
    <div className="grid gap-14 sm:gap-20">
      <ProductOverviewTitleSection
        description={
          <>
            Care Calendar is a structured product-engineering learning project. I
            use a bounded appointment-coordination concept to investigate care
            services, clinical safety, information handovers, organisational
            responsibility, and the limits of a digital product&apos;s authority. The
            work is ongoing; its documents record the evidence, current reasoning,
            limitations, and questions still to resolve.
          </>
        }
        tagline={
          <>
          Learning how to build trustworthy products across healthcare and
          social care.
          </>
        }
        title="Care Calendar"
      />

      <ProductOverviewSection
        contentClassName="grid max-w-4xl gap-6 sm:grid-cols-3"
        id="learning-title"
        title="Learning areas"
      >
        <ProductOverviewSubsection title="Care context and service design">
          <p>
            Understanding how healthcare and social care work across people,
            carers, practitioners, providers, and suppliers—and how research and
            lived experience should shape an effective, person-centred service.
          </p>
        </ProductOverviewSubsection>
        <ProductOverviewSubsection title="Information governance and authority">
          <p>
            Learning to distinguish data protection, confidentiality, product
            permissions, and authority to act, while preserving source,
            freshness, correction history, and the limits of a coordination view.
          </p>
        </ProductOverviewSubsection>
        <ProductOverviewSubsection title="Accessibility and inclusive communication">
          <p>
            Applying accessibility, usability, equality, and inclusive-service
            principles without confusing technical conformance with a service
            that genuinely meets people&apos;s communication needs.
          </p>
        </ProductOverviewSubsection>
        <ProductOverviewSubsection title="Security, resilience, and interoperability">
          <p>
            Exploring how health and care products protect information, behave
            through outages and conflicting data, and exchange information while
            preserving meaning and provenance.
          </p>
        </ProductOverviewSubsection>
        <ProductOverviewSubsection title="Clinical safety and shared responsibility">
          <p>
            Developing a practical model of how software can contribute to harm,
            how risks become traceable requirements and tests, and how supplier
            controls interact with local deployment and care workflows.
          </p>
        </ProductOverviewSubsection>
        <ProductOverviewSubsection title="Assurance and regulatory boundaries">
          <p>
            Learning what evidence frameworks such as DTAC and DSPT ask for, how
            intended purpose affects the medical-device boundary, and when formal
            assurance or specialist judgement remains essential.
          </p>
        </ProductOverviewSubsection>
      </ProductOverviewSection>

      <ProductOverviewSection
        id="concept-title"
        title="A concept to learn through"
      >
          <p>
            The working concept helps a patient and an authorised carer
            understand upcoming health and social-care appointments, prepare for
            them, and follow appointment-specific information as it moves between
            services.
          </p>
          <p>
            Keeping that purpose narrow creates real questions to investigate:
            which system is authoritative, how requests and acknowledgements are
            represented, what happens when data is stale, and where human review
            and organisational responsibility begin.
          </p>
      </ProductOverviewSection>

      <ProductOverviewSection
        id="boundaries-title"
        title="Current working boundaries"
      >
          <p>
            Care Calendar is a coordination view, not a medical record, clinical
            decision-maker, emergency channel, or authority that changes
            provider-held appointments. Patient and carer actions remain requests
            until the authoritative source confirms a change.
          </p>
          <p>
            These exclusions are current project-scope decisions, not claims of
            legal, clinical, organisational, or regulatory sufficiency. They keep
            the investigation bounded while exposing questions that would need
            stronger evidence and specialist input before the concept could
            expand.
          </p>
      </ProductOverviewSection>

      <ProductOverviewSection
        id="status-title"
        title="Current status"
      >
          <p>
            The project is in its learning and definition phase. Its output is a
            connected set of intended-purpose, clinical-safety, stakeholder,
            service-journey, and information-handover documents—not an
            implemented application.
          </p>
          <p>
            Further learning, validation, specialist review, and product
            definition are required. Nothing here claims that Care Calendar is
            clinically assured, compliant, production-ready, or deployable.
          </p>
          <p className="text-sm">Updated August 2026</p>
      </ProductOverviewSection>
    </div>
  );
}
