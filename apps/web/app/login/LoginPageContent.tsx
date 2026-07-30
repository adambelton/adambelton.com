import { SignInForm } from "apps/web/app/sign-in/SignInForm";

type LoginPageContentProps = {
  error?: string;
};

const loginErrors: Record<string, string> = {
  INVALID_TOKEN: "That sign-in link is invalid or has already been used.",
};

export function LoginPageContent({ error }: LoginPageContentProps) {
  const errorMessage = error ? loginErrors[error] : null;

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
      <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)]">
        Enter your email and I will send you a magic link for the product demos.
      </p>
      {errorMessage ? (
        <p className="mt-6 max-w-2xl text-sm font-semibold text-[var(--accent)]">
          {errorMessage}
        </p>
      ) : null}
      <div className="mt-10">
        <SignInForm />
      </div>
    </section>
  );
}
