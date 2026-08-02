import { describe, expect, it } from "vitest";
import type { DatabaseClient } from "packages/db/src/client";
import { createPrismaDraftPersistence } from "packages/db/src/socratic-draft/draft-persistence";
import { createDraftStore } from "packages/products/src/socratic-draft/server/draft";

describe("Prisma Socratic Draft draft persistence", () => {
  it("retains owner-scoped immutable revisions and rejects stale saves", async () => {
    const database = createFakeDraftDatabase([
      { id: "conversation-1", userId: "owner-1" },
    ]);
    const owner = createDraftStore(createPrismaDraftPersistence(
      database.client,
      "owner-1",
    ));
    const otherOwner = createDraftStore(createPrismaDraftPersistence(
      database.client,
      "owner-2",
    ));

    const composed = await owner.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "First draft.",
      createdAt: "2026-08-02T12:00:00.000Z",
    });
    expect(composed.status).toBe("changed");
    await expect(
      otherOwner.getDraftWorkspace("conversation-1"),
    ).resolves.toBeNull();

    const saved = await owner.appendDraftRevision({
      conversationId: "conversation-1",
      operationId: "save-1",
      expectedRevision: 1,
      body: "Owner edit.",
      source: "manual_edit",
      createdAt: "2026-08-02T12:01:00.000Z",
    });
    expect(saved.status).toBe("changed");

    const stale = await owner.appendDraftRevision({
      conversationId: "conversation-1",
      operationId: "save-stale",
      expectedRevision: 1,
      body: "Stale edit.",
      source: "manual_edit",
      createdAt: "2026-08-02T12:02:00.000Z",
    });
    expect(stale.status).toBe("conflict");
    await expect(owner.getDraftWorkspace("conversation-1")).resolves.toMatchObject({
      draft: { body: "Owner edit.", currentRevision: 2 },
      revisions: [
        { revision: 1, source: "initial_composition" },
        { revision: 2, source: "manual_edit" },
      ],
    });
    const reloadedOwner = createDraftStore(createPrismaDraftPersistence(
      database.client,
      "owner-1",
    ));
    await expect(reloadedOwner.getDraftWorkspace("conversation-1")).resolves.toMatchObject({
      draft: { body: "Owner edit.", currentRevision: 2 },
      revisions: [{ revision: 1 }, { revision: 2 }],
    });
  });

  it("persists proposal versions and exact atomic acceptance idempotently", async () => {
    const database = createFakeDraftDatabase([
      { id: "conversation-1", userId: "owner-1" },
    ]);
    const store = createDraftStore(createPrismaDraftPersistence(
      database.client,
      "owner-1",
    ));
    await store.createDraft({
      conversationId: "conversation-1",
      draftId: "draft-1",
      operationId: "compose-1",
      body: "First draft.",
      createdAt: "2026-08-02T12:00:00.000Z",
    });
    await store.createRevisionProposal({
      conversationId: "conversation-1",
      proposalId: "proposal-1",
      operationId: "proposal-operation-1",
      baseDraftRevision: 1,
      scope: "whole_draft",
      originalStart: 0,
      originalEnd: 12,
      originalContent: "First draft.",
      userInstruction: "Make it direct.",
      intendedEffect: "Use direct language.",
      proposedContent: "Reviewed draft.",
      createdAt: "2026-08-02T12:01:00.000Z",
    });

    const accepted = await store.acceptRevisionProposal({
      conversationId: "conversation-1",
      proposalId: "proposal-1",
      operationId: "accept-1",
      expectedDraftRevision: 1,
      createdAt: "2026-08-02T12:02:00.000Z",
    });
    expect(accepted.status).toBe("changed");
    expect("workspace" in accepted && accepted.workspace).toMatchObject({
      draft: { body: "Reviewed draft.", currentRevision: 2 },
      revisions: [
        {},
        {
          revision: 2,
          source: "accepted_proposal",
          proposalId: "proposal-1",
        },
      ],
      activeProposal: { state: "accepted", currentProposalRevision: 1 },
    });

    const retry = await store.acceptRevisionProposal({
      conversationId: "conversation-1",
      proposalId: "proposal-1",
      operationId: "accept-1",
      expectedDraftRevision: 1,
      createdAt: "2026-08-02T12:02:00.000Z",
    });
    expect(retry.status).toBe("duplicate");
    expect(database.revisions).toHaveLength(2);
  });
});

type ConversationRow = { id: string; userId: string };
type DraftRow = {
  id: string;
  conversationId: string;
  body: string;
  currentRevision: number;
  createdAt: Date;
  updatedAt: Date;
};
type RevisionRow = {
  draftId: string;
  revision: number;
  body: string;
  source: string;
  proposalId: string | null;
  restoredFromRevision: number | null;
  createdAt: Date;
};
type ProposalRow = {
  id: string;
  draftId: string;
  baseDraftRevision: number;
  scope: string;
  originalStart: number;
  originalEnd: number;
  originalContent: string;
  userInstruction: string;
  state: string;
  currentProposalRevision: number;
  createdAt: Date;
  resolvedAt: Date | null;
};
type VersionRow = {
  proposalId: string;
  revision: number;
  proposedContent: string;
  intendedEffect: string;
  createdAt: Date;
};

function createFakeDraftDatabase(conversations: ConversationRow[]) {
  const drafts: DraftRow[] = [];
  const revisions: RevisionRow[] = [];
  const proposals: ProposalRow[] = [];
  const versions: VersionRow[] = [];
  const operations: {
    id: string;
    conversationId: string;
    operationId: string;
    kind: string;
  }[] = [];

  function selectedConversation(input: {
    where: { id: string; userId: string };
    select?: { id?: boolean; draft?: unknown };
  }) {
    const conversation = conversations.find((candidate) =>
      candidate.id === input.where.id && candidate.userId === input.where.userId
    );
    if (!conversation) return null;
    if (input.select?.id && !input.select.draft) return { id: conversation.id };
    const draft = drafts.find((candidate) =>
      candidate.conversationId === conversation.id
    );
    return {
      draft: draft ? {
        ...draft,
        revisions: revisions
          .filter((revision) => revision.draftId === draft.id)
          .sort((first, second) => first.revision - second.revision),
        proposals: proposals
          .filter((proposal) => proposal.draftId === draft.id)
          .sort((first, second) =>
            second.createdAt.getTime() - first.createdAt.getTime()
          )
          .slice(0, 1)
          .map((proposal) => ({
            ...proposal,
            versions: versions
              .filter((version) => version.proposalId === proposal.id)
              .sort((first, second) => first.revision - second.revision),
          })),
      } : null,
    };
  }

  const transaction = {
    socraticDraftDraft: {
      async create(input: { data: DraftRow }) {
        drafts.push({ ...input.data });
        return input.data;
      },
      async updateMany(input: {
        where: {
          id: string;
          conversation: { userId: string };
          currentRevision?: number;
        };
        data: Pick<DraftRow, "body" | "currentRevision" | "updatedAt">;
      }) {
        const draft = drafts.find((candidate) => {
          const conversation = conversations.find((item) =>
            item.id === candidate.conversationId
          );
          return candidate.id === input.where.id &&
            conversation?.userId === input.where.conversation.userId &&
            (input.where.currentRevision === undefined ||
              candidate.currentRevision === input.where.currentRevision);
        });
        if (!draft) return { count: 0 };
        Object.assign(draft, input.data);
        return { count: 1 };
      },
    },
    socraticDraftDraftRevision: {
      async create(input: { data: RevisionRow }) {
        revisions.push({ ...input.data });
        return input.data;
      },
    },
    socraticDraftRevisionProposal: {
      async create(input: {
        data: ProposalRow & {
          versions: { create: Omit<VersionRow, "proposalId">[] };
        };
      }) {
        const { versions: nestedVersions, ...proposal } = input.data;
        proposals.push(proposal);
        versions.push(...nestedVersions.create.map((version) => ({
          ...version,
          proposalId: proposal.id,
        })));
        return proposal;
      },
      async updateMany(input: {
        where: { id: string; currentProposalRevision?: number };
        data: Pick<ProposalRow, "state" | "currentProposalRevision" | "resolvedAt">;
      }) {
        const proposal = proposals.find((candidate) =>
          candidate.id === input.where.id &&
          (input.where.currentProposalRevision === undefined ||
            candidate.currentProposalRevision === input.where.currentProposalRevision)
        );
        if (!proposal) return { count: 0 };
        Object.assign(proposal, input.data);
        return { count: 1 };
      },
    },
    socraticDraftRevisionProposalVersion: {
      async create(input: { data: VersionRow }) {
        versions.push({ ...input.data });
        return input.data;
      },
    },
    socraticDraftOperation: {
      async create(input: {
        data: Omit<(typeof operations)[number], "id">;
      }) {
        const operation = { id: `operation-${operations.length + 1}`, ...input.data };
        operations.push(operation);
        return operation;
      },
    },
  };

  const client = {
    socraticDraftConversation: { findFirst: selectedConversation },
    socraticDraftOperation: {
      async findUnique(input: {
        where: {
          conversationId_operationId: {
            conversationId: string;
            operationId: string;
          };
        };
      }) {
        const key = input.where.conversationId_operationId;
        return operations.find((operation) =>
          operation.conversationId === key.conversationId &&
          operation.operationId === key.operationId
        ) ?? null;
      },
    },
    socraticDraftDraft: {
      async deleteMany(input: {
        where: { conversationId: string; conversation: { userId: string } };
      }) {
        const index = drafts.findIndex((draft) => {
          const conversation = conversations.find((item) =>
            item.id === draft.conversationId
          );
          return draft.conversationId === input.where.conversationId &&
            conversation?.userId === input.where.conversation.userId;
        });
        if (index < 0) return { count: 0 };
        drafts.splice(index, 1);
        return { count: 1 };
      },
    },
    async $transaction<T>(callback: (client: typeof transaction) => Promise<T>) {
      return callback(transaction);
    },
  };

  return {
    client: client as unknown as DatabaseClient,
    revisions,
  };
}
