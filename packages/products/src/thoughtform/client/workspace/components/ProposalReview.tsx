import { useState } from "react";
import {
  REVISION_PROPOSAL_STATES,
  type RevisionProposal,
} from "packages/products/src/thoughtform/shared";
import { WorkspaceButton } from "packages/products/src/thoughtform/client/workspace/components/WorkspaceButton";

export function ProposalReview({
  proposal,
  isBusy,
  onAccept,
  onAmend,
  onReject,
}: {
  proposal: RevisionProposal;
  isBusy: boolean;
  onAccept: () => Promise<void>;
  onAmend: (instruction: string) => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [instruction, setInstruction] = useState("");
  const version = proposal.versions.find((candidate) =>
    candidate.revision === proposal.currentProposalRevision
  );

  if (proposal.state !== REVISION_PROPOSAL_STATES.active || !version) return null;

  return (
    <section className="grid gap-4 rounded border border-[var(--line)] p-4">
      <p><strong>Intended effect:</strong> {version.intendedEffect}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <section><h4 className="font-medium">Current content</h4><pre className="mt-2 whitespace-pre-wrap font-sans">{proposal.originalContent}</pre></section>
        <section><h4 className="font-medium">Proposed content</h4><pre className="mt-2 whitespace-pre-wrap font-sans">{version.proposedContent}</pre></section>
      </div>
      <div className="flex flex-wrap gap-3">
        <WorkspaceButton disabled={isBusy} onClick={onAccept} type="button">Accept proposal</WorkspaceButton>
        <WorkspaceButton disabled={isBusy} onClick={onReject} type="button" variant="secondary">Reject</WorkspaceButton>
      </div>
      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void onAmend(instruction);
        }}
      >
        <label className="font-medium" htmlFor="proposal-amendment">Request an amendment</label>
        <textarea className="field-control p-3" id="proposal-amendment" onChange={(event) => setInstruction(event.target.value)} rows={2} value={instruction} />
        <WorkspaceButton disabled={isBusy || !instruction.trim()} variant="secondary">Amend proposal</WorkspaceButton>
      </form>
    </section>
  );
}
