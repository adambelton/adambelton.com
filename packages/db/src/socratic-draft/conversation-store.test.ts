import { describe, expect, it } from "vitest";
import { createPrismaConversationStore } from "packages/db/src/socratic-draft/conversation-store";
import type { PrismaConversationStoreClient } from "packages/db/src/socratic-draft/conversation-store";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

describe("Prisma Socratic Draft conversation store", () => {
  it("lists, loads, and continues conversations within the configured user scope", async () => {
    const prisma = createFakePrismaConversationStoreClient();
    const ownerStore = createPrismaConversationStore(prisma, "owner-1");
    const otherStore = createPrismaConversationStore(prisma, "owner-2");

    await ownerStore.appendConversationTurn({
      conversationId: "conversation-1",
      userMessage: {
        role: "user",
        content: "I am not sure this draft says what I mean.",
      },
      assistantMessage: {
        role: "assistant",
        content: "What feels furthest from what you mean?",
      },
    });
    await ownerStore.appendConversationTurn({
      conversationId: "conversation-1",
      userMessage: {
        role: "user",
        content: "The conclusion is too calm.",
      },
      assistantMessage: {
        role: "assistant",
        content: "What would a more honest ending admit?",
      },
    });

    await expect(ownerStore.listConversations()).resolves.toMatchObject([
      {
        id: "conversation-1",
        label: "I am not sure this draft says what I mean.",
      },
    ]);
    await expect(
      ownerStore.getConversation("conversation-1"),
    ).resolves.toMatchObject({
      id: "conversation-1",
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
    await expect(otherStore.getConversation("conversation-1")).resolves.toBeNull();
    await expect(
      otherStore.getConversationMessages("conversation-1"),
    ).resolves.toBeNull();
    await expect(
      otherStore.appendConversationTurn({
        conversationId: "conversation-1",
        userMessage: { role: "user", content: "This should not be stored." },
        assistantMessage: { role: "assistant", content: "Nor should this." },
      }),
    ).rejects.toThrow("Conversation belongs to another user.");
  });

  it("allocates each appended turn from the conversation's atomic sequence", async () => {
    const prisma = createFakePrismaConversationStoreClient();
    const store = createPrismaConversationStore(prisma, "owner-1");

    await Promise.all([
      store.appendConversationTurn({
        conversationId: "conversation-1",
        userMessage: { role: "user", content: "First user turn" },
        assistantMessage: { role: "assistant", content: "First response" },
      }),
      store.appendConversationTurn({
        conversationId: "conversation-1",
        userMessage: { role: "user", content: "Second user turn" },
        assistantMessage: { role: "assistant", content: "Second response" },
      }),
    ]);

    const conversation = await store.getConversation("conversation-1");
    expect(conversation?.messages).toHaveLength(4);
    expect(conversation?.messages).toEqual([
      { role: "user", content: "First user turn" },
      { role: "assistant", content: "First response" },
      { role: "user", content: "Second user turn" },
      { role: "assistant", content: "Second response" },
    ]);
  });
});

type FakeConversation = {
  id: string;
  userId: string;
  nextMessagePosition: number;
  createdAt: Date;
  updatedAt: Date;
};

type FakeMessage = ConversationMessage & {
  conversationId: string;
  position: number;
};

function createFakePrismaConversationStoreClient(): PrismaConversationStoreClient {
  const conversations: FakeConversation[] = [];
  const messages: FakeMessage[] = [];

  const transaction = {
    socraticDraftConversation: {
      async upsert(input: {
        where: { id_userId: { id: string; userId: string } };
        create: { id: string; userId: string; nextMessagePosition: number };
        update: {
          nextMessagePosition: { increment: number };
          updatedAt: Date;
        };
        select: { nextMessagePosition: true };
      }) {
        const existingConversation = conversations.find(
          (conversation) => conversation.id === input.where.id_userId.id,
        );
        if (existingConversation) {
          if (existingConversation.userId !== input.where.id_userId.userId) {
            throw new Error("Conversation belongs to another user.");
          }
          existingConversation.nextMessagePosition +=
            input.update.nextMessagePosition.increment;
          existingConversation.updatedAt = input.update.updatedAt;
        } else {
          const now = new Date("2026-07-31T10:00:00.000Z");
          conversations.push({ ...input.create, createdAt: now, updatedAt: now });
        }
        const conversation = conversations.find(
          (candidate) => candidate.id === input.where.id_userId.id,
        );
        return { nextMessagePosition: conversation?.nextMessagePosition ?? 0 };
      },
    },
    socraticDraftConversationMessage: {
      async createMany(input: { data: FakeMessage[] }) {
        messages.push(...input.data);
        return { count: input.data.length };
      },
    },
  };

  return {
    async $transaction(callback) {
      return callback(transaction);
    },
    socraticDraftConversation: {
      async findFirst(input) {
        const conversation = conversations.find(
          (candidate) =>
            candidate.id === input.where.id &&
            candidate.userId === input.where.userId,
        );
        return conversation ? toConversationRow(conversation, messages) : null;
      },
      async findMany(input) {
        return conversations
          .filter((conversation) => conversation.userId === input.where.userId)
          .sort(
            (first, second) =>
              second.updatedAt.getTime() - first.updatedAt.getTime(),
          )
          .map((conversation) => ({
            ...toConversationRow(conversation, messages),
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

function toConversationRow(
  conversation: FakeConversation,
  messages: FakeMessage[],
) {
  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: messages
      .filter((message) => message.conversationId === conversation.id)
      .sort((first, second) => first.position - second.position)
      .map(toMessageRow),
  };
}

function toMessageRow(message: FakeMessage) {
  return { role: message.role, content: message.content };
}
