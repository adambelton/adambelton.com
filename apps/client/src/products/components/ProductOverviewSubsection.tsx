import type { ReactNode } from "react";

export type ProductOverviewSubsectionProps = {
  children: ReactNode;
  title: string;
};

export function ProductOverviewSubsection({
  children,
  title,
}: ProductOverviewSubsectionProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="mt-2 text-base leading-7 text-[var(--muted)]">
        {children}
      </div>
    </div>
  );
}
