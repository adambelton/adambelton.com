import type { CapabilityClassificationKey } from "apps/client/src/website/content/content-types";

type ClassificationTagProps = {
  classificationKey: CapabilityClassificationKey;
  label: string;
};

const classNameByClassification: Record<CapabilityClassificationKey, string> = {
  evidence_basis: "border-[var(--classification-evidence-border)] bg-[var(--classification-evidence-background)] text-[var(--classification-evidence-text)]",
  development_trajectory: "border-[var(--classification-trajectory-border)] bg-[var(--classification-trajectory-background)] text-[var(--classification-trajectory-text)]",
  leverage_profile: "border-[var(--classification-leverage-border)] bg-[var(--classification-leverage-background)] text-[var(--classification-leverage-text)]",
};

export function ClassificationTag({ classificationKey, label }: ClassificationTagProps) {
  return (
    <span className={`inline-flex w-fit items-center border px-2 py-0.5 text-xs font-semibold leading-4 ${classNameByClassification[classificationKey]}`}>
      {label}
    </span>
  );
}
