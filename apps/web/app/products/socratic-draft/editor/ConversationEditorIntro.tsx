export function ConversationEditorIntro() {
  return (
    <div className="border-t border-[var(--line)] pt-8">
      <p className="mb-5 text-sm font-semibold uppercase tracking-normal text-[var(--accent)]">
        Demo
      </p>
      <h1
        className="m-0 max-w-4xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl"
        id="editor-title"
      >
        The Socratic Draft editor
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted)]">
        Start with one thought. The current assistant response is still a
        deterministic stub, but this page is wired to the conversation endpoint.
      </p>
    </div>
  );
}
