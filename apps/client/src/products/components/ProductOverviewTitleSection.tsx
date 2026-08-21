import type { ReactNode } from "react";

export type ProductOverviewTitleSectionProps = {
  children?: ReactNode;
  description: ReactNode;
  id?: string;
  tagline: ReactNode;
  title: string;
};

export function ProductOverviewTitleSection({
  children,
  description,
  id = "product-title",
  tagline,
  title,
}: ProductOverviewTitleSectionProps) {
  return (
    <section aria-labelledby={id}>
      <h1
        className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
        id={id}
      >
        {title}
      </h1>
      <p className="mt-6 max-w-3xl text-xl font-semibold leading-8">
        {tagline}
      </p>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--muted)]">
        {description}
      </p>
      {children}
    </section>
  );
}
