import { useId, useState } from "react";
import type { FormEvent } from "react";
import { ACCESS_LEVELS, type AccessLevel } from "packages/shared/src";
import type { ProductAppComponents } from "packages/products/src/socratic-draft/client/product-app-components";
import { TextLink } from "packages/products/src/socratic-draft/client/ui/TextLink";

type PrivacyAcknowledgementProps = {
  accessLevel: AccessLevel;
  components: ProductAppComponents;
  onAcknowledge: () => void;
};

export function PrivacyAcknowledgement({
  accessLevel,
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
    <section aria-labelledby="privacy-acknowledgement-title">
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl"
        id="privacy-acknowledgement-title"
      >
        Your writing and this demo
      </h1>
      <div className="mt-8 grid max-w-2xl gap-5 text-base leading-7 text-[var(--muted)]">
        <p className="m-0">
          Messages are sent through this site&apos;s server to OpenAI to generate
          a response. OpenAI may retain API content for abuse monitoring under
          its current policies even though this site disables optional response
          storage.
        </p>
        <p className="m-0">
          {accessLevel === ACCESS_LEVELS.owner
            ? "As the site owner, your conversations may be saved in the site's database."
            : "Your current conversation is held temporarily in application memory for no more than 24 hours. It may disappear sooner after a restart or deployment, and you can clear it at any time."}
        </p>
        <p className="m-0">
          This is a portfolio demo, not a confidential professional, medical,
          legal, or therapeutic service. Do not include unnecessary identifying,
          confidential, or highly sensitive information about yourself or anyone
          else.
        </p>
        <p className="m-0">
          Read The Socratic Draft&apos;s{" "}
          <TextLink
            href="/products/socratic-draft/privacy"
            Link={Link}
          >
            product privacy information
          </TextLink>{" "}
          and the site-wide{" "}
          <TextLink href="/privacy" Link={Link}>
            privacy information
          </TextLink>
          . You can also verify the current{" "}
          <TextLink
            href="https://platform.openai.com/docs/models/default-usage-policies-by-endpoint"
            Link={Link}
          >
            OpenAI data controls
          </TextLink>
          .
        </p>
      </div>
      <form className="mt-8 grid max-w-2xl gap-6" onSubmit={handleSubmit}>
        <label className="flex items-start gap-3" htmlFor={acknowledgementId}>
          <input
            checked={isChecked}
            className="mt-1 h-5 w-5"
            id={acknowledgementId}
            onChange={(event) => setIsChecked(event.target.checked)}
            type="checkbox"
          />
          <span className="text-sm leading-6">
            I understand how my writing will be processed and want to open the
            editor.
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-5">
          <button
            className="w-fit border border-[var(--foreground)] px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:text-[var(--muted)]"
            disabled={!isChecked}
            type="submit"
          >
            Open the editor
          </button>
          <TextLink href="/products/socratic-draft" Link={Link}>
            Leave the editor
          </TextLink>
        </div>
      </form>
    </section>
  );
}
