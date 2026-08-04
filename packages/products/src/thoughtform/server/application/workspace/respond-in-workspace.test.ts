import { describe, expect, it } from "vitest";
import { createConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import { TestConversationPersistence } from "packages/products/src/thoughtform/testing/fakes/test-conversation-persistence";
import { respondInWorkspace } from "packages/products/src/thoughtform/server/application/workspace/respond-in-workspace";
import {
  ACTIVITIES,
  ASSISTANT_MOVES,
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  type Idea,
} from "packages/products/src/thoughtform/shared";

const idea: Idea = {
  id: "idea-1",
  title: "My dog is barking",
  synthesis: "My dog's barking makes me angry.",
  substance: "I feel angry when my dog barks at animals in the garden.",
  unresolvedQuestions: ["What does my anger make me want to do?"],
  disposition: IDEA_DISPOSITIONS.active,
  assistantAssessment: {
    exploration: IDEA_EXPLORATION_ASSESSMENTS.developing,
    importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
  },
  userInterpretation: null,
};

describe("respondInWorkspace", () => {
  it("retains discussion of an attached saved change without canonising model interpretation", async () => {
    const conversations = createConversationStore(
      new TestConversationPersistence(),
      { initializeOnAppend: true },
    );
    const conversationId = conversations.createConversationId();
    await conversations.appendConversationTurn({
      conversationId,
      operationId: "seed-turn",
      userMessage: { role: "user", content: "My dog is barking." },
      assistantMessage: { role: "assistant", content: "How does that feel?" },
      expectedIdeaMapRevision: 0,
      ideaMap: { revision: 1, ideas: [idea] },
    });

    const result = await respondInWorkspace({
      conversationId,
      message: "I deleted that paragraph because I did not like it.",
      conversations,
      draftChange: {
        fromRevision: 1,
        toRevision: 2,
        scope: "passage",
        start: 0,
        end: 22,
        removedText: "I blame myself for it.",
        addedText: "",
      },
      conversation: {
        respond: async () => ({
          conversationId,
          message: {
            role: "assistant",
            content: "What about that paragraph did you want to remove?",
          },
          activity: ACTIVITIES.discovery,
          move: ASSISTANT_MOVES.clarify,
          assistantReadiness: [],
          userIntention: null,
          proposedIdeas: [{
            ...idea,
            synthesis: "I deleted self-blame because I no longer believe it.",
          }],
          proposedIdeaActions: null,
        }),
      },
    });

    expect(result.status).toBe("responded");
    if (result.status !== "responded") return;
    expect(result.response.ideaMap).toEqual({ revision: 1, ideas: [idea] });
    expect(result.events).toEqual([{
      type: "conversation_turn_retained",
      conversationId,
    }]);
    expect((await conversations.getConversationWorkspace(conversationId))?.ideaMap)
      .toEqual({ revision: 1, ideas: [idea] });
  });
});
