export function ConversationEditorIntro() {
  return (
    <div>
      <h1
        className="m-0 max-w-none text-3xl font-semibold leading-tight tracking-normal lg:max-w-3xl"
        id="editor-title"
      >
        What would you like to think through?
      </h1>
      <p className="mt-[min(0.75rem,2vh)] max-w-none text-base leading-[min(1.75rem,4vh)] text-[var(--muted)] lg:max-w-2xl">
        Explore a question, experience, decision, or idea. Your conversation and
        idea map can stand on their own; create a Draft only when expressing the
        current shape would be useful.
      </p>
    </div>
  );
}
