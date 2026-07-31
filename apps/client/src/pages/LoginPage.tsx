import { Prose } from "apps/client/src/components";

export function LoginPage() {
  return (
    <section aria-labelledby="login-title">
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        Log in
      </p>
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="login-title"
      >
        Check your email.
      </h1>
      <Prose className="mt-8">
        The magic-link auth flow will be ported in a later task.
      </Prose>
    </section>
  );
}
