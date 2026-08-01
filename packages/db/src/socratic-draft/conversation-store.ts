import type {
  AppendConversationTurnInput,
  PersistentConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import { createConversationLabel } from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationMessage } from "packages/products/src/socratic-draft/shared";

type ConversationMessageRole = ConversationMessage["role"];

type PrismaConversationMessageRow = {
  role: ConversationMessageRole;
  content: string;
};

type PrismaConversationRow = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  messages: PrismaConversationMessageRow[];
};

type PrismaConversationStoreTransaction = {
  socraticDraftConversation: {
    upsert(input: {
      where: { id_userId: { id: string; userId: string } };
      create: {
        id: string;
        userId: string;
        nextMessagePosition: number;
      };
      update: {
        nextMessagePosition: { increment: number };
        updatedAt: Date;
      };
      select: { nextMessagePosition: true };
    }): Promise<{ nextMessagePosition: number }>;
  };
  socraticDraftConversationMessage: {
    createMany(input: {
      data: {
        conversationId: string;
        role: ConversationMessageRole;
        content: string;
        position: number;
      }[];
    }): Promise<unknown>;
  };
};

type ConversationSelectInput = {
  where: { id: string; userId: string };
  select: {
    id: true;
    createdAt: true;
    updatedAt: true;
    messages: {
      orderBy: { position: "asc" };
      select: { role: true; content: true };
    };
  };
};

export type PrismaConversationStoreClient = {
  $transaction<T>(
    callback: (transaction: PrismaConversationStoreTransaction) => Promise<T>,
  ): Promise<T>;
  socraticDraftConversation: {
    create(input: {
      data: { id: string; userId: string; nextMessagePosition: number };
      select: { id: true; createdAt: true; updatedAt: true; messages: true };
    }): Promise<PrismaConversationRow>;
    findFirst(
      input: ConversationSelectInput,
    ): Promise<PrismaConversationRow | null>;
    findMany(input: {
      where: { userId: string };
      orderBy: { updatedAt: "desc" };
      select: {
        id: true;
        createdAt: true;
        updatedAt: true;
        messages: {
          where: { role: "user" };
          orderBy: { position: "asc" };
          take: 1;
          select: { role: true; content: true };
        };
      };
    }): Promise<PrismaConversationRow[]>;
  };
};

export function createPrismaConversationStore(
  prisma: PrismaConversationStoreClient,
  userId: string,
): PersistentConversationStore {
  return {
    createConversationId() {
      return globalThis.crypto.randomUUID();
    },

    async getConversationMessages(conversationId: string) {
      const conversation = await findConversation(
        prisma,
        userId,
        conversationId,
      );

      return conversation
        ? conversation.messages.map(toConversationMessage)
        : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      await prisma.$transaction(async (transaction) => {
        const updatedAt = new Date();
        const conversation = await transaction.socraticDraftConversation.upsert({
          where: {
            id_userId: { id: input.conversationId, userId },
          },
          create: {
            id: input.conversationId,
            userId,
            nextMessagePosition: 2,
          },
          update: {
            nextMessagePosition: { increment: 2 },
            updatedAt,
          },
          select: { nextMessagePosition: true },
        });
        const firstMessagePosition = conversation.nextMessagePosition - 2;

        await transaction.socraticDraftConversationMessage.createMany({
          data: [
            toConversationMessageRow({
              conversationId: input.conversationId,
              message: input.userMessage,
              position: firstMessagePosition,
            }),
            toConversationMessageRow({
              conversationId: input.conversationId,
              message: input.assistantMessage,
              position: firstMessagePosition + 1,
            }),
          ],
        });
      });
      return { status: "retained" };
    },

    async createConversation() {
      const conversation = await prisma.socraticDraftConversation.create({
        data: {
          id: globalThis.crypto.randomUUID(),
          userId,
          nextMessagePosition: 0,
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          messages: true,
        },
      });

      return {
        ...toConversationSummary(conversation),
        messages: [],
      };
    },

    async listConversations() {
      const conversations = await prisma.socraticDraftConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            where: { role: "user" },
            orderBy: { position: "asc" },
            take: 1,
            select: { role: true, content: true },
          },
        },
      });

      return conversations.map(toConversationSummary);
    },

    async getConversation(conversationId: string) {
      const conversation = await findConversation(
        prisma,
        userId,
        conversationId,
      );

      if (!conversation) {
        return null;
      }

      return {
        ...toConversationSummary(conversation),
        messages: conversation.messages.map(toConversationMessage),
      };
    },
  };
}

function findConversation(
  prisma: PrismaConversationStoreClient,
  userId: string,
  conversationId: string,
) {
  return prisma.socraticDraftConversation.findFirst({
    where: { id: conversationId, userId },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { position: "asc" },
        select: { role: true, content: true },
      },
    },
  });
}

function toConversationSummary(conversation: PrismaConversationRow) {
  return {
    id: conversation.id,
    label: createConversationLabel(conversation.messages),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
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
  conversationId: string;
  message: ConversationMessage;
  position: number;
}) {
  return {
    conversationId: input.conversationId,
    role: input.message.role,
    content: input.message.content,
    position: input.position,
  };
}
