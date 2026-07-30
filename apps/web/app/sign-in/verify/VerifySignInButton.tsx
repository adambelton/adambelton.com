"use client";

import { useState } from "react";
import { magicLinkVerifyPath } from "packages/auth/src/routes";

export function VerifySignInButton() {
  const [isCompleting, setIsCompleting] = useState(false);

  function handleVerify() {
    setIsCompleting(true);
    window.location.assign(`${magicLinkVerifyPath}${window.location.search}`);
  }

  return (
    <button
      className="w-fit border border-[var(--foreground)] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)] disabled:hover:bg-transparent disabled:hover:text-[var(--muted)]"
      disabled={isCompleting}
      onClick={handleVerify}
      type="button"
    >
      {isCompleting ? "Completing..." : "Complete sign in"}
    </button>
  );
}
