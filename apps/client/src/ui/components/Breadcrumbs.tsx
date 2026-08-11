import { NavigationLink } from "apps/client/src/ui/components";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          const ariaCurrent = isCurrent ? "page" : undefined;
          return (
            <li
              className="flex min-w-0 items-center gap-2"
              key={`${item.label}-${index}`}
            >
              {index > 0 ? <span aria-hidden="true">*</span> : null}
              {item.href && !isCurrent ? (
                <NavigationLink className="underline decoration-[var(--line)] underline-offset-4 hover:no-underline" href={item.href}>
                  {item.label}
                </NavigationLink>
              ) : (
                <span
                  aria-current={ariaCurrent}
                  className="min-w-0 break-words"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
