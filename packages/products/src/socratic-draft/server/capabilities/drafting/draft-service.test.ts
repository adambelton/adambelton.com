import { describe, expect, it, vi } from "vitest";
import { createDraftStore } from "packages/products/src/socratic-draft/server/capabilities/drafting/draft-store";
import { TestDraftPersistence } from "packages/products/src/socratic-draft/testing/fakes/test-draft-persistence";
import { DraftService } from "packages/products/src/socratic-draft/server/capabilities/drafting/draft-service";
import type { DraftCompositionModelInput } from "packages/products/src/socratic-draft/server/capabilities/drafting/ports/draft-model";
import {
  DRAFT_WRITE_STATUSES,
} from "packages/products/src/socratic-draft/server/capabilities/drafting/draft-store";
import {
  IDEA_DISPOSITIONS,
  IDEA_EXPLORATION_ASSESSMENTS,
  IDEA_IMPORTANCE_ASSESSMENTS,
  REVISION_PROPOSAL_SCOPES,
  type Idea,
} from "packages/products/src/socratic-draft/shared";

const idea: Idea = {
  id: "idea-1",
  title: "Authorship",
  synthesis: "Approval preserves authorship.",
  substance: "The assistant can suggest language without owning the final text.",
  unresolvedQuestions: [],
  assistantAssessment: {
    exploration: IDEA_EXPLORATION_ASSESSMENTS.wellExplored,
    importance: IDEA_IMPORTANCE_ASSESSMENTS.central,
  },
  userInterpretation: null,
  disposition: IDEA_DISPOSITIONS.active,
};

function createService() {
  const persistence = new TestDraftPersistence();
  persistence.registerWorkspace("conversation-1");
  const store = createDraftStore(persistence);
  const service = new DraftService(
    store,
    { compose: async () => ({ body: "The original draft." }) },
    {
      propose: async ({ originalContent }) => ({
        proposedContent: originalContent.replace("original", "reviewed"),
        intendedEffect: "Use the user's preferred emphasis.",
      }),
    },
    () => new Date("2026-08-02T12:00:00.000Z"),
  );
  return { service, store };
}

describe("DraftService", () => {
  it("composes a first canonical revision from explicitly selected ideas", async () => {
    const { service } = createService();
    const result = await service.compose({
      conversationId: "conversation-1",
      operationId: "compose-1",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose an early draft.",
    });

    expect(result.status).toBe(DRAFT_WRITE_STATUSES.changed);
    expect("workspace" in result && result.workspace.draft?.body).toBe("The original draft.");
    expect("workspace" in result && result.workspace.revisions[0]).toMatchObject({
      revision: 1,
      source: "initial_composition",
      proposalId: null,
      restoredFromRevision: null,
    });
  });

  it("supplies composition with writing material rather than internal idea state", async () => {
    const persistence = new TestDraftPersistence();
    persistence.registerWorkspace("conversation-1");
    const compose = vi.fn(async (_input: DraftCompositionModelInput) => ({
      body: "I remain responsible for the final words.",
    }));
    const service = new DraftService(
      createDraftStore(persistence),
      { compose },
      { propose: async () => ({ proposedContent: "unused", intendedEffect: "unused" }) },
    );

    await service.compose({
      conversationId: "conversation-1",
      operationId: "compose-material",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose in my voice.",
    });

    expect(compose).toHaveBeenCalledWith({
      selectedIdeas: [{
        id: idea.id,
        title: idea.title,
        synthesis: idea.synthesis,
        substance: idea.substance,
        unresolvedQuestions: idea.unresolvedQuestions,
      }],
      relevantConversationLanguage: [],
      instruction: "Compose in my voice.",
    });
    expect(compose.mock.calls[0]?.[0].selectedIdeas[0]).not.toHaveProperty(
      "assistantAssessment",
    );
    expect(compose.mock.calls[0]?.[0].selectedIdeas[0]).not.toHaveProperty(
      "disposition",
    );
  });

  it("preserves newer work when a manual save is stale", async () => {
    const { service } = createService();
    await service.compose({
      conversationId: "conversation-1",
      operationId: "compose-1",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    });
    await service.save({
      conversationId: "conversation-1",
      operationId: "save-1",
      expectedRevision: 1,
      body: "Newer canonical work.",
    });

    const stale = await service.save({
      conversationId: "conversation-1",
      operationId: "save-2",
      expectedRevision: 1,
      body: "Stale work.",
    });

    expect(stale.status).toBe(DRAFT_WRITE_STATUSES.conflict);
    expect("workspace" in stale && stale.workspace.draft?.body).toBe("Newer canonical work.");
  });

  it("preserves exact author whitespace in a manual save", async () => {
    const { service } = createService();
    await service.compose({
      conversationId: "conversation-1",
      operationId: "compose-1",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    });

    const saved = await service.save({
      conversationId: "conversation-1",
      operationId: "save-1",
      expectedRevision: 1,
      body: "\n  Exact author text.  \n",
    });

    expect("workspace" in saved && saved.workspace.draft?.body).toBe(
      "\n  Exact author text.  \n",
    );
    expect(saved.change).toMatchObject({
      fromRevision: 1,
      toRevision: 2,
      removedText: "The original draft.",
      addedText: "\n  Exact author text.  \n",
    });
  });

  it("does not repeat composition model work for a retried operation", async () => {
    const persistence = new TestDraftPersistence();
    persistence.registerWorkspace("conversation-1");
    const compose = vi.fn(async () => ({ body: "One generated draft." }));
    const service = new DraftService(
      createDraftStore(persistence),
      { compose },
      { propose: async () => ({ proposedContent: "unused", intendedEffect: "unused" }) },
    );
    const input = {
      conversationId: "conversation-1",
      operationId: "compose-once",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    };

    await service.compose(input);
    const retry = await service.compose(input);

    expect(compose).toHaveBeenCalledOnce();
    expect(retry.status).toBe(DRAFT_WRITE_STATUSES.duplicate);
  });

  it("restores a snapshot into a new revision without deleting later history", async () => {
    const { service } = createService();
    await service.compose({
      conversationId: "conversation-1",
      operationId: "compose-1",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    });
    await service.save({
      conversationId: "conversation-1",
      operationId: "save-1",
      expectedRevision: 1,
      body: "Second version.",
    });

    const restored = await service.restore({
      conversationId: "conversation-1",
      operationId: "restore-1",
      expectedRevision: 2,
      restoreRevision: 1,
    });

    expect("workspace" in restored && restored.workspace.revisions).toHaveLength(3);
    expect("workspace" in restored && restored.workspace.revisions[2]).toMatchObject({
      revision: 3,
      body: "The original draft.",
      source: "restoration",
      restoredFromRevision: 1,
    });
    expect(restored.change).toMatchObject({
      fromRevision: 2,
      toRevision: 3,
      removedText: "Second version.",
      addedText: "The original draft.",
    });
  });

  it("generates a proposal without mutation and applies reviewed content exactly", async () => {
    const { service, store } = createService();
    await service.compose({
      conversationId: "conversation-1",
      operationId: "compose-1",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    });
    const proposed = await service.propose({
      conversationId: "conversation-1",
      operationId: "proposal-1",
      expectedDraftRevision: 1,
      scope: REVISION_PROPOSAL_SCOPES.wholeDraft,
      userInstruction: "Change the emphasis.",
    });
    if (!("workspace" in proposed) || !proposed.workspace) {
      throw new Error("Expected the revision proposal to be retained.");
    }
    expect(proposed.workspace.draft?.body).toBe("The original draft.");
    const proposalId = proposed.workspace.activeProposal?.id;
    expect(proposalId).toBeTruthy();

    const accepted = await store.acceptRevisionProposal({
      conversationId: "conversation-1",
      proposalId: proposalId!,
      operationId: "accept-1",
      expectedDraftRevision: 1,
      createdAt: "2026-08-02T12:01:00.000Z",
    });
    expect("workspace" in accepted && accepted.workspace.draft?.body).toBe("The reviewed draft.");
    expect("workspace" in accepted && accepted.workspace.revisions[1]).toMatchObject({
      source: "accepted_proposal",
      proposalId,
    });
  });

  it("allows a stale proposal to be explicitly dismissed without changing newer writing", async () => {
    const { service } = createService();
    await service.compose({
      conversationId: "conversation-1",
      operationId: "compose-1",
      selectedIdeaIds: [idea.id],
      ideas: [idea],
      relevantConversationLanguage: [],
      instruction: "Compose.",
    });
    const proposed = await service.propose({
      conversationId: "conversation-1",
      operationId: "proposal-1",
      expectedDraftRevision: 1,
      scope: REVISION_PROPOSAL_SCOPES.wholeDraft,
      userInstruction: "Revise it.",
    });
    if (!("workspace" in proposed) || !proposed.workspace?.activeProposal) {
      throw new Error("Expected an active proposal.");
    }
    const proposalId = proposed.workspace.activeProposal.id;
    await service.save({
      conversationId: "conversation-1",
      operationId: "save-1",
      expectedRevision: 1,
      body: "Newer canonical work.",
    });
    const stale = await service.accept({
      conversationId: "conversation-1",
      proposalId,
      operationId: "accept-1",
      expectedDraftRevision: 1,
    });
    expect("workspace" in stale && stale.workspace.activeProposal?.state).toBe("stale");

    const dismissed = await service.reject({
      conversationId: "conversation-1",
      proposalId,
      operationId: "dismiss-1",
    });

    expect("workspace" in dismissed && dismissed.workspace.draft?.body).toBe("Newer canonical work.");
    expect("workspace" in dismissed && dismissed.workspace.activeProposal?.state).toBe("rejected");
  });
});
