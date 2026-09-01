import type { CapabilityClassificationKey } from "apps/client/src/website/content/content-types";

type ClassificationTagProps = {
  classificationKey: CapabilityClassificationKey;
  label: string;
};

const classNameByClassification: Record<CapabilityClassificationKey, string> = {
  evidence_basis: "border-[var(--classification-evidence-border)] bg-[var(--classification-evidence-background)] text-[var(--classification-evidence-text)]",
  development_trajectory: "border-[var(--classification-trajectory-border)] bg-[var(--classification-trajectory-background)] text-[var(--classification-trajectory-text)]",
  impact_profile: "border-[var(--classification-impact-border)] bg-[var(--classification-impact-background)] text-[var(--classification-impact-text)]",
};

export function ClassificationTag({ classificationKey, label }: ClassificationTagProps) {
  return (
    <span className={`inline-flex w-fit items-center border px-2 py-0.5 text-xs font-semibold leading-4 ${classNameByClassification[classificationKey]}`}>
      {label}
    </span>
  );
}
