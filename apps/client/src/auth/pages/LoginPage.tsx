import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router";
import { magicLinkSignInPath } from "packages/auth/src/server/routes";
import { Breadcrumbs, Button, Prose } from "apps/client/src/ui/components";

type SignInStatus = "idle" | "sending" | "sent";

const defaultCallbackUrl = "/products";

const loginErrors: Record<string, string> = {
  INVALID_TOKEN: "That sign-in link is invalid or has already been used.",
};
const unknownLoginError =
  "That sign-in link could not be completed. Request a new link and try again.";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const loginError = searchParams.get("error");
  const loginErrorMessage = loginError
    ? (loginErrors[loginError] ?? unknownLoginError)
    : null;
  const canSubmit = email.trim().length > 0 && status !== "sending";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setStatus("sending");
    setError(null);

    const response = await fetch(magicLinkSignInPath, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        callbackURL: defaultCallbackUrl,
        errorCallbackURL: "/login",
      }),
    });

    if (!response.ok) {
      setStatus("idle");
      setError("The sign-in link could not be sent.");
      return;
    }

    setStatus("sent");
  }

  return (
    <section aria-labelledby="login-title">
      <Breadcrumbs items={[{ label: "Log in" }]} />
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="login-title"
      >
        Check your email.
      </h1>
      <Prose className="mt-8">
        Enter your email and I will send you a magic link for the product demos.
      </Prose>
      {loginErrorMessage ? (
        <p className="mt-6 max-w-2xl text-sm font-semibold text-[var(--accent)]">
          {loginErrorMessage}
        </p>
      ) : null}
      <form className="mt-10 grid max-w-md gap-4" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="border border-[var(--line)] bg-transparent p-4 text-base leading-7 text-[var(--foreground)]"
          disabled={status === "sending" || status === "sent"}
          id="email"
          inputMode="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        {error ? (
          <p className="m-0 text-sm font-semibold text-[var(--accent)]">
            {error}
          </p>
        ) : null}
        {status === "sent" ? (
          <p className="m-0 text-base leading-7 text-[var(--muted)]">
            Check your email for a sign-in link.
          </p>
        ) : null}
        <Button disabled={!canSubmit} type="submit">
          {status === "sending" ? "Sending..." : "Send sign-in link"}
        </Button>
      </form>
    </section>
  );
}
