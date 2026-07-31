import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Prose } from "apps/client/src/components";
import { useAuthSession } from "apps/client/src/auth/session";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const session = useAuthSession();

  if (session.isPending) {
    return (
      <section aria-labelledby="loading-title">
        <h1
          className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
          id="loading-title"
        >
          Checking access.
        </h1>
        <Prose className="mt-8">Loading your session.</Prose>
      </section>
    );
  }

  if (!session.data) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to="/login"
      />
    );
  }

  return children;
}
