import { Prose } from "apps/client/src/components";

export function LogoutPage() {
  return (
    <section aria-labelledby="logout-title">
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        Log out
      </p>
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="logout-title"
      >
        Signed-out flow placeholder.
      </h1>
      <Prose className="mt-8">
        The logout route will call the auth client in a later task.
      </Prose>
    </section>
  );
}
