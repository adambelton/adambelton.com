import { describe, expect, it } from "vitest";
import { createPrismaEntryStore } from "packages/db/src/socratic-draft/entry-store";
import type { PrismaEntryStoreClient } from "packages/db/src/socratic-draft/entry-store";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

describe("Prisma Socratic Draft entry store", () => {
  it("satisfies the EntryStore conversation message contract", async () => {
    const prisma = createFakePrismaEntryStoreClient();
    const entryStore = createPrismaEntryStore(prisma);

    await entryStore.appendConversationTurn({
      entryId: "entry-1",
      userMessage: {
        role: "user",
        content: "I am not sure this draft says what I mean.",
      },
      assistantMessage: {
        role: "assistant",
        content: "What feels furthest from what you mean?",
      },
    });

    await entryStore.appendConversationTurn({
      entryId: "entry-1",
      userMessage: {
        role: "user",
        content: "The conclusion is pretending to be calmer than I am.",
      },
      assistantMessage: {
        role: "assistant",
        content: "That sounds like the tension worth keeping visible.",
      },
    });

    await entryStore.appendConversationTurn({
      entryId: "entry-2",
      userMessage: {
        role: "user",
        content: "A separate draft starts here.",
      },
      assistantMessage: {
        role: "assistant",
        content: "Let's keep this separate.",
      },
    });

    await expect(entryStore.getConversationMessages("entry-1")).resolves.toEqual(
      [
        {
          role: "user",
          content: "I am not sure this draft says what I mean.",
        },
        {
          role: "assistant",
          content: "What feels furthest from what you mean?",
        },
        {
          role: "user",
          content: "The conclusion is pretending to be calmer than I am.",
        },
        {
          role: "assistant",
          content: "That sounds like the tension worth keeping visible.",
        },
      ],
    );
  });
});

type FakeMessageRow = ConversationMessage & {
  entryId: string;
  position: number;
};

function createFakePrismaEntryStoreClient(): PrismaEntryStoreClient {
  const entryIds = new Set<string>();
  const messages: FakeMessageRow[] = [];

  const transaction = {
    socraticDraftEntry: {
      async upsert(input: {
        where: { id: string };
        create: { id: string };
        update: Record<string, never>;
      }) {
        entryIds.add(input.create.id);
        return input;
      },
    },
    socraticDraftConversationMessage: {
      async count(input: { where: { entryId: string } }) {
        return messages.filter(
          (message) => message.entryId === input.where.entryId,
        ).length;
      },
      async createMany(input: { data: FakeMessageRow[] }) {
        messages.push(...input.data);
        return { count: input.data.length };
      },
    },
  };

  return {
    async $transaction(callback) {
      return callback(transaction);
    },
    socraticDraftConversationMessage: {
      async findMany(input) {
        return messages
          .filter((message) => message.entryId === input.where.entryId)
          .sort((first, second) => first.position - second.position)
          .map((message) => ({
            role: message.role,
            content: message.content,
          }));
      },
    },
  };
}
