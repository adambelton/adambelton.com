import { useRef, useState, type KeyboardEvent } from "react";
import type {
  CapabilityClassificationKey,
  CapabilityProfileViewKey,
  CompiledCapability,
  CompiledCapabilityProfile,
} from "apps/client/src/website/content/content-types";
import { RenderedMarkdown } from "apps/client/src/website/content/RenderedMarkdown";
import { ClassificationTag } from "apps/client/src/website/capability-profile/ClassificationTag";
import { CapabilityClassificationGuide } from "apps/client/src/website/capability-profile/CapabilityClassificationGuide";
import { useCapabilityDialog } from "apps/client/src/website/capability-profile/useCapabilityDialog";

type CapabilityProfileProps = {
  profile: CompiledCapabilityProfile;
};

const classificationByView: Partial<
  Record<CapabilityProfileViewKey, CapabilityClassificationKey>
> = {
  "evidence-basis": "evidence_basis",
  "development-trajectory": "development_trajectory",
  "impact-profile": "impact_profile",
};

const capabilityFieldByClassification: Record<
  CapabilityClassificationKey,
  keyof Pick<CompiledCapability, "evidenceBasis" | "developmentTrajectory" | "impactProfile">
> = {
  evidence_basis: "evidenceBasis",
  development_trajectory: "developmentTrajectory",
  impact_profile: "impactProfile",
};

const viewControlColours: Record<Exclude<CapabilityProfileViewKey, "overview">, {
  active: string;
  inactive: string;
}> = {
  "evidence-basis": {
    active: "border-[var(--classification-evidence-border)] bg-[var(--classification-evidence-background)] text-[var(--classification-evidence-text)]",
    inactive: "border-[var(--classification-evidence-border)] text-[var(--classification-evidence-text)] hover:bg-[var(--classification-evidence-background)]",
  },
  "development-trajectory": {
    active: "border-[var(--classification-trajectory-border)] bg-[var(--classification-trajectory-background)] text-[var(--classification-trajectory-text)]",
    inactive: "border-[var(--classification-trajectory-border)] text-[var(--classification-trajectory-text)] hover:bg-[var(--classification-trajectory-background)]",
  },
  "impact-profile": {
    active: "border-[var(--classification-impact-border)] bg-[var(--classification-impact-background)] text-[var(--classification-impact-text)]",
    inactive: "border-[var(--classification-impact-border)] text-[var(--classification-impact-text)] hover:bg-[var(--classification-impact-background)]",
  },
};

function viewControlColour(viewKey: CapabilityProfileViewKey, isActive: boolean) {
  if (viewKey === "overview") {
    return isActive
      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
      : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]";
  }
  return viewControlColours[viewKey][isActive ? "active" : "inactive"];
}

export function CapabilityProfile({ profile }: CapabilityProfileProps) {
  const [activeView, setActiveView] = useState<CapabilityProfileViewKey>("overview");
  const [selectedCapability, setSelectedCapability] = useState<CompiledCapability>();
  const [isClassificationGuideOpen, setIsClassificationGuideOpen] = useState(false);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const activeViewDefinition = profile.views.find(({ key }) => key === activeView)!;
  const activeClassificationKey = classificationByView[activeView];

  function selectAdjacentView(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const lastIndex = profile.views.length - 1;
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? lastIndex
        : (index + (event.key === "ArrowRight" ? 1 : -1) + profile.views.length) % profile.views.length;
    const nextView = profile.views[nextIndex];
    if (!nextView) return;
    setActiveView(nextView.key);
    tabsRef.current[nextIndex]?.focus();
  }

  return (
    <section aria-labelledby="capability-profile-title" className="min-w-0 border-t border-[var(--line)] pt-6">
      <div className="max-w-3xl">
        <p className="eyebrow mb-3">{profile.eyebrow}</p>
        <div className="flex items-center gap-3">
          <h2 className="m-0 text-3xl font-semibold leading-tight sm:text-4xl" id="capability-profile-title">
            {profile.title}
          </h2>
          <button
            aria-haspopup="dialog"
            aria-label="Open classification guide"
            className="grid min-h-11 min-w-11 place-items-center rounded-full border border-[var(--line)] text-sm font-semibold text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            onClick={() => setIsClassificationGuideOpen(true)}
            type="button"
          >
            <span aria-hidden="true">i</span>
          </button>
        </div>
      </div>

      <div
        aria-label="Capability profile view"
        className="mt-5 flex max-w-full gap-1 overflow-x-auto border-b border-[var(--line)] pb-px"
        role="tablist"
      >
        {profile.views.map((view, index) => {
          const isActive = view.key === activeView;
          return (
            <button
              aria-controls="capability-profile-panel"
              aria-selected={isActive}
              className={`min-h-11 shrink-0 border border-b-0 border-t-4 px-4 py-2 text-sm transition-colors ${viewControlColour(view.key, isActive)}`}
              id={`capability-view-${view.key}`}
              key={view.key}
              onClick={() => setActiveView(view.key)}
              onKeyDown={(event) => selectAdjacentView(event, index)}
              ref={(element) => { tabsRef.current[index] = element; }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              <span className="font-bold">{view.label}</span>
            </button>
          );
        })}
      </div>

      <div
        aria-labelledby={`capability-view-${activeView}`}
        className="mt-6 min-w-0"
        id="capability-profile-panel"
        role="tabpanel"
      >
        <RenderedMarkdown className="max-w-3xl" html={activeViewDefinition.introductionHtml} />
        <MatrixHeaderRow
          classificationKey={activeClassificationKey}
          profile={profile}
        />

        <div className="mt-8 grid gap-9">
          {profile.sections.map((section) => (
            <section
              className="min-w-0 md:grid md:grid-cols-4 md:gap-4"
              aria-labelledby={`capability-section-${section.key}`}
              key={section.key}
            >
              <h3
                className="mb-4 border-b border-[var(--line)] pb-3 text-lg font-semibold md:mb-0 md:border-b-0 md:border-r md:pb-0 md:pr-4"
                id={`capability-section-${section.key}`}
              >
                {section.label}
              </h3>
              {activeClassificationKey ? (
                <ClassifiedCapabilityGroups
                  classificationKey={activeClassificationKey}
                  groupIdPrefix={section.key}
                  onSelect={setSelectedCapability}
                  profile={profile}
                  capabilities={section.capabilities}
                />
              ) : (
                <div className="grid gap-3 md:col-span-3 md:grid-cols-3">
                  {section.capabilities.map((capability) => (
                    <CapabilityCard
                      capability={capability}
                      hiddenClassificationKey={undefined}
                      key={capability.key}
                      onSelect={setSelectedCapability}
                      profile={profile}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>

      {selectedCapability ? (
        <CapabilityDetail
          capability={selectedCapability}
          onClose={() => setSelectedCapability(undefined)}
          profile={profile}
        />
      ) : null}
      {isClassificationGuideOpen ? (
        <CapabilityClassificationGuide
          onClose={() => setIsClassificationGuideOpen(false)}
          profile={profile}
        />
      ) : null}
    </section>
  );
}

function MatrixHeaderRow({
  classificationKey,
  profile,
}: {
  classificationKey: CapabilityClassificationKey | undefined;
  profile: CompiledCapabilityProfile;
}) {
  if (!classificationKey) {
    return <div aria-hidden="true" className="hidden md:grid md:grid-cols-4" />;
  }
  const classification = profile.classifications[classificationKey];
  return (
    <div
      aria-label={`${classification.label} column definitions`}
      className="mt-6 grid gap-4 md:grid-cols-4"
      role="group"
    >
      <div aria-hidden="true" className="hidden md:block" />
      {classification.values.map((value) => (
        <div key={value.key}>
          <h3 className="m-0 text-lg font-semibold">{value.label}</h3>
          <RenderedMarkdown className="mt-2 text-sm leading-6" html={value.explanationHtml} />
        </div>
      ))}
      {classification.values.length === 2 ? (
        <div aria-hidden="true" className="hidden md:block" />
      ) : null}
    </div>
  );
}

function ClassifiedCapabilityGroups({
  capabilities,
  classificationKey,
  groupIdPrefix,
  onSelect,
  profile,
}: {
  capabilities: CompiledCapability[];
  classificationKey: CapabilityClassificationKey;
  groupIdPrefix: string;
  onSelect: (capability: CompiledCapability) => void;
  profile: CompiledCapabilityProfile;
}) {
  const classification = profile.classifications[classificationKey];
  const capabilityField = capabilityFieldByClassification[classificationKey];
  return (
    <div className="min-w-0 grid gap-4 md:col-span-3 md:grid-cols-3">
      {classification.values.map((value) => {
        const groupedCapabilities = capabilities.filter(
          (capability) => capability[capabilityField] === value.key,
        );
        return (
          <section aria-labelledby={`${groupIdPrefix}-${classificationKey}-${value.key}`} key={value.key}>
            <h4 className="mb-3 text-sm font-semibold md:hidden" id={`${groupIdPrefix}-${classificationKey}-${value.key}`}>
              {value.label}
            </h4>
            {groupedCapabilities.length ? (
              <div className="grid gap-3">
                {groupedCapabilities.map((capability) => (
                  <CapabilityCard
                    capability={capability}
                    hiddenClassificationKey={classificationKey}
                    key={capability.key}
                    onSelect={onSelect}
                    profile={profile}
                  />
                ))}
              </div>
            ) : (
              <div aria-hidden="true" className="min-h-12 border-t border-[var(--line-subtle)]" />
            )}
          </section>
        );
      })}
      {classification.values.length === 2 ? (
        <div aria-hidden="true" className="hidden md:block" />
      ) : null}
    </div>
  );
}

function CapabilityCard({
  capability,
  hiddenClassificationKey,
  onSelect,
  profile,
}: {
  capability: CompiledCapability;
  hiddenClassificationKey: CapabilityClassificationKey | undefined;
  onSelect: (capability: CompiledCapability) => void;
  profile: CompiledCapabilityProfile;
}) {
  return (
    <button
      aria-haspopup="dialog"
      className="flex w-full cursor-pointer flex-col items-start border border-[var(--line)] bg-transparent p-3 text-left transition-colors hover:border-[var(--foreground)]"
      onClick={() => onSelect(capability)}
      type="button"
    >
      <span className="text-base font-semibold leading-snug">{capability.name}</span>
      <span className="mt-3 flex flex-wrap gap-1.5">
        {classificationEntries(capability, profile)
          .filter(({ key }) => key !== hiddenClassificationKey)
          .map(({ key, label }) => (
            <ClassificationTag classificationKey={key} key={key} label={label} />
          ))}
      </span>
    </button>
  );
}

function CapabilityDetail({
  capability,
  onClose,
  profile,
}: {
  capability: CompiledCapability;
  onClose: () => void;
  profile: CompiledCapabilityProfile;
}) {
  const section = profile.sections.find(({ capabilities }) =>
    capabilities.some(({ key }) => key === capability.key),
  )!;
  const entries = classificationEntries(capability, profile);
  const { closeRef, dialogRef, handleDialogKeyboardInteraction } = useCapabilityDialog(onClose);

  const evidence = entries.find(({ key }) => key === "evidence_basis")!;
  const trajectory = entries.find(({ key }) => key === "development_trajectory")!;
  const impact = entries.find(({ key }) => key === "impact_profile")!;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div
        aria-labelledby="capability-detail-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto bg-[var(--background)] p-5 shadow-2xl sm:p-8"
        onKeyDown={handleDialogKeyboardInteraction}
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow mb-2 text-[var(--muted)]">{section.label}</p>
            <h2 className="m-0 text-2xl font-semibold leading-tight sm:text-3xl" id="capability-detail-title">
              {capability.name}
            </h2>
          </div>
          <button
            aria-label="Close capability details"
            className="min-h-11 min-w-11 border border-[var(--line)] text-xl hover:border-[var(--foreground)]"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {entries.map(({ key, label }) => (
            <ClassificationTag classificationKey={key} key={key} label={label} />
          ))}
        </div>
        <RenderedMarkdown className="mt-6" html={capability.descriptionHtml} />
        <div className="mt-6 grid gap-6 border-t border-[var(--line)] pt-6">
          <section>
            <h3 className="mb-3 flex flex-wrap items-center gap-2 text-base font-semibold">
              {profile.classifications.evidence_basis.label}:{" "}
              <ClassificationTag classificationKey="evidence_basis" label={evidence.label} />
            </h3>
            <RenderedMarkdown html={capability.experienceEvidenceHtml} />
          </section>
          <section>
            <h3 className="mb-3 flex flex-wrap items-center gap-2 text-base font-semibold">
              {profile.classifications.development_trajectory.label}:{" "}
              <ClassificationTag
                classificationKey="development_trajectory"
                label={trajectory.label}
              />
            </h3>
            <RenderedMarkdown html={capability.currentFocusHtml} />
          </section>
          <section>
            <h3 className="mb-3 flex flex-wrap items-center gap-2 text-base font-semibold">
              {profile.classifications.impact_profile.label}:{" "}
              <ClassificationTag
                classificationKey="impact_profile"
                label={impact.label}
              />
            </h3>
            <RenderedMarkdown html={capability.impactProfileHtml} />
          </section>
        </div>
      </div>
    </div>
  );
}

function classificationEntries(
  capability: CompiledCapability,
  profile: CompiledCapabilityProfile,
) {
  return ([
    ["evidence_basis", capability.evidenceBasis],
    ["development_trajectory", capability.developmentTrajectory],
    ["impact_profile", capability.impactProfile],
  ] as const).map(([key, valueKey]) => ({
    key,
    label: profile.classifications[key].values.find(({ key: candidate }) => candidate === valueKey)!.label,
  }));
}
