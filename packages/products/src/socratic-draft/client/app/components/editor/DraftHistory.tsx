import { useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import type {
  Draft,
  DraftRevision,
} from "packages/products/src/socratic-draft/shared";

export function DraftHistory({
  draft,
  revisions,
  onClose,
  onRestore,
}: {
  draft: Draft;
  revisions: DraftRevision[];
  onClose: () => void;
  onRestore: (revision: number) => Promise<void>;
}) {
  const ordered = [...revisions].sort((left, right) => left.revision - right.revision);
  const [previewRevision, setPreviewRevision] = useState<number>(draft.currentRevision);
  const preview = revisions.find((revision) =>
    revision.revision === previewRevision
  );
  const previewIndex = ordered.findIndex((revision) =>
    revision.revision === previewRevision
  );

  return (
    <ModalOverlay
      className="fixed inset-0 z-20 bg-black/20"
      isDismissable
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal className="ml-auto h-full w-full max-w-md overflow-y-auto border-l border-[var(--line)] bg-[var(--background)] p-6 shadow-xl">
        <Dialog aria-label="Draft revision history" className="outline-none">
      <header className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Revision history</h3>
        <button onClick={onClose} type="button">Close</button>
      </header>
      <ol className="mt-5 grid gap-3">
        {[...revisions].reverse().map((revision) => (
          <li key={revision.revision}>
            <button
              className="w-full rounded border border-[var(--line)] p-3 text-left"
              onClick={() => setPreviewRevision(revision.revision)}
              type="button"
            >
              <strong>Revision {revision.revision}</strong>
              {revision.revision === draft.currentRevision ? " — Current" : ""}
              <br />
              <span className="text-sm">
                {revision.source.replaceAll("_", " ")} ·{" "}
                {new Date(revision.createdAt).toLocaleString()}
              </span>
              {revision.proposalId ? <><br /><span className="text-sm">Accepted proposal {revision.proposalId}</span></> : null}
              {revision.restoredFromRevision !== null ? <><br /><span className="text-sm">Restored from revision {revision.restoredFromRevision}</span></> : null}
            </button>
          </li>
        ))}
      </ol>
      {preview ? (
        <section className="mt-6 grid gap-3" aria-label={`Preview revision ${preview.revision}`}>
          <h4 className="font-semibold">Preview revision {preview.revision}</h4>
          <nav aria-label="Revision preview navigation" className="flex gap-3">
            <button
              disabled={previewIndex <= 0}
              onClick={() => setPreviewRevision(ordered[previewIndex - 1]!.revision)}
              type="button"
            >
              Previous revision
            </button>
            <button
              disabled={previewIndex < 0 || previewIndex >= ordered.length - 1}
              onClick={() => setPreviewRevision(ordered[previewIndex + 1]!.revision)}
              type="button"
            >
              Next revision
            </button>
          </nav>
          <pre className="whitespace-pre-wrap font-sans">{preview.body}</pre>
          {preview.revision !== draft.currentRevision ? (
            <>
              <details>
                <summary>Compare with current</summary>
                <div className="mt-3 grid gap-3">
                  <section><h5 className="font-medium">This version</h5><pre className="whitespace-pre-wrap font-sans">{preview.body}</pre></section>
                  <section><h5 className="font-medium">Current draft</h5><pre className="whitespace-pre-wrap font-sans">{draft.body}</pre></section>
                </div>
              </details>
              <p className="text-sm">
                Restoring creates a new revision and retains all later history.
              </p>
              <button
                className="w-fit border border-[var(--foreground)] px-4 py-2"
                onClick={() => onRestore(preview.revision)}
                type="button"
              >
                Restore this version
              </button>
            </>
          ) : null}
        </section>
      ) : null}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
