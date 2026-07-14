import { Prose } from "apps/web/components/site/Prose";

export default function HomePage() {
  return (
    <>
      <section aria-labelledby="home-title">
        <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
          Writing
        </p>
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="home-title"
        >
          Notes, essays, and work in progress.
        </h1>
        <Prose className="mt-8">
          This will become the main collection for published writing. For now,
          the site structure is in place and the writing itself is still to come.
        </Prose>
      </section>

      <section aria-labelledby="writing-title">
        <h2
          className="mb-5 text-sm font-semibold uppercase tracking-normal"
          id="writing-title"
        >
          Collection
        </h2>
        <div className="border-t border-[var(--line)] pt-5">
          <p className="m-0 max-w-2xl text-base leading-7 text-[var(--muted)]">
            No published pieces yet.
          </p>
        </div>
      </section>
    </>
  );
}
