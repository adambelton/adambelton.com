import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import type { ApiResponse, ThoughtFormOperationsOverview } from "packages/shared/src";
import { useAuthSession } from "apps/client/src/auth";
import { Breadcrumbs, Button, Prose } from "apps/client/src/ui/components";

export function ThoughtFormOperationsPage() {
  const session = useAuthSession();
  const [overview, setOverview] = useState<ThoughtFormOperationsOverview | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session.data?.user.isOwner) return;
    setIsLoading(true);
    void fetch(`/api/admin/thoughtform/operations${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`)
      .then(async (response) => ({ response, payload: await response.json() as ApiResponse<ThoughtFormOperationsOverview> }))
      .then(({ response, payload }) => {
        if (!response.ok || !payload.ok) throw new Error(payload.ok ? "Operations unavailable." : payload.error.message);
        setOverview(payload.data);
        setError(null);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Operations unavailable."))
      .finally(() => setIsLoading(false));
  }, [cursor, session.data?.user.isOwner]);

  if (!session.isPending && !session.data?.user.isOwner) return <Navigate replace to="/" />;
  return (
    <section aria-labelledby="operations-title">
      <Breadcrumbs items={[{ label: "ThoughtForm operations" }]} />
      <h1 className="m-0 text-5xl font-semibold" id="operations-title">ThoughtForm operations</h1>
      <Prose className="mt-5">Content-free operational metadata for the product demo.</Prose>
      {isLoading && <p aria-live="polite">Loading operations…</p>}
      {error && <p role="alert">{error}</p>}
      {overview && !isLoading && <>
        <section aria-labelledby="global-title" className="mt-10">
          <h2 id="global-title">Current UTC day</h2>
          <p>{overview.currentGlobal.operations.toLocaleString()} operations · {overview.currentGlobal.tokens.toLocaleString()} tokens</p>
          <p>Resets {new Date(overview.currentGlobal.resetsAt).toLocaleString()}.</p>
        </section>
        <section aria-labelledby="accounts-title" className="mt-10">
          <h2 id="accounts-title">Accounts</h2>
          {overview.accounts.length === 0 ? <p>No accounts are available.</p> : (
            <div className="grid gap-5">
              {overview.accounts.map((account) => <article className="border-t border-[var(--line)] pt-4" key={account.email}>
                <h3>{account.email}</h3>
                <p>Most recent operation: {account.latestOperationAt ? new Date(account.latestOperationAt).toLocaleString() : "No hosted operations"}</p>
                <p>Today: {account.current.operations} operations · {account.current.tokens.toLocaleString()} tokens</p>
                <p>{account.current.isExempt ? "Owner personal allowance exempt" : `${account.current.operationsRemaining} operations and ${account.current.tokensRemaining?.toLocaleString()} tokens remain`}</p>
                <p>Retained 90 days: {account.retained.operations} operations · {account.retained.tokens.toLocaleString()} tokens</p>
                <p>Failures: provider {account.retained.outcomes.providerFailed}, persistence {account.retained.outcomes.persistenceFailed}, interrupted {account.retained.outcomes.interrupted}</p>
                <p>Models: {account.retainedModels.length ? account.retainedModels.map((model) => model.model ?? "Unknown").join(", ") : "No model recorded"}</p>
              </article>)}
            </div>
          )}
          {overview.nextCursor && <Button className="mt-6" onClick={() => setCursor(overview.nextCursor)}>Next 25 accounts</Button>}
        </section>
      </>}
    </section>
  );
}
