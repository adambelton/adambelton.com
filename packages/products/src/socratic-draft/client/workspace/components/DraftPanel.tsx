import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  DRAFT_FORMAT_MAX_LENGTH,
  DRAFT_CONTENT_FORMATS,
  legacyPlainTextToSemanticMarkdown,
  REVISION_PROPOSAL_SCOPES,
  type DraftChange,
  type DraftOperationResponse,
  type DraftSelection,
  type DraftingState,
  type Idea,
} from "packages/products/src/socratic-draft/shared";
import { ComposeDraft } from "packages/products/src/socratic-draft/client/workspace/components/ComposeDraft";
import { DraftHistory } from "packages/products/src/socratic-draft/client/workspace/components/DraftHistory";
import { ProposalReview } from "packages/products/src/socratic-draft/client/workspace/components/ProposalReview";
import {
  amendDraftProposal,
  changeDraftFormat,
  composeDraft,
  loadDraft,
  proposeDraftRevision,
  resolveDraftProposal,
  restoreDraft,
  saveDraft,
  type DraftPersistenceKind,
} from "packages/products/src/socratic-draft/client/workspace/actions/draft-client";
import {
  SemanticDraftEditor,
  type SemanticDraftEditorHandle,
} from "packages/products/src/socratic-draft/client/workspace/editor/SemanticDraftEditor";

export interface DraftPanelHandle {
  save(): Promise<boolean>;
}

export const DraftPanel = forwardRef<DraftPanelHandle, {
  conversationId: string | null;
  ideas: Idea[];
  isActive: boolean;
  kind: DraftPersistenceKind;
  onDraftCreated: () => void;
  onAttachSelection: (selection: DraftSelection) => void;
  onAttachChange: (change: DraftChange) => void;
  onDraftAdvanced: () => void;
  hasDraftOffer?: boolean;
  initialWorkspace?: DraftingState | null;
}>(function DraftPanel({
  conversationId,
  ideas,
  isActive,
  kind,
  onDraftCreated,
  onAttachSelection,
  onAttachChange,
  onDraftAdvanced,
  hasDraftOffer = false,
  initialWorkspace = null,
}, ref) {
  const editorRef = useRef<SemanticDraftEditorHandle>(null);
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const formatDirtyRef = useRef(false);
  const [workspace, setWorkspace] = useState<DraftingState | null>(initialWorkspace);
  const [body, setBody] = useState(editorBody(initialWorkspace));
  const [format, setFormat] = useState(initialWorkspace?.format ?? "");
  const [selection, setSelection] = useState<DraftSelection | null>(null);
  const [proposalInstruction, setProposalInstruction] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [draftChange, setDraftChange] = useState<DraftChange | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      setWorkspace(null);
      setBody("");
      setFormat("");
      formatDirtyRef.current = false;
      setDraftChange(null);
      return;
    }
    if (initialWorkspace) {
      setLoading(false);
      setWorkspace(initialWorkspace);
      setBody(editorBody(initialWorkspace));
      setFormat(initialWorkspace.format ?? "");
      formatDirtyRef.current = false;
      setDraftChange(null);
      return;
    }
    if (!isActive) return;
    let isCurrent = true;
    setLoading(true);
    void loadDraft(kind, conversationId).then((loaded) => {
      if (!isCurrent) return;
      setWorkspace(loaded);
      setBody(editorBody(loaded));
      if (!formatDirtyRef.current) setFormat(loaded?.format ?? "");
      setDraftChange(null);
    }).catch(() => {
      if (isCurrent) setStatus("The drafting state could not be loaded.");
    }).finally(() => {
      if (isCurrent) setLoading(false);
    });
    return () => {
      isCurrent = false;
    };
  }, [conversationId, initialWorkspace, isActive, kind]);

  async function run(
    operation: () => Promise<DraftingState | DraftOperationResponse | null>,
    message: string,
    syncFormat = false,
  ) {
    setBusy(true);
    setStatus(null);
    try {
      const result = await operation();
      const changed = result && "workspace" in result ? result.workspace : result;
      const nextChange = result && "workspace" in result ? result.change : null;
      setWorkspace(changed);
      setBody(editorBody(changed));
      if (syncFormat || !formatDirtyRef.current) {
        setFormat(changed?.format ?? "");
        formatDirtyRef.current = false;
      }
      if (changed?.draft?.currentRevision !== workspace?.draft?.currentRevision) {
        setDraftChange(nextChange);
        onDraftAdvanced();
      }
      setStatus(message);
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The draft could not be updated.");
      if (conversationId) {
        const current = await loadDraft(kind, conversationId).catch(() => null);
        setWorkspace(current);
        setBody(editorBody(current) || body);
        if (syncFormat) {
          setFormat(current?.format ?? "");
          formatDirtyRef.current = false;
        }
      }
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!conversationId || !workspace?.draft || body === editorBody(workspace)) {
      return true;
    }
    return run(
      () => saveDraft(kind, conversationId, {
        expectedRevision: workspace.draft!.currentRevision,
        body,
      }),
      "Draft saved.",
    );
  }

  useImperativeHandle(ref, () => ({ save }), [conversationId, workspace, body]);

  const normalizedFormat = format.trim();
  const savedFormat = workspace?.format ?? "";
  const formatChanged = normalizedFormat !== savedFormat;
  const formatControl = (
    <section aria-labelledby="draft-format-title" className="grid gap-2 border border-[var(--line)] p-4">
      <h2 className="font-semibold" id="draft-format-title">Draft Format</h2>
      <label className="text-sm" htmlFor="draft-format">Optional format guidance</label>
      <input
        aria-describedby="draft-format-description"
        className="border border-[var(--line)] bg-transparent px-3 py-2"
        disabled={busy || loading}
        id="draft-format"
        maxLength={DRAFT_FORMAT_MAX_LENGTH}
        onChange={(event) => {
          formatDirtyRef.current = true;
          setFormat(event.target.value);
        }}
        placeholder="Free-form writing"
        type="text"
        value={format}
      />
      <p className="text-sm text-[var(--muted)]" id="draft-format-description">
        Saved with this writing. The assistant does not use this value yet. Leave it blank for free-form writing.
      </p>
      <div className="flex gap-3">
        <button
          className="border border-[var(--foreground)] px-3 py-2"
          disabled={busy || loading || !formatChanged}
          onClick={() => void run(
            () => changeDraftFormat(kind, conversationId!, {
              expectedFormatRevision: workspace?.formatRevision ?? 0,
              format: normalizedFormat || null,
            }),
            normalizedFormat ? "Draft Format saved." : "Draft Format cleared; this writing is free-form.",
            true,
          )}
          type="button"
        >
          Save format
        </button>
        <button
          className="underline"
          disabled={busy || loading || (!format && !savedFormat)}
          onClick={() => {
            formatDirtyRef.current = true;
            setFormat("");
            if (savedFormat) {
              void run(
                () => changeDraftFormat(kind, conversationId!, {
                  expectedFormatRevision: workspace?.formatRevision ?? 0,
                  format: null,
                }),
                "Draft Format cleared; this writing is free-form.",
                true,
              );
            }
          }}
          type="button"
        >
          Clear format
        </button>
      </div>
    </section>
  );

  if (!conversationId) {
    return <p className="text-sm text-[var(--muted)]">Begin the conversation to create a draft.</p>;
  }

  if (!workspace?.draft) {
    return (
      <div className="grid gap-5">
        {formatControl}
        <ComposeDraft
          ideas={ideas}
          isBusy={busy}
          onCompose={async (input) => {
            const created = await run(
              () => composeDraft(kind, conversationId, input),
              "Draft composed.",
            );
            if (created) onDraftCreated();
          }}
          submitLabel={hasDraftOffer ? "Accept offer and compose" : "Compose draft"}
        />
        {status ? <p role="status">{status}</p> : null}
      </div>
    );
  }

  const draft = workspace.draft;
  const savedEditorBody = editorBody(workspace);
  function readCurrentSelection() {
    const selectedMarkdown = editorRef.current?.selectedMarkdown() ?? "";
    if (!selectedMarkdown) return null;
    const start = body.indexOf(selectedMarkdown);
    if (start < 0) return null;
    return {
      baseDraftRevision: draft.currentRevision,
      start,
      end: start + selectedMarkdown.length,
      selectedText: selectedMarkdown,
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
    <section aria-labelledby="draft-title" className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)_auto_auto] gap-5">
      {formatControl}
      <header className="flex items-center justify-between gap-4">
        <div><h2 className="text-lg font-semibold" id="draft-title">Draft</h2><p className="text-sm text-[var(--muted)]">Revision {draft.currentRevision}</p></div>
        <button className="underline" onClick={() => setHistoryOpen(true)} ref={historyButtonRef} type="button">History</button>
      </header>
      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 overflow-hidden">
        <button className="w-fit underline" onClick={() => editorRef.current?.focus()} type="button">Enter draft editor</button>
        <SemanticDraftEditor
          disabled={busy || loading}
          key={`${draft.id}:${draft.currentRevision}`}
          markdown={body}
          onChange={setBody}
          onSelectionChange={() => setSelection(readCurrentSelection())}
          ref={editorRef}
        />
        <button className="w-fit underline" type="button">Leave draft editor</button>
      </div>
      <div className="flex items-center gap-3">
        <button className="border border-[var(--foreground)] px-4 py-2" disabled={busy || body === savedEditorBody} onClick={() => void save()} type="button">Save draft</button>
        <button
          className="underline"
          disabled={busy || body !== savedEditorBody}
          onClick={attachCurrentSelection}
          type="button"
        >
          Discuss selection
        </button>
        {draftChange ? (
          <button
            className="underline"
            disabled={busy || body !== savedEditorBody}
            onClick={() => onAttachChange(draftChange)}
            type="button"
          >
            Discuss this edit
          </button>
        ) : null}
        {status ? <p role="status">{status}</p> : null}
      </div>
      <section aria-labelledby="revision-proposal-title" className="grid gap-3 border-t border-[var(--line)] pt-5">
        <h3 className="font-semibold" id="revision-proposal-title">Assistant revision proposal</h3>
        {workspace.activeProposal?.state === "active" ? (
          <ProposalReview
            isBusy={busy}
            proposal={workspace.activeProposal}
            onAccept={() => run(
              () => resolveDraftProposal(kind, conversationId, workspace.activeProposal!.id, "accept", draft.currentRevision),
              "Proposal accepted as a new draft revision.",
            ).then(() => undefined)}
            onReject={() => run(
              () => resolveDraftProposal(kind, conversationId, workspace.activeProposal!.id, "reject"),
              "Proposal rejected; the draft is unchanged.",
            ).then(() => undefined)}
            onAmend={(instruction) => run(
              () => amendDraftProposal(kind, conversationId, workspace.activeProposal!.id, {
                expectedProposalRevision: workspace.activeProposal!.currentProposalRevision,
                userInstruction: instruction,
              }),
              "Proposal amended.",
            ).then(() => undefined)}
          />
        ) : workspace.activeProposal?.state === "stale" ? (
          <section className="grid gap-3 border border-[var(--line)] p-4" role="status">
            <h4 className="font-medium">This proposal is stale</h4>
            <p className="text-sm">
              The draft changed after this proposal was prepared. It cannot be
              applied to the newer draft.
            </p>
            <button
              className="w-fit underline"
              disabled={busy}
              onClick={() => void run(
                () => resolveDraftProposal(
                  kind,
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
        ) : (
          <>
            <p className="text-sm text-[var(--muted)]">
              {selection
                ? `Selected passage: “${selection.selectedText}”`
                : "Select a passage for a bounded proposal, or leave nothing selected for a whole-draft proposal."}
            </p>
            <textarea onChange={(event) => setProposalInstruction(event.target.value)} placeholder="Describe the change you want to review." rows={3} value={proposalInstruction} />
            <button
              className="w-fit border border-[var(--foreground)] px-4 py-2"
              disabled={busy || !proposalInstruction.trim() || body !== savedEditorBody}
              onClick={() => {
                const currentSelection = readCurrentSelection();
                setSelection(currentSelection);
                void run(
                () => proposeDraftRevision(kind, conversationId, {
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
      {historyOpen ? (
        <DraftHistory
          draft={draft}
          revisions={workspace.revisions}
          onClose={() => {
            setHistoryOpen(false);
            globalThis.setTimeout(() => historyButtonRef.current?.focus(), 0);
          }}
          onRestore={(revision) => run(
            () => restoreDraft(kind, conversationId, {
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

function editorBody(workspace: DraftingState | null | undefined) {
  const draft = workspace?.draft;
  if (!draft) return "";
  return draft.contentFormat === DRAFT_CONTENT_FORMATS.semanticMarkdown
    ? draft.body
    : legacyPlainTextToSemanticMarkdown(draft.body);
}
