"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type {
  ConversationMessage,
  ConversationRequest,
  ConversationResponse,
  IdeaActionRequest,
  IdeaActionResult,
  IdeaMap,
  IdeaStructureCommandRequest,
  IdeaStructureCommandResult,
  DraftSelection,
  DraftChange,
  DraftingState,
} from "packages/products/src/thoughtform/shared";
import {
  CONVERSATION_ERROR_CODES,
  CONVERSATION_MESSAGE_ROLES,
  EMPTY_IDEA_MAP,
  IDEA_ACTION_RESULT_STATUSES,
  IDEA_ACTION_TYPES,
  ASSISTANT_MOVES,
} from "packages/products/src/thoughtform/shared";
import {
  CONVERSATION_STATUSES,
  ConversationComposer,
  type ConversationStatus,
} from "packages/products/src/thoughtform/client/workspace/components/ConversationComposer";
import { ConversationEditorIntro } from "packages/products/src/thoughtform/client/workspace/components/ConversationEditorIntro";
import { ConversationMessageList } from "packages/products/src/thoughtform/client/workspace/components/ConversationMessageList";
import { IdeaMapTracker } from "packages/products/src/thoughtform/client/workspace/components/IdeaMapTracker";
import {
  ConversationRequestError,
  sendConversationMessage,
  type ConversationStreamCallbacks,
  type ConversationStreamResult,
} from "packages/products/src/thoughtform/client/workspace/actions/send-conversation-message";
import {
  IdeaActionError,
  sendTemporaryIdeaAction,
} from "packages/products/src/thoughtform/client/workspace/actions/send-idea-action";
import {
  IdeaStructureError,
  sendTemporaryIdeaStructure,
} from "packages/products/src/thoughtform/client/workspace/actions/send-idea-structure";
import { DraftPanel, type DraftPanelHandle } from "packages/products/src/thoughtform/client/workspace/components/DraftPanel";
import {
  WORKSPACE_PERSISTENCE_TYPES,
  type WorkspacePersistenceType,
} from "packages/products/src/thoughtform/shared";
import { ResponseFormingIndicator } from "packages/products/src/thoughtform/client/workspace/components/ResponseFormingIndicator";

interface ConversationEditorProps {
  canClear?: boolean;
  initialConversationId?: string | null;
  initialMessages?: ConversationMessage[];
  initialIdeaMap?: IdeaMap;
  onClear?: () => Promise<void>;
  onResponse?: (response: ConversationStreamResult) => void;
  onUnavailable?: () => void;
  sendMessage?: (
    request: ConversationRequest,
    callbacks?: ConversationStreamCallbacks,
  ) => Promise<ConversationStreamResult>;
  sendIdeaAction?: (
    conversationId: string,
    ideaId: string,
    request: IdeaActionRequest,
  ) => Promise<IdeaActionResult>;
  sendIdeaStructure?: (
    conversationId: string,
    request: IdeaStructureCommandRequest,
  ) => Promise<IdeaStructureCommandResult>;
  draftPersistenceType?: WorkspacePersistenceType;
  initialDraftingState?: DraftingState | null;
}

export function ConversationEditor({
  canClear = false,
  initialConversationId = null,
  initialMessages = [],
  initialIdeaMap = EMPTY_IDEA_MAP,
  onClear,
  onResponse,
  onUnavailable,
  sendMessage = sendConversationMessage,
  sendIdeaAction = sendTemporaryIdeaAction,
  sendIdeaStructure = sendTemporaryIdeaStructure,
  draftPersistenceType = WORKSPACE_PERSISTENCE_TYPES.temporary,
  initialDraftingState = null,
}: ConversationEditorProps) {
  const draftRef = useRef<DraftPanelHandle>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const messageInputId = useId();
  const errorId = useId();
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId,
  );
  const [message, setMessage] = useState("");
  const [messages, setMessages] =
    useState<ConversationMessage[]>(initialMessages);
  const [partialAssistantMessage, setPartialAssistantMessage] =
    useState<ConversationMessage | null>(null);
  const [shouldAnimateLatestAssistant, setShouldAnimateLatestAssistant] = useState(false);
  const [followLatestRequest, setFollowLatestRequest] = useState(0);
  const [ideaMap, setIdeaMap] = useState<IdeaMap>(initialIdeaMap);
  const [ideaStatus, setIdeaStatus] = useState<string | null>(null);
  const [draftSelection, setDraftSelection] = useState<DraftSelection | null>(null);
  const [draftChange, setDraftChange] = useState<DraftChange | null>(null);
  const [status, setStatus] = useState<ConversationStatus>(
    CONVERSATION_STATUSES.idle,
  );
  const [error, setError] = useState<string | null>(null);
  const [mobileSurface, setMobileSurface] = useState<
    "conversation" | "idea-map" | "draft"
  >("conversation");
  const [workspaceView, setWorkspaceView] = useState<"idea-map" | "draft">(
    "idea-map",
  );
  const [surfaceStatus, setSurfaceStatus] = useState<string | null>(null);
  const [hasDraftOffer, setHasDraftOffer] = useState(false);

  useLayoutEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const fitWorkspaceToViewport = () => {
      const workspaceRect = workspace.getBoundingClientRect();
      const documentTop = workspaceRect.top + globalThis.scrollY;
      const documentBottom = workspaceRect.bottom + globalThis.scrollY;
      const footer = document.querySelector("footer");
      const pageContentBoundary = footer ?? document.querySelector("main");
      const trailingPageHeight = pageContentBoundary
        ? Math.max(
            0,
            pageContentBoundary.getBoundingClientRect().bottom + globalThis.scrollY -
              documentBottom,
          )
        : 0;
      const availableHeight = Math.max(
        320,
        globalThis.innerHeight - documentTop - trailingPageHeight,
      );
      workspace.style.setProperty("--workspace-height", `${availableHeight}px`);
    };
    fitWorkspaceToViewport();
    globalThis.addEventListener("resize", fitWorkspaceToViewport);
    return () => globalThis.removeEventListener("resize", fitWorkspaceToViewport);
  }, []);

  function revealSurface(surface: "conversation" | "idea-map" | "draft") {
    setMobileSurface(surface);
    if (surface !== "conversation") setWorkspaceView(surface);
    setSurfaceStatus(`${surface.replace("-", " ")} view shown.`);
  }

  const trimmedMessage = message.trim();
  const canSubmit =
    trimmedMessage.length > 0 && status === CONVERSATION_STATUSES.idle;

  function handleWorkspaceUnavailable(recoverMessage?: string) {
    draftRef.current?.detachLocalEdits();
    setConversationId(null);
    setMessages([]);
    setIdeaMap(EMPTY_IDEA_MAP);
    setIdeaStatus(null);
    setDraftSelection(null);
    setDraftChange(null);
    setHasDraftOffer(false);
    setShouldAnimateLatestAssistant(false);
    setPartialAssistantMessage(null);
    if (recoverMessage !== undefined) setMessage(recoverMessage);
    revealSurface("conversation");
    onUnavailable?.();
    setError(
      "This temporary workspace is no longer available. Recoverable text remains here for you to copy before starting again.",
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    if (!(await draftRef.current?.save() ?? true)) {
      setError("Save the draft before sending this message.");
      return;
    }

    const userMessage: ConversationMessage = {
      role: CONVERSATION_MESSAGE_ROLES.user,
      content: trimmedMessage,
    };

    setStatus(CONVERSATION_STATUSES.sending);
    setError(null);
    setIdeaStatus("Updating the Idea Map.");
    setMessage("");
    setShouldAnimateLatestAssistant(true);
    setFollowLatestRequest((current) => current + 1);
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    let shouldDisableAfterRequest = false;

    try {
      const response = await sendMessage(
        {
          conversationId,
          message: trimmedMessage,
          ...(draftSelection ? { draftSelection } : {}),
          ...(draftChange ? { draftChange } : {}),
        },
        {
          onAssistantDelta(delta) {
            setPartialAssistantMessage((current) => ({
              role: CONVERSATION_MESSAGE_ROLES.assistant,
              content: `${current?.content ?? ""}${delta}`,
            }));
          },
          onIdeaMap(nextIdeaMap) {
            setIdeaMap(nextIdeaMap);
            setIdeaStatus("Idea Map updated.");
          },
          onIdeaMapFailed(message) {
            setIdeaStatus(message);
          },
        },
      );

      setConversationId(response.conversationId);
      setPartialAssistantMessage(null);
      setMessages((currentMessages) => [...currentMessages, response.message]);
      if (response.ideaMap) {
        setIdeaMap(response.ideaMap);
      }
      onResponse?.(response);
      if (response.move === ASSISTANT_MOVES.offerDraft) {
        setHasDraftOffer(true);
      }
      setDraftSelection(null);
      setDraftChange(null);
    } catch (sendError) {
      if (
        sendError instanceof ConversationRequestError &&
        onUnavailable &&
        (sendError.code === CONVERSATION_ERROR_CODES.notFound ||
          sendError.code === CONVERSATION_ERROR_CODES.unavailable)
      ) {
        handleWorkspaceUnavailable(trimmedMessage);
        return;
      }

      setMessage(trimmedMessage);
      setShouldAnimateLatestAssistant(false);
      setPartialAssistantMessage(null);
      setMessages((currentMessages) => currentMessages.slice(0, -1));
      if (
        sendError instanceof ConversationRequestError &&
        sendError.code === CONVERSATION_ERROR_CODES.hostedAiDisabled
      ) {
        shouldDisableAfterRequest = true;
      }
      setError(conversationErrorMessage(sendError));
    } finally {
      setStatus(
        shouldDisableAfterRequest
          ? CONVERSATION_STATUSES.disabled
          : CONVERSATION_STATUSES.idle,
      );
    }
  }

  async function handleClear() {
    if (
      !onClear ||
      !globalThis.confirm(
        "Clear this complete temporary workspace, including unsaved local text? This cannot be undone.",
      )
    ) {
      return;
    }

    setStatus(CONVERSATION_STATUSES.sending);
    setError(null);

    try {
      await onClear();
      draftRef.current?.clearLocalState();
      setConversationId(null);
      setMessages([]);
      setPartialAssistantMessage(null);
      setShouldAnimateLatestAssistant(false);
      setIdeaMap(EMPTY_IDEA_MAP);
      setIdeaStatus(null);
      setMessage("");
      setDraftSelection(null);
      setDraftChange(null);
      setHasDraftOffer(false);
      setMobileSurface("conversation");
      setWorkspaceView("idea-map");
      setSurfaceStatus(null);
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? clearError.message
          : "The temporary conversation could not be cleared.",
      );
    } finally {
      setStatus(CONVERSATION_STATUSES.idle);
    }
  }

  return (
    <section aria-labelledby="editor-title">
      <ConversationEditorIntro />
      <nav aria-label="Workspace views" className="mt-6 flex gap-3 lg:hidden">
        {(["conversation", "idea-map", "draft"] as const).map((surface) => (
          <button
            aria-current={mobileSurface === surface ? "page" : undefined}
            className="border border-[var(--line)] px-3 py-2 capitalize aria-[current=page]:border-[var(--foreground)] aria-[current=page]:bg-[var(--selection)]"
            key={surface}
            onClick={() => revealSurface(surface)}
            type="button"
          >
            {surface.replace("-", " ")}
          </button>
        ))}
      </nav>
      {surfaceStatus ? <p className="sr-only" role="status">{surfaceStatus}</p> : null}
      <div className="mt-6 grid h-[var(--workspace-height)] min-h-0 gap-8 lg:grid-cols-2" data-testid="workspace" ref={workspaceRef}>
        <div className={`${mobileSurface === "conversation" ? "grid" : "hidden"} h-full max-h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-8 overflow-hidden lg:grid lg:pr-4`} data-testid="conversation-column">
          <ConversationMessageList
            followLatestRequest={followLatestRequest}
            shouldAnimateLatestAssistant={shouldAnimateLatestAssistant}
            messages={partialAssistantMessage
              ? [...messages, partialAssistantMessage]
              : messages}
          />
          <div className="grid gap-4">
          {hasDraftOffer ? (
            <aside className="border border-[var(--line)] p-3" aria-label="Draft offer">
              <p className="text-sm">The assistant has offered to compose a draft from material you select.</p>
              <button className="mt-2 underline" onClick={() => revealSurface("draft")} type="button">Choose ideas for this draft</button>
            </aside>
          ) : null}
          {draftSelection ? (
            <aside className="border border-[var(--line)] p-3" aria-label="Attached draft passage">
              <p className="text-sm"><strong>Draft passage attached:</strong> “{draftSelection.selectedText}”</p>
              <button className="mt-2 text-sm underline" onClick={() => setDraftSelection(null)} type="button">Remove attachment</button>
            </aside>
          ) : null}
          {draftChange ? (
            <aside className="border border-[var(--line)] p-3" aria-label="Attached draft change">
              <p className="text-sm"><strong>Saved edit attached:</strong> revision {draftChange.fromRevision} to {draftChange.toRevision}</p>
              <button className="mt-2 text-sm underline" onClick={() => setDraftChange(null)} type="button">Remove attachment</button>
            </aside>
          ) : null}
          {canClear && messages.length > 0 ? (
            <button className="w-fit text-sm underline decoration-[var(--line)] underline-offset-4" disabled={status === CONVERSATION_STATUSES.sending} onClick={handleClear} type="button">Clear this workspace</button>
          ) : null}
          {status === CONVERSATION_STATUSES.sending ? (
            <ResponseFormingIndicator />
          ) : null}
          <ConversationComposer
            canSubmit={canSubmit}
            error={error}
            errorId={errorId}
            message={message}
            messageInputId={messageInputId}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            status={status}
          />
          </div>
        </div>
        <div className={`${mobileSurface === "conversation" ? "hidden lg:grid" : "grid"} h-full max-h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:border-l lg:border-[var(--line)] lg:pl-6`} data-testid="workspace-column">
          <div className="mb-6 hidden gap-3 lg:flex" role="group" aria-label="Workspace">
            <button aria-pressed={workspaceView === "idea-map"} className="border border-[var(--line)] px-3 py-2 aria-pressed:border-[var(--foreground)] aria-pressed:bg-[var(--selection)]" onClick={() => setWorkspaceView("idea-map")} type="button">Idea map</button>
            <button aria-pressed={workspaceView === "draft"} className="border border-[var(--line)] px-3 py-2 aria-pressed:border-[var(--foreground)] aria-pressed:bg-[var(--selection)]" onClick={() => setWorkspaceView("draft")} type="button">Draft</button>
          </div>
          <div className={`${mobileSurface === "idea-map" ? "block" : "hidden"} ${workspaceView === "idea-map" ? "lg:block" : "lg:hidden"} min-h-0 overflow-y-auto`}>
            <IdeaMapTracker
          ideaMap={ideaMap}
          isBusy={status === CONVERSATION_STATUSES.sending}
          onAction={async (ideaId, request) => {
            if (!conversationId || status === CONVERSATION_STATUSES.sending) return false;
            setStatus(CONVERSATION_STATUSES.sending);
            setError(null);
            setIdeaStatus(null);
            try {
              const result = await sendIdeaAction(
                conversationId,
                ideaId,
                request,
              );
              setIdeaMap(result.ideaMap);
              if (result.status === IDEA_ACTION_RESULT_STATUSES.conflict) {
                setIdeaStatus(
                  "The idea map changed elsewhere, so it has been refreshed. Review it and try again.",
                );
                return false;
              }
              setIdeaStatus("Idea map updated.");
              if (request.action === IDEA_ACTION_TYPES.focus) {
                revealSurface("conversation");
              }
              return true;
            } catch (actionError) {
              if (
                actionError instanceof IdeaActionError &&
                actionError.code === CONVERSATION_ERROR_CODES.unavailable
              ) {
                handleWorkspaceUnavailable();
                return false;
              }
              setError(
                actionError instanceof Error
                  ? actionError.message
                  : "The idea could not be updated.",
              );
              return false;
            } finally {
              setStatus(CONVERSATION_STATUSES.idle);
            }
          }}
          onStructure={async (request) => {
            if (!conversationId || status === CONVERSATION_STATUSES.sending) return false;
            setStatus(CONVERSATION_STATUSES.sending);
            setError(null);
            setIdeaStatus(null);
            try {
              const result = await sendIdeaStructure(conversationId, request);
              setIdeaMap(result.ideaMap);
              if (result.status === IDEA_ACTION_RESULT_STATUSES.conflict) {
                setIdeaStatus("The idea map changed elsewhere, so it has been refreshed. Review it and try again.");
                return false;
              }
              setIdeaStatus("Idea map reorganisation updated.");
              return true;
            } catch (structureError) {
              if (
                structureError instanceof IdeaStructureError &&
                structureError.code === CONVERSATION_ERROR_CODES.unavailable
              ) {
                handleWorkspaceUnavailable();
                return false;
              }
              setError(structureError instanceof Error
                ? structureError.message
                : "The idea map could not be reorganised.");
              return false;
            } finally {
              setStatus(CONVERSATION_STATUSES.idle);
            }
          }}
            />
            {ideaStatus ? <p className="text-sm text-[var(--muted)]" role="status">{ideaStatus}</p> : null}
          </div>
          <div className={`${mobileSurface === "draft" ? "block" : "hidden"} ${workspaceView === "draft" ? "lg:block" : "lg:hidden"} min-h-0`}>
            <DraftPanel
              conversationId={conversationId}
              ideas={ideaMap.ideas}
              isActive={
                mobileSurface === "draft" || workspaceView === "draft"
              }
              persistenceType={draftPersistenceType}
              hasDraftOffer={hasDraftOffer}
              initialWorkspace={initialDraftingState}
              onDraftCreated={() => {
                setHasDraftOffer(false);
                revealSurface("draft");
              }}
              onAttachSelection={(attached) => {
                setDraftSelection(attached);
                setDraftChange(null);
                revealSurface("conversation");
              }}
              onDraftInterpretation={(interpretation, change) => {
                if (interpretation?.status === "responded" && interpretation.response) {
                  setMessages((current) => [...current, interpretation.response!.message]);
                  setIdeaMap(interpretation.response.ideaMap);
                  setDraftChange(null);
                  setDraftSelection(null);
                  onResponse?.(interpretation.response);
                  revealSurface("conversation");
                  return;
                }
                if (interpretation?.status === "failed" && change) {
                  setDraftChange(change);
                  setDraftSelection(null);
                  setError("The draft was saved, but the assistant could not interpret this edit. Add a message to retry with the saved edit attached.");
                  revealSurface("conversation");
                  return;
                }
                setDraftChange(null);
              }}
              onDraftAdvanced={() => {
                setDraftChange(null);
                setDraftSelection(null);
              }}
              onUnavailable={handleWorkspaceUnavailable}
              ref={draftRef}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function conversationErrorMessage(error: unknown) {
  if (
    error instanceof ConversationRequestError &&
    error.code === CONVERSATION_ERROR_CODES.hostedUsageLimited &&
    error.allowance
  ) {
    const reset = new Date(error.allowance.resetsAt).toLocaleString();
    return `${error.message} ${error.allowance.remainingOperations} hosted operations remain. It resets at ${reset}.`;
  }
  return error instanceof Error ? error.message : "The conversation could not continue.";
}
