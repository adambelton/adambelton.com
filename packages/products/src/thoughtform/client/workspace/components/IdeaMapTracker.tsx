import { useState } from "react";
import {
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  type Idea,
  type IdeaActionRequest,
  type IdeaMap,
  type IdeaDisposition,
} from "packages/products/src/thoughtform/shared";

interface IdeaMapTrackerProps {
  ideaMap: IdeaMap;
  isBusy: boolean;
  onAction: (ideaId: string, request: IdeaActionRequest) => Promise<boolean>;
}

const IDEA_EXPLORATION_LABELS = {
  emerging: "Emerging",
  developing: "Developing",
  well_explored: "Well explored",
} as const;

const IDEA_IMPORTANCE_LABELS = {
  background: "Appears to be background context",
  supporting: "Appears to be supporting",
  central: "Appears to be central",
} as const;

export function IdeaMapTracker({ ideaMap, isBusy, onAction }: IdeaMapTrackerProps) {
  if (ideaMap.ideas.length === 0) return null;

  return (
    <section aria-labelledby="idea-map-title" aria-busy={isBusy} className="border-y border-[var(--line)] py-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold" id="idea-map-title">Idea map</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          A negotiable record of what you have explored. Assessments are qualitative, not objective scores.
        </p>
      </div>
      {(ideaMap.potentialConflicts ?? []).length > 0 ? (
        <section aria-labelledby="potential-conflicts-title" className="mb-5 border border-[var(--line)] p-4">
          <h3 className="font-semibold" id="potential-conflicts-title">Potential conflicts</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Explored material that may pull in incompatible directions. These are distinct from open questions and remain provisional until you resolve them.
          </p>
          <div className="mt-3 grid gap-3">
            {(ideaMap.potentialConflicts ?? []).map((conflict) => (
              <article className="border-t border-[var(--line)] pt-3" key={conflict.id}>
                <h4 className="font-medium">{conflict.summary}</h4>
                <p className="mt-1 text-sm">{conflict.explanation}</p>
                {conflict.draftChange ? (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Saved edit: revision {conflict.draftChange.fromRevision} to {conflict.draftChange.toRevision}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <div className="grid gap-3">
        {ideaMap.ideas.map((idea) => (
          <IdeaRow
            idea={idea}
            ideaMapRevision={ideaMap.revision}
            isBusy={isBusy}
            key={idea.id}
            onAction={onAction}
          />
        ))}
      </div>
    </section>
  );
}

interface IdeaRowProps {
  idea: Idea;
  ideaMapRevision: number;
  isBusy: boolean;
  onAction: IdeaMapTrackerProps["onAction"];
}

function IdeaRow({
  idea,
  ideaMapRevision,
  isBusy,
  onAction,
}: IdeaRowProps) {
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correction, setCorrection] = useState(idea.userInterpretation ?? "");
  const action = (nextAction: IdeaActionRequest["action"]) =>
    onAction(idea.id, { action: nextAction, expectedRevision: ideaMapRevision });

  return (
    <details className="rounded border border-[var(--line)] bg-white/30 px-4 py-3">
      <summary className="cursor-pointer">
        <span className="font-medium">{idea.title}</span>
        <span className="ml-2 text-sm text-[var(--muted)]">{idea.disposition}</span>
      </summary>
      <div className="mt-4 grid gap-4 text-sm leading-6">
        <div>
          <h3 className="font-medium">Synthesis</h3>
          <p className="mt-1 whitespace-pre-wrap">{idea.synthesis}</p>
        </div>
        <details>
          <summary className="cursor-pointer font-medium">View substance</summary>
          <p className="mt-2 whitespace-pre-wrap">{idea.substance}</p>
        </details>
        <div>
          <h3 className="font-medium">Assistant assessment</h3>
          <p>{IDEA_EXPLORATION_LABELS[idea.assistantAssessment.exploration]}. {IDEA_IMPORTANCE_LABELS[idea.assistantAssessment.importance]}.</p>
        </div>
        {idea.userInterpretation ? (
          <div>
            <h3 className="font-medium">Your interpretation</h3>
            <p>{idea.userInterpretation}</p>
          </div>
        ) : null}
        {idea.unresolvedQuestions.length > 0 ? (
          <div>
            <h3 className="font-medium">Unresolved questions</h3>
            <ul className="mt-1 list-disc pl-5">
              {idea.unresolvedQuestions.map((question) => <li key={question}>{question}</li>)}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {idea.disposition !== IDEA_DISPOSITIONS.focused ? <ActionButton disabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.focus)}>Focus</ActionButton> : null}
          {idea.disposition !== IDEA_DISPOSITIONS.satisfied ? <ActionButton disabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.satisfy)}>Satisfied for now</ActionButton> : null}
          {idea.disposition !== IDEA_DISPOSITIONS.parked ? <ActionButton disabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.park)}>Park</ActionButton> : null}
          {idea.disposition !== IDEA_DISPOSITIONS.dismissed ? <ActionButton disabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.dismiss)}>Dismiss</ActionButton> : null}
          {REOPENABLE_IDEA_DISPOSITIONS.has(idea.disposition) ? <ActionButton disabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.reopen)}>Reopen</ActionButton> : null}
          <ActionButton disabled={isBusy} onClick={() => setIsCorrecting((current) => !current)}>Correct</ActionButton>
        </div>
        {isCorrecting ? (
          <form
            className="grid gap-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const saved = await onAction(idea.id, {
                action: IDEA_ACTION_TYPES.correct,
                expectedRevision: ideaMapRevision,
                userInterpretation: correction,
              });
              if (saved) setIsCorrecting(false);
            }}
          >
            <label className="font-medium" htmlFor={`idea-correction-${idea.id}`}>Your interpretation</label>
            <textarea id={`idea-correction-${idea.id}`} onChange={(event) => setCorrection(event.target.value)} rows={3} value={correction} />
            <button className="w-fit underline" disabled={isBusy || correction.trim().length === 0} type="submit">Save correction</button>
          </form>
        ) : null}
      </div>
    </details>
  );
}

const REOPENABLE_IDEA_DISPOSITIONS = new Set<IdeaDisposition>([
  IDEA_DISPOSITIONS.satisfied,
  IDEA_DISPOSITIONS.parked,
  IDEA_DISPOSITIONS.dismissed,
]);

interface ActionButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}

function ActionButton({ children, disabled, onClick }: ActionButtonProps) {
  return <button className="underline decoration-[var(--line)] underline-offset-4" disabled={disabled} onClick={onClick} type="button">{children}</button>;
}
