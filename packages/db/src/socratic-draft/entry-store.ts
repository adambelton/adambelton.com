import type {
  AppendConversationTurnInput,
  EntryStore,
} from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

type ConversationMessageRole = ConversationMessage["role"];

type PrismaConversationMessageRow = {
  role: ConversationMessageRole;
  content: string;
};

type PrismaEntryStoreTransaction = {
  socraticDraftEntry: {
    upsert(input: {
      where: { id: string };
      create: { id: string };
      update: Record<string, never>;
    }): Promise<unknown>;
  };
  socraticDraftConversationMessage: {
    count(input: { where: { entryId: string } }): Promise<number>;
    createMany(input: {
      data: {
        entryId: string;
        role: ConversationMessageRole;
        content: string;
        position: number;
      }[];
    }): Promise<unknown>;
  };
};

export type PrismaEntryStoreClient = {
  $transaction<T>(
    callback: (transaction: PrismaEntryStoreTransaction) => Promise<T>,
  ): Promise<T>;
  socraticDraftConversationMessage: {
    findMany(input: {
      where: { entryId: string };
      orderBy: { position: "asc" };
      select: { role: true; content: true };
    }): Promise<PrismaConversationMessageRow[]>;
  };
};

export function createPrismaEntryStore(
  prisma: PrismaEntryStoreClient,
): EntryStore {
  return {
    createEntryId() {
      return globalThis.crypto.randomUUID();
    },

    async getConversationMessages(entryId: string) {
      const messages = await prisma.socraticDraftConversationMessage.findMany({
        where: { entryId },
        orderBy: { position: "asc" },
        select: {
          role: true,
          content: true,
        },
      });

      return messages.map(toConversationMessage);
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      await prisma.$transaction(async (transaction) => {
        await transaction.socraticDraftEntry.upsert({
          where: { id: input.entryId },
          create: { id: input.entryId },
          update: {},
        });

        const existingMessageCount =
          await transaction.socraticDraftConversationMessage.count({
            where: { entryId: input.entryId },
          });

        await transaction.socraticDraftConversationMessage.createMany({
          data: [
            toConversationMessageRow({
              entryId: input.entryId,
              message: input.userMessage,
              position: existingMessageCount,
            }),
            toConversationMessageRow({
              entryId: input.entryId,
              message: input.assistantMessage,
              position: existingMessageCount + 1,
            }),
          ],
        });
      });
    },
  };
}

function toConversationMessage(
  message: PrismaConversationMessageRow,
): ConversationMessage {
  return {
    role: message.role,
    content: message.content,
  };
}

function toConversationMessageRow(input: {
  entryId: string;
  message: ConversationMessage;
  position: number;
}) {
  return {
    entryId: input.entryId,
    role: input.message.role,
    content: input.message.content,
    position: input.position,
  };
}
