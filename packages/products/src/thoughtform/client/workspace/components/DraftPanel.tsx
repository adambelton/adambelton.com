import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  DRAFT_ERROR_CODES,
  REVISION_PROPOSAL_SCOPES,
  type DraftChange,
  type DraftOperationResponse,
  type DraftOperationInterpretation,
  type DraftSelection,
  type DraftingState,
  type Idea,
  type WorkspacePersistenceType,
} from "packages/products/src/thoughtform/shared";
import { ComposeDraft } from "packages/products/src/thoughtform/client/workspace/components/ComposeDraft";
import { DraftHistory } from "packages/products/src/thoughtform/client/workspace/components/DraftHistory";
import { ProposalReview } from "packages/products/src/thoughtform/client/workspace/components/ProposalReview";
import { RecoveredDraftText } from "packages/products/src/thoughtform/client/workspace/components/RecoveredDraftText";
import {
  amendDraftProposal,
  composeDraft,
  loadDraft,
  interpretDraftChange,
  proposeDraftRevision,
  resolveDraftProposal,
  restoreDraft,
  saveDraft,
  DraftClientError,
} from "packages/products/src/thoughtform/client/workspace/actions/draft-client";

export interface DraftPanelHandle {
  clearLocalState(): void;
  detachLocalEdits(): void;
  save(): Promise<boolean>;
}

export const DraftPanel = forwardRef<DraftPanelHandle, {
  conversationId: string | null;
  ideas: Idea[];
  isActive: boolean;
  persistenceType: WorkspacePersistenceType;
  onDraftCreated: () => void;
  onAttachSelection: (selection: DraftSelection) => void;
  onDraftInterpretation: (
    interpretation: DraftOperationInterpretation | undefined,
    change: DraftChange | null,
  ) => void;
  onDraftAdvanced: () => void;
  onUnavailable?: () => void;
  hasDraftOffer?: boolean;
  initialWorkspace?: DraftingState | null;
}>(function DraftPanel({
  conversationId,
  ideas,
  isActive,
  persistenceType,
  onDraftCreated,
  onAttachSelection,
  onDraftInterpretation,
  onDraftAdvanced,
  onUnavailable,
  hasDraftOffer = false,
  initialWorkspace = null,
}, ref) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const interpretationRevisionRef = useRef<number | null>(null);
  const [workspace, setWorkspace] = useState<DraftingState | null>(initialWorkspace);
  const [body, setBody] = useState(initialWorkspace?.draft?.body ?? "");
  const [selection, setSelection] = useState<DraftSelection | null>(null);
  const [proposalInstruction, setProposalInstruction] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [detachedBody, setDetachedBody] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false);
      setWorkspace(null);
      setBody("");
      interpretationRevisionRef.current = null;
      return;
    }
    if (initialWorkspace) {
      setIsLoading(false);
      setWorkspace(initialWorkspace);
      setBody(initialWorkspace.draft?.body ?? "");
      return;
    }
    if (!isActive) return;
    let isCurrent = true;
    setIsLoading(true);
    void loadDraft(persistenceType, conversationId).then((loaded) => {
      if (!isCurrent) return;
      setWorkspace(loaded);
      setBody(loaded?.draft?.body ?? "");
    }).catch((error) => {
      if (!isCurrent) return;
      if (
        error instanceof DraftClientError &&
        error.code === DRAFT_ERROR_CODES.unavailable
      ) {
        onUnavailable?.();
        return;
      }
      setStatus("The drafting state could not be loaded.");
    }).finally(() => {
      if (isCurrent) setIsLoading(false);
    });
    return () => {
      isCurrent = false;
    };
  }, [conversationId, initialWorkspace, isActive, persistenceType]);

  async function run(
    operation: () => Promise<DraftingState | DraftOperationResponse | null>,
    message: string,
  ) {
    setIsBusy(true);
    setStatus(null);
    try {
      const result = await operation();
      const changed = result && "workspace" in result ? result.workspace : result;
      const nextChange = result && "workspace" in result ? result.change : null;
      setWorkspace(changed);
      setBody(changed?.draft?.body ?? "");
      if (changed?.draft?.currentRevision !== workspace?.draft?.currentRevision) {
        interpretationRevisionRef.current = nextChange?.toRevision ?? null;
        onDraftAdvanced();
        if (nextChange && conversationId) {
          void interpretDraftChange(persistenceType, conversationId, nextChange)
            .then((interpretation) => {
              if (interpretationRevisionRef.current === nextChange.toRevision) {
                onDraftInterpretation(interpretation, nextChange);
              }
            })
            .catch(() => {
              if (interpretationRevisionRef.current === nextChange.toRevision) {
                onDraftInterpretation({ status: "failed" }, nextChange);
              }
            });
        }
      }
      setStatus(message);
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The draft could not be updated.");
      if (
        error instanceof DraftClientError &&
        error.code === DRAFT_ERROR_CODES.unavailable
      ) {
        if (workspace?.draft && body !== workspace.draft.body) {
          setDetachedBody(body);
        }
        setWorkspace(null);
        setBody("");
        setSelection(null);
        setProposalInstruction("");
        setIsHistoryOpen(false);
        interpretationRevisionRef.current = null;
        onUnavailable?.();
        return false;
      }
      if (conversationId) {
        const current = await loadDraft(persistenceType, conversationId).catch(() => null);
        if (!current && workspace?.draft && body !== workspace.draft.body) {
          setDetachedBody(body);
          setBody("");
        }
        setWorkspace(current);
      }
      return false;
    } finally {
      setIsBusy(false);
    }
  }

  async function save() {
    if (!conversationId || !workspace?.draft || body === workspace.draft.body) {
      return true;
    }
    return run(
      () => saveDraft(persistenceType, conversationId, {
        expectedRevision: workspace.draft!.currentRevision,
        body,
      }),
      "Draft saved.",
    );
  }

  useImperativeHandle(ref, () => ({
    clearLocalState() {
      setDetachedBody(null);
      setWorkspace(null);
      setBody("");
      setSelection(null);
      setProposalInstruction("");
      setIsHistoryOpen(false);
      setStatus(null);
      interpretationRevisionRef.current = null;
    },
    detachLocalEdits() {
      if (workspace?.draft && body !== workspace.draft.body) {
        setDetachedBody(body);
      }
      setWorkspace(null);
      setBody("");
      setSelection(null);
      setProposalInstruction("");
      setIsHistoryOpen(false);
      interpretationRevisionRef.current = null;
    },
    save,
  }), [conversationId, workspace, body]);

  const detachedDraftRecovery = detachedBody ? (
    <RecoveredDraftText
      body={detachedBody}
      onChange={setDetachedBody}
      onClear={() => setDetachedBody(null)}
    />
  ) : null;

  if (!conversationId) {
    return (
      <div className="grid gap-5">
        {detachedDraftRecovery}
        <p className="text-sm text-[var(--muted)]">Begin a conversation when you have something to think through. A Draft is optional.</p>
      </div>
    );
  }

  if (!workspace?.draft) {
    return (
      <div className="grid gap-5">
        {detachedDraftRecovery}
        <ComposeDraft
          ideas={ideas}
          isBusy={isBusy}
          onCompose={async (input) => {
            const wasDraftCreated = await run(
              () => composeDraft(persistenceType, conversationId, input),
              "Draft composed.",
            );
            if (wasDraftCreated) onDraftCreated();
          }}
          submitLabel={hasDraftOffer ? "Accept offer and compose" : "Compose draft"}
        />
        {status ? <p role="status">{status}</p> : null}
      </div>
    );
  }

  const draft = workspace.draft;
  function readCurrentSelection() {
    const editor = editorRef.current;
    if (!editor || editor.selectionEnd <= editor.selectionStart) return null;
    return {
      baseDraftRevision: draft.currentRevision,
      start: editor.selectionStart,
      end: editor.selectionEnd,
      selectedText: editor.value.slice(editor.selectionStart, editor.selectionEnd),
    };
  }
  function attachCurrentSelection() {
    const attached = readCurrentSelection();
    if (!attached) {
      setStatus("Select a draft passage to discuss.");
      return;
    }
    setSelection(attached);
    onAttachSelection(attached);
  }
  return (
    <section
      aria-labelledby="draft-title"
      className={detachedBody
        ? "grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] gap-5"
        : "grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-5"}
    >
      <header className="flex items-center justify-between gap-4">
        <div><h2 className="text-lg font-semibold" id="draft-title">Draft</h2><p className="text-sm text-[var(--muted)]">Revision {draft.currentRevision}</p></div>
        <button className="underline" onClick={() => setIsHistoryOpen(true)} ref={historyButtonRef} type="button">History</button>
      </header>
      {detachedDraftRecovery}
      <label className="sr-only" htmlFor="canonical-draft">Canonical draft</label>
      <textarea
        className="h-full min-h-0 w-full resize-none overflow-y-auto border border-[var(--line)] bg-transparent p-4 leading-7"
        id="canonical-draft"
        onBlur={() => void save()}
        onChange={(event) => setBody(event.target.value)}
        onSelect={() => {
          setSelection(readCurrentSelection());
        }}
        ref={editorRef}
        value={body}
      />
      <div className="flex items-center gap-3">
        <button className="border border-[var(--foreground)] px-4 py-2" disabled={isBusy || body === draft.body} onClick={() => void save()} type="button">Save draft</button>
        <button
          className="underline"
          disabled={isBusy || body !== draft.body}
          onClick={attachCurrentSelection}
          type="button"
        >
          Discuss selection
        </button>
        {status ? <p role="status">{status}</p> : null}
      </div>
      <section aria-labelledby="revision-proposal-title" className="grid gap-3 border-t border-[var(--line)] pt-5">
        <h3 className="font-semibold" id="revision-proposal-title">Assistant revision proposal</h3>
        {workspace.activeProposal?.state === "active" && (
          <ProposalReview
            isBusy={isBusy}
            proposal={workspace.activeProposal}
            onAccept={() => run(
              () => resolveDraftProposal(persistenceType, conversationId, workspace.activeProposal!.id, "accept", draft.currentRevision),
              "Proposal accepted as a new draft revision.",
            ).then(() => undefined)}
            onReject={() => run(
              () => resolveDraftProposal(persistenceType, conversationId, workspace.activeProposal!.id, "reject"),
              "Proposal rejected; the draft is unchanged.",
            ).then(() => undefined)}
            onAmend={(instruction) => run(
              () => amendDraftProposal(persistenceType, conversationId, workspace.activeProposal!.id, {
                expectedProposalRevision: workspace.activeProposal!.currentProposalRevision,
                userInstruction: instruction,
              }),
              "Proposal amended.",
            ).then(() => undefined)}
          />
        )}
        {workspace.activeProposal?.state === "stale" && (
          <section className="grid gap-3 border border-[var(--line)] p-4" role="status">
            <h4 className="font-medium">This proposal is stale</h4>
            <p className="text-sm">
              The draft changed after this proposal was prepared. It cannot be
              applied to the newer draft.
            </p>
            <button
              className="w-fit underline"
              disabled={isBusy}
              onClick={() => void run(
                () => resolveDraftProposal(
                  persistenceType,
                  conversationId,
                  workspace.activeProposal!.id,
                  "reject",
                ),
                "Stale proposal dismissed; the draft is unchanged.",
              )}
              type="button"
            >
              Dismiss stale proposal
            </button>
          </section>
        )}
        {!workspace.activeProposal && (
          <>
            <p className="text-sm text-[var(--muted)]">
              {selection
                ? `Selected passage: “${selection.selectedText}”`
                : "Select a passage for a bounded proposal, or leave nothing selected for a whole-draft proposal."}
            </p>
            <textarea onChange={(event) => setProposalInstruction(event.target.value)} placeholder="Describe the change you want to review." rows={3} value={proposalInstruction} />
            <button
              className="w-fit border border-[var(--foreground)] px-4 py-2"
              disabled={isBusy || !proposalInstruction.trim() || body !== draft.body}
              onClick={() => {
                const currentSelection = readCurrentSelection();
                setSelection(currentSelection);
                void run(
                () => proposeDraftRevision(persistenceType, conversationId, {
                  expectedDraftRevision: draft.currentRevision,
                  scope: currentSelection
                    ? REVISION_PROPOSAL_SCOPES.passage
                    : REVISION_PROPOSAL_SCOPES.wholeDraft,
                  selection: currentSelection ?? undefined,
                  userInstruction: proposalInstruction,
                }),
                "Proposal ready for review.",
              );
              }}
              type="button"
            >
              Prepare proposal
            </button>
          </>
        )}
      </section>
      {isHistoryOpen ? (
        <DraftHistory
          draft={draft}
          revisions={workspace.revisions}
          onClose={() => {
            setIsHistoryOpen(false);
            globalThis.setTimeout(() => historyButtonRef.current?.focus(), 0);
          }}
          onRestore={(revision) => run(
            () => restoreDraft(persistenceType, conversationId, {
              expectedRevision: draft.currentRevision,
              restoreRevision: revision,
            }),
            `Revision ${revision} restored as a new revision.`,
          ).then(() => undefined)}
        />
      ) : null}
    </section>
  );
});
