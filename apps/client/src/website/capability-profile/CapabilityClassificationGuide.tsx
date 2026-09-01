import type {
  CapabilityClassificationKey,
  CompiledCapabilityProfile,
} from "apps/client/src/website/content/content-types";
import { ClassificationTag } from "apps/client/src/website/capability-profile/ClassificationTag";
import { useCapabilityDialog } from "apps/client/src/website/capability-profile/useCapabilityDialog";
import { RenderedMarkdown } from "apps/client/src/website/content/RenderedMarkdown";

type CapabilityClassificationGuideProps = {
  onClose: () => void;
  profile: CompiledCapabilityProfile;
};

const classificationOrder: CapabilityClassificationKey[] = [
  "evidence_basis",
  "development_trajectory",
  "leverage_profile",
];

export function CapabilityClassificationGuide({
  onClose,
  profile,
}: CapabilityClassificationGuideProps) {
  const { closeRef, dialogRef, handleDialogKeyboardInteraction } = useCapabilityDialog(onClose);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        aria-labelledby="capability-classification-guide-title"
        aria-modal="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto bg-[var(--background)] p-5 shadow-2xl sm:p-8"
        onKeyDown={handleDialogKeyboardInteraction}
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow mb-2 text-[var(--muted)]">{profile.classificationGuide.eyebrow}</p>
            <h2
              className="m-0 text-2xl font-semibold leading-tight sm:text-3xl"
              id="capability-classification-guide-title"
            >
              {profile.classificationGuide.title}
            </h2>
          </div>
          <button
            aria-label="Close classification guide"
            className="min-h-11 min-w-11 border border-[var(--line)] text-xl hover:border-[var(--foreground)]"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="mt-7 grid gap-8">
          {classificationOrder.map((classificationKey) => {
            const classification = profile.classifications[classificationKey];
            return (
              <section key={classification.key}>
                <h3 className="m-0 text-lg font-semibold">{classification.label}</h3>
                <RenderedMarkdown
                  className="mt-2 max-w-2xl text-sm leading-6"
                  html={classification.introductionHtml}
                />
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {classification.values.map((value) => (
                    <div className="border-t border-[var(--line-subtle)] pt-3" key={value.key}>
                      <dt>
                        <ClassificationTag
                          classificationKey={classificationKey}
                          label={value.label}
                        />
                      </dt>
                      <dd className="mb-0 ml-0 mt-2">
                        <RenderedMarkdown
                          className="text-sm leading-6"
                          html={value.explanationHtml}
                        />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
