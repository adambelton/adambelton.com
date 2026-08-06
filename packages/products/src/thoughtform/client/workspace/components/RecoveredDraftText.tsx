type RecoveredDraftTextProps = {
  body: string;
  onChange(body: string): void;
  onClear(): void;
};

export function RecoveredDraftText({
  body,
  onChange,
  onClear,
}: RecoveredDraftTextProps) {
  return (
    <aside className="grid gap-3 border border-[var(--line)] p-4" role="status">
      <h2 className="font-semibold">Unsaved Draft text recovered</h2>
      <p className="text-sm text-[var(--muted)]">
        This text is detached from the unavailable workspace. Copy it before
        clearing it; ThoughtForm will not apply it to another workspace.
      </p>
      <label className="sr-only" htmlFor="recovered-draft-text">Recovered Draft text</label>
      <textarea
        className="min-h-40 w-full resize-y border border-[var(--line)] bg-transparent p-4 leading-7"
        id="recovered-draft-text"
        onChange={(event) => onChange(event.target.value)}
        value={body}
      />
      <button className="w-fit underline" onClick={onClear} type="button">
        Clear recovered text
      </button>
    </aside>
  );
}
