import { useState } from "react";
import type { Idea } from "packages/products/src/socratic-draft/shared";

export function ComposeDraft({
  ideas,
  isBusy,
  onCompose,
  submitLabel = "Compose draft",
}: {
  ideas: Idea[];
  isBusy: boolean;
  onCompose: (input: {
    selectedIdeaIds: string[];
    instruction: string;
  }) => Promise<void>;
  submitLabel?: string;
}) {
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<string[]>([]);
  const [instruction, setInstruction] = useState("");

  return (
    <section aria-labelledby="compose-draft-title" className="grid gap-4">
      <div>
        <h2 className="text-lg font-semibold" id="compose-draft-title">Draft</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Choose established ideas. You can deliberately compose something early
          or rough; readiness is advisory.
        </p>
      </div>
      <fieldset className="grid gap-2">
        <legend className="font-medium">Ideas to include</legend>
        {ideas.map((idea) => (
          <label className="flex gap-2" key={idea.id}>
            <input
              checked={selectedIdeaIds.includes(idea.id)}
              onChange={(event) => setSelectedIdeaIds((current) =>
                event.target.checked
                  ? [...current, idea.id]
                  : current.filter((id) => id !== idea.id),
              )}
              type="checkbox"
            />
            {idea.title}
          </label>
        ))}
      </fieldset>
      <label className="grid gap-2">
        <span className="font-medium">Composition direction</span>
        <textarea
          onChange={(event) => setInstruction(event.target.value)}
          placeholder="For example: compose an intentionally rough first draft."
          rows={3}
          value={instruction}
        />
      </label>
      <button
        className="w-fit border border-[var(--foreground)] px-4 py-2"
        disabled={isBusy || selectedIdeaIds.length === 0}
        onClick={() => onCompose({ selectedIdeaIds, instruction })}
        type="button"
      >
        {isBusy ? "Composing…" : submitLabel}
      </button>
    </section>
  );
}
