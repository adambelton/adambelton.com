import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { ProductAppComponents } from "packages/products/src/thoughtform/client/product-app-components";
import { TextLink } from "packages/products/src/thoughtform/client/ui/TextLink";
import { AiProcessingDisclosureLoader } from "packages/products/src/thoughtform/client/workspace/components/AiProcessingDisclosureLoader";
import { WorkspaceButton } from "packages/products/src/thoughtform/client/workspace/components/WorkspaceButton";
import { LeaveWorkspaceLink } from "packages/products/src/thoughtform/client/workspace/components/LeaveWorkspaceLink";

type PrivacyAcknowledgementProps = {
  components: ProductAppComponents;
  onAcknowledge: () => void;
};

export function PrivacyAcknowledgement({
  components: { Link },
  onAcknowledge,
}: PrivacyAcknowledgementProps) {
  const acknowledgementId = useId();
  const [isChecked, setIsChecked] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isChecked) {
      onAcknowledge();
    }
  }

  return (
    <section
      aria-labelledby="privacy-acknowledgement-title"
      className="h-full overflow-y-auto"
      data-testid="privacy-acknowledgement"
    >
      <div
        className="mx-auto grid min-h-full w-full max-w-4xl content-center py-[min(1rem,2vh)]"
        data-testid="privacy-acknowledgement-content"
      >
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-normal sm:text-7xl"
        id="privacy-acknowledgement-title"
      >
        Before you begin
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)]">
        ThoughtForm is a private thinking workspace, but this temporary demo is
        not a confidential service. Review how it works before continuing.
      </p>
      <div className="mt-8 grid max-w-4xl gap-4 text-[var(--muted)] sm:grid-cols-3">
        <AiProcessingDisclosureLoader Link={Link} />
        <section className="border border-[var(--line)] p-4" aria-labelledby="temporary-storage-title">
          <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]" id="temporary-storage-title">Temporary storage</h2>
          <p className="mt-2 text-sm leading-6">Your workspace is held in application memory for no more than 24 hours. A restart or deployment may remove it sooner, and you can clear it at any time.</p>
        </section>
        <section className="border border-[var(--line)] p-4" aria-labelledby="appropriate-use-title">
          <h2 className="m-0 text-lg font-semibold text-[var(--foreground)]" id="appropriate-use-title">Use appropriate information</h2>
          <p className="mt-2 text-sm leading-6">Avoid unnecessary identifying, confidential, or highly sensitive information. This demo is not medical, legal, therapeutic, crisis, or urgent support.</p>
        </section>
      </div>
      <p className="mt-4 max-w-4xl text-sm leading-6 text-[var(--muted)]">
        If you may be in immediate danger, contact local emergency or crisis
        support. Read ThoughtForm&apos;s{" "}
        <TextLink href="/products/thoughtform/privacy" Link={Link}>product privacy information</TextLink>{" "}
        and the site-wide <TextLink href="/privacy" Link={Link}>privacy information</TextLink>.
      </p>
      <form className="mt-6 grid max-w-2xl gap-5 border-t border-[var(--line)] pt-5" onSubmit={handleSubmit}>
        <label className="flex items-start gap-3" htmlFor={acknowledgementId}>
          <input
            checked={isChecked}
            className="mt-1 h-5 w-5"
            id={acknowledgementId}
            onChange={(event) => setIsChecked(event.target.checked)}
            type="checkbox"
          />
          <span className="text-sm leading-6">
            I understand how my messages will be processed and want to open the
            workspace.
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-5">
          <WorkspaceButton
            className="px-5 py-3 text-sm"
            disabled={!isChecked}
            type="submit"
          >
            Open workspace
          </WorkspaceButton>
          <LeaveWorkspaceLink href="/products/thoughtform" Link={Link} />
        </div>
      </form>
      </div>
    </section>
  );
}
