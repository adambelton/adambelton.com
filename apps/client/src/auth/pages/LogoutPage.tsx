import { useEffect, useState } from "react";
import { authClient } from "apps/client/src/auth";
import { Breadcrumbs, Prose } from "apps/client/src/ui/components";

export function LogoutPage() {
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

  return (
    <section aria-labelledby="logout-title">
      <Breadcrumbs items={[{ label: "Log out" }]} />
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="logout-title"
      >
        Logging you out.
      </h1>
      <Prose className="mt-8">
        Ending your session.
      </Prose>
      {error ? <Prose className="mt-8">{error}</Prose> : null}
    </section>
  );
}
