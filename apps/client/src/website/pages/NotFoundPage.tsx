import { Breadcrumbs, Prose, TextLink } from "apps/client/src/ui/components";

export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title">
      <Breadcrumbs items={[{ label: "Not found" }]} />
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="not-found-title"
      >
        That page does not exist.
      </h1>
      <Prose className="mt-8">
        <TextLink href="/">Return home</TextLink>
      </Prose>
    </section>
  );
}
