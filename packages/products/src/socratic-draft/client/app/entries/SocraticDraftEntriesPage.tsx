export function SocraticDraftEntriesPage() {
  return (
    <section aria-labelledby="entries-title">
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        The Socratic Draft
      </p>
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl"
        id="entries-title"
      >
        Entries
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">
        No saved entries yet.
      </p>
      <p className="mt-5 text-base leading-7 text-[var(--muted)]">
        <a href="/products/socratic-draft/editor">Open the editor</a>
      </p>
    </section>
  );
}
