import type {
  AppendConversationTurnInput,
  PersistentConversationStore,
} from "packages/products/src/socratic-draft/server/conversation";
import { createConversationLabel } from "packages/products/src/socratic-draft/server/conversation";
import {
  CONVERSATION_MESSAGE_ROLES,
  EMPTY_IDEA_MAP,
  IDEA_MAP_REVISION_SOURCE_TYPES,
  type ConversationMessage,
  type IdeaMap,
} from "packages/products/src/socratic-draft/shared";
import type { DatabaseClient } from "packages/db/src/client";

type MessageRole = ConversationMessage["role"];
interface MessageRow { role: MessageRole; content: string }
interface IdeaRevisionRow { revision: number; ideas: unknown }
interface ConversationRow {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  ideaMapRevision: number;
  messages: MessageRow[];
  ideaMapRevisions: IdeaRevisionRow[];
}

interface TransactionClient {
  socraticDraftConversation: {
    findFirst(input: {
      where: { id: string; userId: string };
      select: { nextMessagePosition: true };
    }): Promise<{ nextMessagePosition: number } | null>;
    updateMany(input: {
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
    }): Promise<{ count: number }>;
  };
  socraticDraftConversationMessage: {
    createMany(input: {
      data: {
        conversationId: string;
        role: MessageRole;
        content: string;
        position: number;
      }[];
    }): Promise<unknown>;
  };
  socraticDraftIdeaMapRevision: {
    create(input: {
      data: {
        conversationId: string;
        revision: number;
        ideas: unknown;
        sourceType: string;
        sourceId: string;
      };
    }): Promise<unknown>;
  };
}

interface ConversationSelect {
  id: true;
  createdAt: true;
  updatedAt: true;
  ideaMapRevision: true;
  messages: unknown;
  ideaMapRevisions: unknown;
}

export interface PrismaConversationStoreClient {
  $transaction<T>(callback: (transaction: TransactionClient) => Promise<T>): Promise<T>;
  socraticDraftConversation: {
    create(input: {
      data: {
        id: string;
        userId: string;
        nextMessagePosition: number;
        ideaMapRevision: number;
      };
      select: ConversationSelect;
    }): Promise<ConversationRow>;
    findFirst(input: {
      where: { id: string; userId: string };
      select: ConversationSelect;
    }): Promise<ConversationRow | null>;
    findMany(input: {
      where: { userId: string };
      orderBy: { updatedAt: "desc" };
      select: {
        id: true;
        createdAt: true;
        updatedAt: true;
        ideaMapRevision: true;
        messages: unknown;
        ideaMapRevisions: unknown;
      };
    }): Promise<ConversationRow[]>;
  };
}

export function createPrismaConversationStoreClient(
  prisma: DatabaseClient,
): PrismaConversationStoreClient {
  return {
    $transaction: (callback) =>
      prisma.$transaction((transaction) =>
        callback(transaction as unknown as TransactionClient),
      ),
    socraticDraftConversation:
      prisma.socraticDraftConversation as unknown as PrismaConversationStoreClient["socraticDraftConversation"],
  };
}

const CONVERSATION_SELECT = {
  id: true,
  createdAt: true,
  updatedAt: true,
  ideaMapRevision: true,
  messages: {
    orderBy: { position: "asc" },
    select: { role: true, content: true },
  },
  ideaMapRevisions: {
    orderBy: { revision: "desc" },
    take: 1,
    select: { revision: true, ideas: true },
  },
} as const;

export function createPrismaConversationStore(
  prisma: PrismaConversationStoreClient,
  userId: string,
): PersistentConversationStore {
  return {
    createConversationId() {
      return globalThis.crypto.randomUUID();
    },

    async getConversationWorkspace(conversationId) {
      const conversation = await findConversation(prisma, userId, conversationId);
      return conversation
        ? {
            messages: conversation.messages.map(toConversationMessage),
            ideaMap: toIdeaMap(conversation),
          }
        : null;
    },

    async appendConversationTurn(input: AppendConversationTurnInput) {
      const expectedRevision = input.expectedIdeaMapRevision;
      const nextIdeaMap = input.ideaMap;
      const retained = await prisma.$transaction(async (transaction) => {
        const conversation = await transaction.socraticDraftConversation.findFirst({
          where: { id: input.conversationId, userId },
          select: { nextMessagePosition: true },
        });
        if (!conversation) return false;

        const update = await transaction.socraticDraftConversation.updateMany({
          where: {
            id: input.conversationId,
            userId,
            ideaMapRevision: expectedRevision,
            nextMessagePosition: conversation.nextMessagePosition,
          },
          data: {
            nextMessagePosition: { increment: 2 },
            ideaMapRevision: nextIdeaMap.revision,
            updatedAt: new Date(),
          },
        });
        if (update.count !== 1) return false;

        await transaction.socraticDraftConversationMessage.createMany({
          data: [
            toMessageRow(input.conversationId, input.userMessage, conversation.nextMessagePosition),
            toMessageRow(input.conversationId, input.assistantMessage, conversation.nextMessagePosition + 1),
          ],
        });
        if (nextIdeaMap.revision !== expectedRevision) {
          await transaction.socraticDraftIdeaMapRevision.create({
            data: {
              conversationId: input.conversationId,
              revision: nextIdeaMap.revision,
              ideas: nextIdeaMap.ideas,
              sourceType: IDEA_MAP_REVISION_SOURCE_TYPES.conversationTurn,
              sourceId: input.operationId,
            },
          });
        }
        return true;
      });
      return retained ? { status: "retained" } : { status: "conflict" };
    },

    async replaceIdeaMap(input) {
      const retained = await prisma.$transaction(async (transaction) => {
        const update = await transaction.socraticDraftConversation.updateMany({
          where: {
            id: input.conversationId,
            userId,
            ideaMapRevision: input.expectedRevision,
          },
          data: {
            ideaMapRevision: input.ideaMap.revision,
            updatedAt: new Date(),
          },
        });
        if (update.count !== 1) return false;
        await transaction.socraticDraftIdeaMapRevision.create({
          data: {
            conversationId: input.conversationId,
            revision: input.ideaMap.revision,
            ideas: input.ideaMap.ideas,
            sourceType: IDEA_MAP_REVISION_SOURCE_TYPES.ideaAction,
            sourceId: input.operationId,
          },
        });
        return true;
      });
      return retained ? { status: "retained" } : { status: "conflict" };
    },

    async createConversation() {
      const conversation = await prisma.socraticDraftConversation.create({
        data: {
          id: globalThis.crypto.randomUUID(),
          userId,
          nextMessagePosition: 0,
          ideaMapRevision: 0,
        },
        select: CONVERSATION_SELECT,
      });
      return {
        ...toSummary(conversation),
        messages: [],
        ideaMap: { ...EMPTY_IDEA_MAP, ideas: [] },
      };
    },

    async listConversations() {
      const rows = await prisma.socraticDraftConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
          ...CONVERSATION_SELECT,
          messages: {
            where: { role: CONVERSATION_MESSAGE_ROLES.user },
            orderBy: { position: "asc" },
            take: 1,
            select: { role: true, content: true },
          },
        },
      });
      return rows.map(toSummary);
    },

    async getConversation(conversationId) {
      const conversation = await findConversation(prisma, userId, conversationId);
      return conversation
        ? {
            ...toSummary(conversation),
            messages: conversation.messages.map(toConversationMessage),
            ideaMap: toIdeaMap(conversation),
          }
        : null;
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
    select: CONVERSATION_SELECT,
  });
}

function toSummary(conversation: ConversationRow) {
  return {
    id: conversation.id,
    label: createConversationLabel(conversation.messages),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

function toIdeaMap(conversation: ConversationRow): IdeaMap {
  const latest = conversation.ideaMapRevisions[0];
  return latest
    ? { revision: latest.revision, ideas: latest.ideas as IdeaMap["ideas"] }
    : { revision: conversation.ideaMapRevision, ideas: [] };
}

function toConversationMessage(message: MessageRow): ConversationMessage {
  return { role: message.role, content: message.content };
}

function toMessageRow(
  conversationId: string,
  message: ConversationMessage,
  position: number,
) {
  return { conversationId, role: message.role, content: message.content, position };
}
