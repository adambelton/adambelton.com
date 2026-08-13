import { useId, useState } from "react";
import { WorkspaceButton } from "packages/products/src/thoughtform/client/workspace/components/WorkspaceButton";
import {
  IDEA_ACTION_TYPES,
  IDEA_DISPOSITIONS,
  IDEA_STRUCTURE_COMMAND_TYPES,
  IDEA_STRUCTURE_CHANGE_SOURCES,
  IDEA_STRUCTURE_OPERATION_TYPES,
  type Idea,
  type IdeaActionRequest,
  type IdeaStructureCommandRequest,
  type IdeaMap,
  type IdeaDisposition,
} from "packages/products/src/thoughtform/shared";

interface IdeaMapTrackerProps {
  ideaMap: IdeaMap;
  isBusy: boolean;
  onAction: (ideaId: string, request: IdeaActionRequest) => Promise<boolean>;
  onStructure: (request: IdeaStructureCommandRequest) => Promise<boolean>;
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

const IDEA_MAP_COPY = {
  title: "Idea map",
  description: "A negotiable record of what you have explored. Assessments are qualitative, not objective scores.",
  structure: {
    title: "Idea map reorganised",
    userSource: "You reorganised these ideas.",
    assistantSource: "ThoughtForm reorganised these ideas from the established material.",
    mergeOutcome: "Related ideas were merged.",
    splitOutcome: "One idea was split into clearer parts.",
    undoGuidance: "You can undo this interpretation if it does not fit.",
    undoAction: "Undo reorganisation",
  },
  conflicts: {
    title: "Potential conflicts",
    description: "Explored material that may pull in incompatible directions. These are distinct from open questions and remain provisional until you resolve them.",
    savedEdit: (fromRevision: number, toRevision: number) =>
      `Saved edit: revision ${fromRevision} to ${toRevision}`,
  },
  idea: {
    synthesis: "Synthesis",
    viewSubstance: "View substance",
    assistantAssessment: "Assistant assessment",
    userInterpretation: "Your interpretation",
    unresolvedQuestions: "Unresolved questions",
    actions: {
      focus: "Focus",
      satisfy: "Satisfied for now",
      park: "Park",
      dismiss: "Dismiss",
      reopen: "Reopen",
      correct: "Correct",
      split: "Split",
      saveCorrection: "Save correction",
    },
  },
  split: {
    title: "Split this idea",
    guidance: "Keep the complete existing substance across the two parts. The first part keeps this idea’s identity and your interpretation.",
    firstTitle: "First title",
    firstSynthesis: "First synthesis",
    firstSubstance: "First substance",
    secondTitle: "Second title",
    secondSynthesis: "Second synthesis",
    secondSubstance: "Second substance",
    explanation: "Why these are distinct",
    saveAction: "Save split",
  },
  merge: {
    title: "Merge overlapping ideas",
    selectionLegend: "Ideas to merge",
    selectionLabel: (title: string) => `Merge ${title}`,
    resultTitle: "Merged title",
    resultSynthesis: "Merged synthesis",
    explanation: "Why these overlap",
    saveAction: "Merge selected ideas",
  },
} as const;

export function IdeaMapTracker({ ideaMap, isBusy, onAction, onStructure }: IdeaMapTrackerProps) {
  if (ideaMap.ideas.length === 0) return null;

  return (
    <section aria-labelledby="idea-map-title" aria-busy={isBusy} className="border-y border-[var(--line)] py-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold" id="idea-map-title">{IDEA_MAP_COPY.title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {IDEA_MAP_COPY.description}
        </p>
      </div>
      {ideaMap.structuralChange && (
        <aside className="mb-5 border border-[var(--line)] p-4" aria-labelledby="idea-structure-change-title">
          <h3 className="font-semibold" id="idea-structure-change-title">{IDEA_MAP_COPY.structure.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {ideaMap.structuralChange.source === IDEA_STRUCTURE_CHANGE_SOURCES.user
              ? IDEA_MAP_COPY.structure.userSource
              : IDEA_MAP_COPY.structure.assistantSource}
          </p>
          <p className="mt-1 text-sm">{ideaMap.structuralChange.explanation}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {ideaMap.structuralChange.type === IDEA_STRUCTURE_OPERATION_TYPES.merge
              ? IDEA_MAP_COPY.structure.mergeOutcome
              : IDEA_MAP_COPY.structure.splitOutcome} {IDEA_MAP_COPY.structure.undoGuidance}
          </p>
          <WorkspaceButton
            className="mt-3"
            disabled={isBusy}
            onClick={() => onStructure({ type: IDEA_STRUCTURE_COMMAND_TYPES.undo, expectedRevision: ideaMap.revision })}
            type="button"
            variant="secondary"
          >
            {IDEA_MAP_COPY.structure.undoAction}
          </WorkspaceButton>
        </aside>
      )}
      {(ideaMap.potentialConflicts ?? []).length > 0 && (
        <section aria-labelledby="potential-conflicts-title" className="mb-5 border border-[var(--line)] p-4">
          <h3 className="font-semibold" id="potential-conflicts-title">{IDEA_MAP_COPY.conflicts.title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {IDEA_MAP_COPY.conflicts.description}
          </p>
          <div className="mt-3 grid gap-3">
            {(ideaMap.potentialConflicts ?? []).map((conflict) => (
              <article className="border-t border-[var(--line)] pt-3" key={conflict.id}>
                <h4 className="font-medium">{conflict.summary}</h4>
                <p className="mt-1 text-sm">{conflict.explanation}</p>
                {conflict.draftChange ? (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {IDEA_MAP_COPY.conflicts.savedEdit(
                      conflict.draftChange.fromRevision,
                      conflict.draftChange.toRevision,
                    )}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}
      <div className="grid gap-3">
        {ideaMap.ideas.map((idea) => (
          <IdeaRow
            idea={idea}
            ideaMapRevision={ideaMap.revision}
            isBusy={isBusy}
            key={idea.id}
            onAction={onAction}
            onStructure={onStructure}
          />
        ))}
      </div>
      <MergeIdeasControl
        ideas={ideaMap.ideas}
        ideaMapRevision={ideaMap.revision}
        isBusy={isBusy}
        onStructure={onStructure}
      />
    </section>
  );
}

interface IdeaRowProps {
  idea: Idea;
  ideaMapRevision: number;
  isBusy: boolean;
  onAction: IdeaMapTrackerProps["onAction"];
  onStructure: IdeaMapTrackerProps["onStructure"];
}

function IdeaRow({
  idea,
  ideaMapRevision,
  isBusy,
  onAction,
  onStructure,
}: IdeaRowProps) {
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [correction, setCorrection] = useState(idea.userInterpretation ?? "");
  const [isSplitting, setIsSplitting] = useState(false);
  const [split, setSplit] = useState(() => initialSplit(idea));
  const action = (nextAction: IdeaActionRequest["action"]) =>
    onAction(idea.id, { action: nextAction, expectedRevision: ideaMapRevision });

  return (
    <details
      className="rounded border border-[var(--line)] bg-white/30 px-4 py-3"
      onToggle={(event) => setIsExpanded(event.currentTarget.open)}
      open={isExpanded}
    >
      <summary className="cursor-pointer">
        <span className="font-medium">{idea.title}</span>
        <span className="ml-2 text-sm text-[var(--muted)]">{idea.disposition}</span>
      </summary>
      <div className="mt-4 grid gap-4 text-sm leading-6">
        <div>
          <h3 className="font-medium">{IDEA_MAP_COPY.idea.synthesis}</h3>
          <p className="mt-1 whitespace-pre-wrap">{idea.synthesis}</p>
        </div>
        <details>
          <summary className="cursor-pointer font-medium">{IDEA_MAP_COPY.idea.viewSubstance}</summary>
          <p className="mt-2 whitespace-pre-wrap">{idea.substance}</p>
        </details>
        <div>
          <h3 className="font-medium">{IDEA_MAP_COPY.idea.assistantAssessment}</h3>
          <p>{IDEA_EXPLORATION_LABELS[idea.assistantAssessment.exploration]}. {IDEA_IMPORTANCE_LABELS[idea.assistantAssessment.importance]}.</p>
        </div>
        {idea.userInterpretation ? (
          <div>
            <h3 className="font-medium">{IDEA_MAP_COPY.idea.userInterpretation}</h3>
            <p>{idea.userInterpretation}</p>
          </div>
        ) : null}
        {idea.unresolvedQuestions.length > 0 ? (
          <div>
            <h3 className="font-medium">{IDEA_MAP_COPY.idea.unresolvedQuestions}</h3>
            <ul className="mt-1 list-disc pl-5">
              {idea.unresolvedQuestions.map((question) => <li key={question}>{question}</li>)}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {idea.disposition !== IDEA_DISPOSITIONS.focused ? <ActionButton isDisabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.focus)}>{IDEA_MAP_COPY.idea.actions.focus}</ActionButton> : null}
          {idea.disposition !== IDEA_DISPOSITIONS.satisfied ? <ActionButton isDisabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.satisfy)}>{IDEA_MAP_COPY.idea.actions.satisfy}</ActionButton> : null}
          {idea.disposition !== IDEA_DISPOSITIONS.parked ? <ActionButton isDisabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.park)}>{IDEA_MAP_COPY.idea.actions.park}</ActionButton> : null}
          {idea.disposition !== IDEA_DISPOSITIONS.dismissed ? <ActionButton isDisabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.dismiss)}>{IDEA_MAP_COPY.idea.actions.dismiss}</ActionButton> : null}
          {REOPENABLE_IDEA_DISPOSITIONS.has(idea.disposition) ? <ActionButton isDisabled={isBusy} onClick={() => action(IDEA_ACTION_TYPES.reopen)}>{IDEA_MAP_COPY.idea.actions.reopen}</ActionButton> : null}
          <ActionButton isDisabled={isBusy} onClick={() => setIsCorrecting((isCurrent) => !isCurrent)}>{IDEA_MAP_COPY.idea.actions.correct}</ActionButton>
          <ActionButton isDisabled={isBusy} onClick={() => setIsSplitting((current) => !current)}>{IDEA_MAP_COPY.idea.actions.split}</ActionButton>
        </div>
        {isCorrecting ? (
          <form
            className="grid gap-2"
            onSubmit={async (event) => {
              event.preventDefault();
              const wasCorrectionSaved = await onAction(idea.id, {
                action: IDEA_ACTION_TYPES.correct,
                expectedRevision: ideaMapRevision,
                userInterpretation: correction,
              });
              if (wasCorrectionSaved) setIsCorrecting(false);
            }}
          >
            <label className="font-medium" htmlFor={`idea-correction-${idea.id}`}>{IDEA_MAP_COPY.idea.userInterpretation}</label>
            <textarea className="field-control p-3" id={`idea-correction-${idea.id}`} onChange={(event) => setCorrection(event.target.value)} rows={3} value={correction} />
            <WorkspaceButton disabled={isBusy || correction.trim().length === 0} type="submit">{IDEA_MAP_COPY.idea.actions.saveCorrection}</WorkspaceButton>
          </form>
        ) : null}
        {isSplitting ? (
          <form
            className="grid gap-3 border-t border-[var(--line)] pt-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const saved = await onStructure({
                type: IDEA_STRUCTURE_OPERATION_TYPES.split,
                expectedRevision: ideaMapRevision,
                ideaId: idea.id,
                explanation: split.explanation,
                results: [
                  {
                    title: split.firstTitle,
                    synthesis: split.firstSynthesis,
                    substance: split.firstSubstance,
                    unresolvedQuestions: idea.unresolvedQuestions,
                    assistantAssessment: idea.assistantAssessment,
                  },
                  {
                    title: split.secondTitle,
                    synthesis: split.secondSynthesis,
                    substance: split.secondSubstance,
                    unresolvedQuestions: [],
                    assistantAssessment: idea.assistantAssessment,
                  },
                ],
              });
              if (saved) setIsSplitting(false);
            }}
          >
            <h3 className="font-medium">{IDEA_MAP_COPY.split.title}</h3>
            <p className="text-[var(--muted)]">{IDEA_MAP_COPY.split.guidance}</p>
            <StructureField label={IDEA_MAP_COPY.split.firstTitle} onChange={(value) => setSplit((current) => ({ ...current, firstTitle: value }))} value={split.firstTitle} />
            <StructureField label={IDEA_MAP_COPY.split.firstSynthesis} onChange={(value) => setSplit((current) => ({ ...current, firstSynthesis: value }))} value={split.firstSynthesis} />
            <StructureField label={IDEA_MAP_COPY.split.firstSubstance} multiline onChange={(value) => setSplit((current) => ({ ...current, firstSubstance: value }))} value={split.firstSubstance} />
            <StructureField label={IDEA_MAP_COPY.split.secondTitle} onChange={(value) => setSplit((current) => ({ ...current, secondTitle: value }))} value={split.secondTitle} />
            <StructureField label={IDEA_MAP_COPY.split.secondSynthesis} onChange={(value) => setSplit((current) => ({ ...current, secondSynthesis: value }))} value={split.secondSynthesis} />
            <StructureField label={IDEA_MAP_COPY.split.secondSubstance} multiline onChange={(value) => setSplit((current) => ({ ...current, secondSubstance: value }))} value={split.secondSubstance} />
            <StructureField label={IDEA_MAP_COPY.split.explanation} onChange={(value) => setSplit((current) => ({ ...current, explanation: value }))} value={split.explanation} />
            <WorkspaceButton disabled={isBusy || !completeSplit(split)} type="submit">{IDEA_MAP_COPY.split.saveAction}</WorkspaceButton>
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
  isDisabled: boolean;
  onClick: () => void;
}

function ActionButton({ children, isDisabled, onClick }: ActionButtonProps) {
  return <WorkspaceButton disabled={isDisabled} onClick={onClick} type="button" variant="secondary">{children}</WorkspaceButton>;
}

function MergeIdeasControl(input: {
  ideas: Idea[];
  ideaMapRevision: number;
  isBusy: boolean;
  onStructure: IdeaMapTrackerProps["onStructure"];
}) {
  const eligible = input.ideas;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [synthesis, setSynthesis] = useState("");
  const [explanation, setExplanation] = useState("");
  if (eligible.length < 2) return null;
  const first = eligible.find((idea) => selectedIds.includes(idea.id));
  return (
    <details className="mt-5 border border-[var(--line)] p-4">
      <summary className="cursor-pointer font-medium">{IDEA_MAP_COPY.merge.title}</summary>
      <form
        className="mt-4 grid gap-3 text-sm"
        onSubmit={async (event) => {
          event.preventDefault();
          const saved = await input.onStructure({
            type: IDEA_STRUCTURE_OPERATION_TYPES.merge,
            expectedRevision: input.ideaMapRevision,
            ideaIds: selectedIds,
            result: {
              title,
              synthesis,
              assistantAssessment: first?.assistantAssessment ?? eligible[0]!.assistantAssessment,
            },
            explanation,
          });
          if (saved) {
            setSelectedIds([]);
            setTitle("");
            setSynthesis("");
            setExplanation("");
          }
        }}
      >
        <fieldset className="grid gap-2">
          <legend className="font-medium">{IDEA_MAP_COPY.merge.selectionLegend}</legend>
          {eligible.map((idea) => (
            <label className="flex gap-2" key={idea.id}>
              <input
                checked={selectedIds.includes(idea.id)}
                disabled={input.isBusy}
                onChange={(event) => setSelectedIds((current) => event.target.checked
                  ? [...current, idea.id]
                  : current.filter((id) => id !== idea.id))}
                type="checkbox"
              />
              {IDEA_MAP_COPY.merge.selectionLabel(idea.title)}
            </label>
          ))}
        </fieldset>
        <StructureField label={IDEA_MAP_COPY.merge.resultTitle} onChange={setTitle} value={title} />
        <StructureField label={IDEA_MAP_COPY.merge.resultSynthesis} onChange={setSynthesis} value={synthesis} />
        <StructureField label={IDEA_MAP_COPY.merge.explanation} onChange={setExplanation} value={explanation} />
        <WorkspaceButton disabled={input.isBusy || selectedIds.length < 2 || !title.trim() || !synthesis.trim() || !explanation.trim()} type="submit">{IDEA_MAP_COPY.merge.saveAction}</WorkspaceButton>
      </form>
    </details>
  );
}

function StructureField(input: {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <label className="grid gap-1" htmlFor={id}>
      <span className="font-medium">{input.label}</span>
      {input.multiline
        ? <textarea className="field-control p-3" id={id} onChange={(event) => input.onChange(event.target.value)} rows={3} value={input.value} />
        : <input className="field-control p-3" id={id} onChange={(event) => input.onChange(event.target.value)} value={input.value} />}
    </label>
  );
}

function initialSplit(idea: Idea) {
  const middle = Math.max(1, Math.floor(idea.substance.length / 2));
  const boundary = idea.substance.indexOf(" ", middle);
  const splitAt = boundary === -1 ? middle : boundary;
  return {
    firstTitle: idea.title,
    firstSynthesis: idea.synthesis,
    firstSubstance: idea.substance.slice(0, splitAt).trim(),
    secondTitle: "",
    secondSynthesis: "",
    secondSubstance: idea.substance.slice(splitAt).trim(),
    explanation: "",
  };
}

function completeSplit(split: ReturnType<typeof initialSplit>) {
  return Object.values(split).every((value) => value.trim().length > 0);
}
