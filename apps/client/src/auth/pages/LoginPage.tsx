import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useSearchParams } from "react-router";
import { magicLinkSignInPath } from "packages/auth/src/server/routes";
import { Breadcrumbs, Button, Prose } from "apps/client/src/ui/components";
import { useAuthSession } from "apps/client/src/auth/session";

type SignInStatus = "idle" | "sending" | "sent";

const defaultCallbackUrl = "/products";

const loginErrors: Record<string, string> = {
  INVALID_TOKEN: "That sign-in link is invalid or has already been used.",
};
const unknownLoginError =
  "That sign-in link could not be completed. Request a new link and try again.";

export function LoginPage() {
  const session = useAuthSession();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const loginError = searchParams.get("error");
  const loginErrorMessage = loginError
    ? (loginErrors[loginError] ?? unknownLoginError)
    : null;
  const canSubmit = email.trim().length > 0 && status !== "sending";

  if (session.isPending) {
    return <p role="status">Checking your session.</p>;
  }

  if (session.data) {
    return <Navigate replace to={defaultCallbackUrl} />;
  }

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
      <title>Sign in — Adam Belton</title>
      <meta
        content="Sign in to use available product workspaces on AdamBelton.com."
        name="description"
      />
      <meta content="noindex" name="robots" />
      <Breadcrumbs items={[{ label: "Log in" }]} />
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
        id="login-title"
      >
        Sign in
      </h1>
      <Prose className="mt-6">
        Enter your email to receive a secure magic link.
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
