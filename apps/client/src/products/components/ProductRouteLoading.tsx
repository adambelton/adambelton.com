export function ProductRouteLoading() {
  return (
    <section aria-labelledby="product-loading-title" aria-live="polite">
      <h1
        className="m-0 max-w-4xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-8xl"
        id="product-loading-title"
      >
        Loading product.
      </h1>
      <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)]" role="status">
        Preparing the product interface.
      </p>
    </section>
  );
}
