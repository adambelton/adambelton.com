import { describe, expect, it } from "vitest";
import { createPrismaConversationPersistence } from "packages/db/src/adapters/thoughtform/conversation-persistence";
import type { DatabaseClient } from "packages/db/src/client/database-client";
import { createConversationStore } from "packages/products/src/thoughtform/server/capabilities/conversation";
import type { ConversationMessage } from "packages/products/src/thoughtform/shared";
import type { IdeaMap } from "packages/products/src/thoughtform/shared";
import type { AppendConversationTurnInput } from "packages/products/src/thoughtform/server/capabilities/conversation";

describe("Prisma ThoughtForm conversation persistence", () => {
  it("creates an owner-scoped empty conversation ready for its first turn", async () => {
    const prisma = createFakePrismaConversationPersistenceClient();
    const ownerStore = createAdapterFixture(prisma, "owner-1");
    const otherStore = createAdapterFixture(prisma, "owner-2");
    const conversation = await ownerStore.createConversation();

    expect(conversation.messages).toEqual([]);
    await expect(ownerStore.getConversation(conversation.id)).resolves.toEqual(
      conversation,
    );
    await expect(otherStore.getConversation(conversation.id)).resolves.toBeNull();

    await ownerStore.appendConversationTurn(createTurn({
      conversationId: conversation.id,
      userMessage: { role: "user", content: "First thought" },
      assistantMessage: { role: "assistant", content: "First response" },
    }));

    await expect(ownerStore.getConversation(conversation.id)).resolves.toMatchObject({
      messages: [
        { role: "user", content: "First thought" },
        { role: "assistant", content: "First response" },
      ],
    });
  });

  it("lists, loads, and continues conversations within the configured user scope", async () => {
    const prisma = createFakePrismaConversationPersistenceClient();
    const ownerStore = createAdapterFixture(prisma, "owner-1");
    const otherStore = createAdapterFixture(prisma, "owner-2");
    const ownerConversation = await ownerStore.createConversation();

    await ownerStore.appendConversationTurn(createTurn({
      conversationId: ownerConversation.id,
      userMessage: {
        role: "user",
        content: "I am not sure this draft says what I mean.",
      },
      assistantMessage: {
        role: "assistant",
        content: "What feels furthest from what you mean?",
      },
    }));
    await ownerStore.appendConversationTurn(createTurn({
      conversationId: ownerConversation.id,
      expectedMessageCount: 2,
      userMessage: {
        role: "user",
        content: "The conclusion is too calm.",
      },
      assistantMessage: {
        role: "assistant",
        content: "What would a more honest ending admit?",
      },
    }));

    await expect(ownerStore.listConversations()).resolves.toMatchObject([
      {
        id: ownerConversation.id,
        label: "I am not sure this draft says what I mean.",
      },
    ]);
    await expect(
      ownerStore.getConversation(ownerConversation.id),
    ).resolves.toMatchObject({
      id: ownerConversation.id,
      messages: [
        { role: "user", content: "I am not sure this draft says what I mean." },
        {
          role: "assistant",
          content: "What feels furthest from what you mean?",
        },
        { role: "user", content: "The conclusion is too calm." },
        {
          role: "assistant",
          content: "What would a more honest ending admit?",
        },
      ],
    });
    await expect(otherStore.listConversations()).resolves.toEqual([]);
    await expect(otherStore.getConversation(ownerConversation.id)).resolves.toBeNull();
    await expect(
      otherStore.getConversationWorkspace?.(ownerConversation.id),
    ).resolves.toBeNull();
    await expect(
      otherStore.appendConversationTurn(createTurn({
        conversationId: ownerConversation.id,
        userMessage: { role: "user", content: "This should not be stored." },
        assistantMessage: { role: "assistant", content: "Nor should this." },
      })),
    ).resolves.toEqual({ status: "conflict" });
  });

  it("rejects one of two overlapping turns instead of duplicating a sequence", async () => {
    const prisma = createFakePrismaConversationPersistenceClient();
    const store = createAdapterFixture(prisma, "owner-1");
    const conversation = await store.createConversation();

    const results = await Promise.all([
      store.appendConversationTurn(createTurn({
        conversationId: conversation.id,
        userMessage: { role: "user", content: "First user turn" },
        assistantMessage: { role: "assistant", content: "First response" },
      })),
      store.appendConversationTurn(createTurn({
        conversationId: conversation.id,
        userMessage: { role: "user", content: "Second user turn" },
        assistantMessage: { role: "assistant", content: "Second response" },
      })),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([
      "conflict",
      "retained",
    ]);
    const retained = await store.getConversation(conversation.id);
    expect(retained?.messages).toHaveLength(2);
  });

  it("retains owner-scoped idea-map revisions and rejects stale replacement", async () => {
    const prisma = createFakePrismaConversationPersistenceClient();
    const store = createAdapterFixture(prisma, "owner-1");
    const conversation = await store.createConversation();
    const ideaMap: IdeaMap = {
      revision: 1,
      ideas: [
        {
          id: "idea-1",
          title: "Football is larger than FIFA",
          synthesis: "Football's legitimacy comes from beyond FIFA's leadership.",
          substance:
            "Players, supporters, clubs, and associations give the game its meaning.",
          unresolvedQuestions: [],
          assistantAssessment: {
            exploration: "developing",
            importance: "central",
          },
          userInterpretation: null,
          disposition: "active",
        },
      ],
      suppressedStructuralOperationSignatures: ["rejected-structure"],
    };
    await expect(
      store.replaceIdeaMap?.({
        conversationId: conversation.id,
        operationId: "idea-action-1",
        expectedRevision: 0,
        ideaMap,
      }),
    ).resolves.toEqual({ status: "retained" });
    await expect(store.getConversation(conversation.id)).resolves.toMatchObject({
      ideaMap,
    });
    await expect(
      store.replaceIdeaMap?.({
        conversationId: conversation.id,
        operationId: "idea-action-2",
        expectedRevision: 0,
        ideaMap: { ...ideaMap, revision: 2 },
      }),
    ).resolves.toEqual({ status: "conflict" });
  });
});

function createTurn(
  input: Pick<
    AppendConversationTurnInput,
    "conversationId" | "userMessage" | "assistantMessage"
  > & { expectedMessageCount?: number },
): AppendConversationTurnInput {
  return {
    ...input,
    operationId: globalThis.crypto.randomUUID(),
    expectedMessageCount: input.expectedMessageCount ?? 0,
    expectedIdeaMapRevision: 0,
    ideaMap: { revision: 0, ideas: [] },
  };
}

type FakeConversation = {
  id: string;
  userId: string;
  nextMessagePosition: number;
  createdAt: Date;
  updatedAt: Date;
  ideaMapRevision: number;
};

type FakeMessage = ConversationMessage & {
  conversationId: string;
  position: number;
};

function createAdapterFixture(
  prisma: ReturnType<typeof createFakePrismaConversationPersistenceClient>,
  userId: string,
) {
  return createConversationStore(
    createPrismaConversationPersistence(prisma as unknown as DatabaseClient, userId),
    { now: () => new Date("2026-07-31T10:00:00.000Z") },
  );
}

function createFakePrismaConversationPersistenceClient() {
  const conversations: FakeConversation[] = [];
  const messages: FakeMessage[] = [];
  const revisions: FakeRevision[] = [];
  const operations: { conversationId: string; operationId: string; kind: string }[] = [];

  const transaction = {
    thoughtFormConversation: {
      async findFirst(input: { where: { id: string; userId: string } }) {
        const conversation = conversations.find(
          (candidate) =>
            candidate.id === input.where.id && candidate.userId === input.where.userId,
        );
        return conversation
          ? { nextMessagePosition: conversation.nextMessagePosition }
          : null;
      },
      async updateMany(input: {
        where: {
          id: string;
          userId: string;
          ideaMapRevision: number;
          nextMessagePosition?: number;
        };
        data: {
          nextMessagePosition?: { increment: number };
          ideaMapRevision: number;
          updatedAt: Date;
        };
      }) {
        const conversation = conversations.find(
          (candidate) =>
            candidate.id === input.where.id &&
            candidate.userId === input.where.userId &&
            candidate.ideaMapRevision === input.where.ideaMapRevision &&
            (input.where.nextMessagePosition === undefined ||
              candidate.nextMessagePosition === input.where.nextMessagePosition),
        );
        if (!conversation) return { count: 0 };
        conversation.nextMessagePosition += input.data.nextMessagePosition?.increment ?? 0;
        conversation.ideaMapRevision = input.data.ideaMapRevision;
        conversation.updatedAt = input.data.updatedAt;
        return { count: 1 };
      },
    },
    thoughtFormConversationMessage: {
      async createMany(input: { data: FakeMessage[] }) {
        messages.push(...input.data);
        return { count: input.data.length };
      },
    },
    thoughtFormIdeaMapRevision: {
      async create(input: {
        data: FakeRevision;
      }) {
        revisions.push(input.data);
        return input.data;
      },
    },
    thoughtFormOperation: {
      async create(input: { data: { conversationId: string; operationId: string; kind: string } }) {
        operations.push(input.data);
        return input.data;
      },
    },
  };

  return {
    async $transaction<T>(callback: (client: typeof transaction) => Promise<T>) {
      return callback(transaction);
    },
    thoughtFormOperation: {
      async findUnique(input: { where: { conversationId_operationId: { conversationId: string; operationId: string } } }) {
        return operations.find((operation) =>
          operation.conversationId === input.where.conversationId_operationId.conversationId &&
          operation.operationId === input.where.conversationId_operationId.operationId,
        ) ?? null;
      },
    },
    thoughtFormConversation: {
      async create(input: { data: Omit<FakeConversation, "createdAt" | "updatedAt"> & { createdAt: Date; updatedAt: Date } }) {
        const now = new Date("2026-07-31T10:00:00.000Z");
        const conversation = {
          ...input.data,
          createdAt: now,
          updatedAt: now,
        };
        conversations.push(conversation);
        return toConversationRow(conversation, messages, revisions);
      },
      async findFirst(input: { where: { id: string; userId: string } }) {
        const conversation = conversations.find(
          (candidate) =>
            candidate.id === input.where.id &&
            candidate.userId === input.where.userId,
        );
        return conversation
          ? toConversationRow(conversation, messages, revisions)
          : null;
      },
      async findMany(input: { where: { userId: string } }) {
        return conversations
          .filter((conversation) => conversation.userId === input.where.userId)
          .sort(
            (first, second) =>
              second.updatedAt.getTime() - first.updatedAt.getTime(),
          )
          .map((conversation) => ({
            ...toConversationRow(conversation, messages, revisions),
            messages: messages
              .filter(
                (message) =>
                  message.conversationId === conversation.id &&
                  message.role === "user",
              )
              .sort((first, second) => first.position - second.position)
              .slice(0, 1)
              .map(toMessageRow),
          }));
      },
    },
  };
}

type FakeRevision = {
  conversationId: string;
  revision: number;
  ideas: unknown;
  potentialConflicts?: unknown;
  structuralChange?: unknown;
  suppressedStructuralOperationSignatures?: unknown;
};

function toConversationRow(
  conversation: FakeConversation,
  messages: FakeMessage[],
  revisions: FakeRevision[],
) {
  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    ideaMapRevision: conversation.ideaMapRevision,
    ideaMapRevisions: revisions
      .filter((revision) => revision.conversationId === conversation.id)
      .sort((first, second) => second.revision - first.revision)
      .slice(0, 1)
      .map((revision) => ({ ...revision })),
    messages: messages
      .filter((message) => message.conversationId === conversation.id)
      .sort((first, second) => first.position - second.position)
      .map(toMessageRow),
  };
}

function toMessageRow(message: FakeMessage) {
  return { role: message.role, content: message.content };
}
