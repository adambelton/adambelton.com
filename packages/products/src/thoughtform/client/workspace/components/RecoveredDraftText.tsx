import { WorkspaceButton } from "packages/products/src/thoughtform/client/workspace/components/WorkspaceButton";

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
        className="field-control min-h-40 w-full resize-y p-4 leading-7"
        id="recovered-draft-text"
        onChange={(event) => onChange(event.target.value)}
        value={body}
      />
      <WorkspaceButton onClick={onClear} type="button" variant="secondary">
        Clear recovered text
      </WorkspaceButton>
    </aside>
  );
}
