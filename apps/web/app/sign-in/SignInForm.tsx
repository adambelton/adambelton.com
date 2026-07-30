"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { magicLinkSignInPath } from "packages/auth/src/routes";

type SignInStatus = "idle" | "sending" | "sent";

const defaultCallbackUrl = "/products";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignInStatus>("idle");
  const [error, setError] = useState<string | null>(null);

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
    <form className="grid max-w-md gap-4" onSubmit={handleSubmit}>
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
      <button
        className="w-fit border border-[var(--foreground)] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)] disabled:hover:bg-transparent disabled:hover:text-[var(--muted)]"
        disabled={!canSubmit}
        type="submit"
      >
        {status === "sending" ? "Sending..." : "Send sign-in link"}
      </button>
    </form>
  );
}
