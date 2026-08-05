// @vitest-environment happy-dom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConversationEditor } from "packages/products/src/thoughtform/client/workspace/components/ConversationEditor";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  CONVERSATION_MESSAGE_ROLES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  type DraftingState,
  type Idea,
} from "packages/products/src/thoughtform/shared";

const idea: Idea = {
  id: "idea-1",
  title: "Accountability",
  synthesis: "Authority requires accountability.",
  substance: "Institutions must answer to the communities that grant legitimacy.",
  unresolvedQuestions: [],
  disposition: IDEA_DISPOSITIONS.active,
  assistantAssessment: {
    exploration: IDEA_EXPLORATION_ASSESSMENTS.wellExplored,
    importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
  },
  userInterpretation: null,
};

describe("ConversationEditor", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("keeps the retained assistant response and reports a later Idea Map failure", async () => {
    render(<ConversationEditor
      sendMessage={async (_request, callbacks) => {
        callbacks?.onAssistantDelta?.("A partial response.");
        callbacks?.onIdeaMapFailed?.(
          "The response was saved, but the Idea Map could not be updated.",
        );
        return {
          conversationId: "conversation-1",
          message: { role: CONVERSATION_MESSAGE_ROLES.assistant, content: "A retained response." },
          activity: ACTIVITIES.discovery,
          move: ASSISTANT_MOVES.probe,
          assistantReadiness: [],
          userIntention: null,
        };
      }}
    />);

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "Keep this response." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    expect(await screen.findByText("A retained response.")).toBeTruthy();
    expect(await screen.findByText(
      "The response was saved, but the Idea Map could not be updated.",
    )).toBeTruthy();
  });

  it("uses acceptance of an assistant offer as the composition action", async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(success(null))
      .mockResolvedValueOnce(success({
        draft: {
          id: "draft-1",
          conversationId: "conversation-1",
          body: idea.substance,
          currentRevision: 1,
          createdAt: "2026-08-02T12:00:00.000Z",
          updatedAt: "2026-08-02T12:00:00.000Z",
        },
        revisions: [{
          revision: 1,
          body: idea.substance,
          source: "initial_composition",
          createdAt: "2026-08-02T12:00:00.000Z",
          proposalId: null,
          restoredFromRevision: null,
        }],
        activeProposal: null,
      }, 201));
    vi.stubGlobal("fetch", fetcher);
    render(<ConversationEditor
      initialConversationId="conversation-1"
      initialIdeaMap={{ revision: 1, ideas: [idea] }}
      sendMessage={async () => ({
        conversationId: "conversation-1",
        message: { role: CONVERSATION_MESSAGE_ROLES.assistant, content: "I can compose this when you are ready." },
        activity: ACTIVITIES.discovery,
        move: ASSISTANT_MOVES.offerDraft,
        assistantReadiness: [],
        userIntention: null,
        ideaMap: { revision: 1, ideas: [idea] },
      })}
    />);

    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "Could this become a draft?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByLabelText("Draft offer");
    fireEvent.click(screen.getByRole("button", { name: "Choose ideas for this draft" }));
    await screen.findByRole("button", { name: "Accept offer and compose" });
    fireEvent.click(screen.getByLabelText("Accountability"));
    fireEvent.click(screen.getByRole("button", { name: "Accept offer and compose" }));

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(await screen.findByDisplayValue(idea.substance)).toBeTruthy();
    expect(screen.queryByLabelText("Draft offer")).toBeNull();
  });

  it("does not send a message when required draft saving fails", async () => {
    const workspace = draftingState("Canonical body.");
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(success(workspace))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: false,
        error: { code: "draft_conflict", message: "The draft changed elsewhere." },
      }), { status: 409 }))
      .mockResolvedValueOnce(success(workspace));
    vi.stubGlobal("fetch", fetcher);
    const sendMessage = vi.fn();
    render(<ConversationEditor
      initialConversationId="conversation-1"
      initialIdeaMap={{ revision: 1, ideas: [idea] }}
      sendMessage={sendMessage}
    />);
    fireEvent.click(screen.getByRole("button", { name: /^Draft$/ }));
    const editor = await screen.findByLabelText("Canonical draft");
    fireEvent.change(editor, { target: { value: "Unsaved canonical work." } });
    fireEvent.change(screen.getByLabelText("What are you thinking?"), {
      target: { value: "Do not send this yet." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await screen.findByText("Save the draft before sending this message.");
    expect(sendMessage).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("Do not send this yet.")).toBeTruthy();
  });

  it("shows an automatic saved-edit response without fabricating a user message", async () => {
    const workspace = draftingState("Canonical body.");
    const changed = {
      fromRevision: 1,
      toRevision: 2,
      scope: "passage" as const,
      start: 0,
      end: 9,
      removedText: "Canonical",
      addedText: "Personal",
    };
    const nextState: DraftingState = {
      ...workspace,
      draft: { ...workspace.draft!, body: "Personal body.", currentRevision: 2 },
      revisions: [
        ...workspace.revisions,
        { ...workspace.revisions[0]!, revision: 2, body: "Personal body.", source: "manual_edit" },
      ],
    };
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(success({ workspace: nextState, change: changed }))
      .mockResolvedValueOnce(success({
          status: "responded",
          response: {
            conversationId: "conversation-1",
            message: { role: "assistant", content: "It sounds as though personal responsibility matters more here. Is that right?" },
            activity: "discovery",
            move: "clarify",
            assistantReadiness: [],
            userIntention: null,
            ideaMap: { revision: 1, ideas: [idea] },
          },
      })),
    );
    const sendMessage = vi.fn(async () => ({
      conversationId: "conversation-1",
      message: { role: CONVERSATION_MESSAGE_ROLES.assistant, content: "What does that edit sharpen?" },
      activity: ACTIVITIES.discovery,
      move: ASSISTANT_MOVES.probe,
      assistantReadiness: [],
      userIntention: null,
      ideaMap: { revision: 1, ideas: [idea] },
    }));
    render(<ConversationEditor
      initialConversationId="conversation-1"
      initialDraftingState={workspace}
      initialIdeaMap={{ revision: 1, ideas: [idea] }}
      sendMessage={sendMessage}
    />);

    fireEvent.change(screen.getByLabelText("Canonical draft"), {
      target: { value: "Personal body." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await screen.findByText("It sounds as though personal responsibility matters more here. Is that right?");
    expect(screen.queryByRole("button", { name: "Discuss this edit" })).toBeNull();
    expect(screen.queryByLabelText("Attached draft change")).toBeNull();
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("attaches the exact saved change after automatic response failure", async () => {
    const workspace = draftingState("Canonical body.");
    const changed = {
      fromRevision: 1, toRevision: 2, scope: "passage" as const,
      start: 0, end: 9, removedText: "Canonical", addedText: "Personal",
    };
    const nextState: DraftingState = {
      ...workspace,
      draft: { ...workspace.draft!, body: "Personal body.", currentRevision: 2 },
      revisions: [...workspace.revisions, { ...workspace.revisions[0]!, revision: 2, body: "Personal body.", source: "manual_edit" }],
    };
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(success({ workspace: nextState, change: changed }))
      .mockResolvedValueOnce(success({ status: "failed" })),
    );
    const sendMessage = vi.fn(async () => ({
      conversationId: "conversation-1",
      message: { role: CONVERSATION_MESSAGE_ROLES.assistant, content: "What changed for you?" },
      activity: ACTIVITIES.discovery,
      move: ASSISTANT_MOVES.probe,
      assistantReadiness: [], userIntention: null,
      ideaMap: { revision: 1, ideas: [idea] },
    }));
    render(<ConversationEditor
      initialConversationId="conversation-1"
      initialDraftingState={workspace}
      initialIdeaMap={{ revision: 1, ideas: [idea] }}
      sendMessage={sendMessage}
    />);
    fireEvent.change(screen.getByLabelText("Canonical draft"), { target: { value: "Personal body." } });
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    await screen.findByLabelText("Attached draft change");
    fireEvent.change(screen.getByLabelText("What are you thinking?"), { target: { value: "Help me understand this." } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await waitFor(() => expect(sendMessage).toHaveBeenCalledWith(
      {
        conversationId: "conversation-1",
        message: "Help me understand this.",
        draftChange: changed,
      },
      expect.any(Object),
    ));
  });
});

function success(data: unknown, status = 200) {
  return new Response(JSON.stringify({ ok: true, data }), { status });
}

function draftingState(body: string): DraftingState {
  return {
    draft: {
      id: "draft-1",
      conversationId: "conversation-1",
      body,
      currentRevision: 1,
      createdAt: "2026-08-02T12:00:00.000Z",
      updatedAt: "2026-08-02T12:00:00.000Z",
    },
    revisions: [{
      revision: 1,
      body,
      source: "initial_composition",
      createdAt: "2026-08-02T12:00:00.000Z",
      proposalId: null,
      restoredFromRevision: null,
    }],
    activeProposal: null,
  };
}
