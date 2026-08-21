import type { ReactNode } from "react";

export type ProductOverviewSectionProps = {
  children: ReactNode;
  contentClassName?: string;
  id: string;
  title: string;
};

export function ProductOverviewSection({
  children,
  contentClassName = "grid max-w-3xl gap-4 text-base leading-7 text-[var(--muted)]",
  id,
  title,
}: ProductOverviewSectionProps) {
  return (
    <section aria-labelledby={id}>
      <h2 className="eyebrow mb-5" id={id}>
        {title}
      </h2>
      <div
        className={`${contentClassName} border-t border-[var(--line)] pt-5`}
      >
        {children}
      </div>
    </section>
  );
}
