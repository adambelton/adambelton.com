import { Prose } from "apps/web/components/site/Prose";
import { VerifySignInButton } from "apps/web/app/sign-in/verify/VerifySignInButton";

export default function VerifySignInPage() {
  return (
    <section aria-labelledby="verify-sign-in-title">
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        Sign in
      </p>
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl"
        id="verify-sign-in-title"
      >
        Complete sign in.
      </h1>
      <Prose className="mt-8">
        <p>
          Use the button below to finish signing in. The link can only be used
          once.
        </p>
      </Prose>
      <div className="mt-8">
        <VerifySignInButton />
      </div>
    </section>
  );
}
