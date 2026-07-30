"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  basePath: "/auth",
});

export function LogoutEffect() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function signOut() {
      const result = await authClient.signOut();

      if (!isMounted) {
        return;
      }

      if (result.error) {
        setError("Could not log out. Refresh and try again.");
        return;
      }

      window.location.replace("/");
    }

    void signOut();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!error) {
    return null;
  }

  return (
    <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)]">
      {error}
    </p>
  );
}
