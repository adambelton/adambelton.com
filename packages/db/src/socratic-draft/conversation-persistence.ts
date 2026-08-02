import type { DatabaseClient } from "packages/db/src/client";
import { Prisma } from "packages/db/src/generated/prisma/client";
import {
  CONVERSATION_COMMIT_STATUSES,
  emptyConversationSnapshot,
  type ConversationCommitInput,
  type ConversationPersistence,
  type ConversationPersistenceSnapshot,
} from "packages/products/src/socratic-draft/server/conversation";
import type { IdeaMap } from "packages/products/src/socratic-draft/shared";

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

export function createPrismaConversationPersistence(
  prisma: DatabaseClient,
  userId: string,
): ConversationPersistence {
  async function load(conversationId: string) {
    const row = await prisma.socraticDraftConversation.findFirst({
      where: { id: conversationId, userId },
      select: CONVERSATION_SELECT,
    });
    return row ? toSnapshot(row) : null;
  }

  return {
    async initialize(input) {
      const row = await prisma.socraticDraftConversation.create({
        data: {
          id: input.conversationId,
          userId,
          nextMessagePosition: 0,
          ideaMapRevision: 0,
          createdAt: new Date(input.createdAt),
          updatedAt: new Date(input.createdAt),
        },
        select: CONVERSATION_SELECT,
      });
      return toSnapshot(row);
    },

    load,

    async list() {
      const rows = await prisma.socraticDraftConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: CONVERSATION_SELECT,
      });
      return rows.map(toSnapshot);
    },

    async getCurrent() {
      return null;
    },

    async commit(input: ConversationCommitInput) {
      const current = await load(input.conversationId);
      if (!current) return { status: CONVERSATION_COMMIT_STATUSES.unavailable };
      const duplicate = await prisma.socraticDraftOperation.findUnique({
        where: { conversationId_operationId: {
          conversationId: input.conversationId,
          operationId: input.operationId,
        } },
        select: { id: true },
      });
      if (duplicate) {
        return { status: CONVERSATION_COMMIT_STATUSES.duplicate, snapshot: current };
      }
      if (current.ideaMap.revision !== input.expectedIdeaMapRevision) {
        return { status: CONVERSATION_COMMIT_STATUSES.conflict, snapshot: current };
      }

      const addedMessages = input.nextSnapshot.messages.slice(current.messages.length);
      const ideaMapChanged = input.nextSnapshot.ideaMap.revision !== current.ideaMap.revision;
      let committed: boolean;
      try {
        committed = await prisma.$transaction(async (transaction) => {
        await transaction.socraticDraftOperation.create({
          data: {
            conversationId: input.conversationId,
            operationId: input.operationId,
            kind: input.operationKind,
          },
        });
        const row = await transaction.socraticDraftConversation.findFirst({
          where: { id: input.conversationId, userId },
          select: { nextMessagePosition: true },
        });
        if (!row) throw new ConversationCommitConflictError();
        const update = await transaction.socraticDraftConversation.updateMany({
          where: {
            id: input.conversationId,
            userId,
            ideaMapRevision: input.expectedIdeaMapRevision,
            nextMessagePosition: row.nextMessagePosition,
          },
          data: {
            nextMessagePosition: { increment: addedMessages.length },
            ideaMapRevision: input.nextSnapshot.ideaMap.revision,
            updatedAt: new Date(input.nextSnapshot.updatedAt),
          },
        });
        if (update.count !== 1) throw new ConversationCommitConflictError();
        if (addedMessages.length > 0) {
          await transaction.socraticDraftConversationMessage.createMany({
            data: addedMessages.map((message, index) => ({
              conversationId: input.conversationId,
              role: message.role,
              content: message.content,
              position: row.nextMessagePosition + index,
            })),
          });
        }
        if (ideaMapChanged) {
          await transaction.socraticDraftIdeaMapRevision.create({
            data: {
              conversationId: input.conversationId,
              revision: input.nextSnapshot.ideaMap.revision,
              ideas: input.nextSnapshot.ideaMap.ideas as unknown as Prisma.InputJsonValue,
              sourceType: input.operationKind,
              sourceId: input.operationId,
            },
          });
        }
        return true;
        });
      } catch (error) {
        const latest = await load(input.conversationId);
        if (!latest) return { status: CONVERSATION_COMMIT_STATUSES.unavailable };
        if (isUniqueConstraintError(error)) {
          const completed = await prisma.socraticDraftOperation.findUnique({
            where: { conversationId_operationId: {
              conversationId: input.conversationId,
              operationId: input.operationId,
            } },
            select: { id: true },
          });
          if (completed) {
            return { status: CONVERSATION_COMMIT_STATUSES.duplicate, snapshot: latest };
          }
        }
        if (
          error instanceof ConversationCommitConflictError ||
          isUniqueConstraintError(error)
        ) {
          return { status: CONVERSATION_COMMIT_STATUSES.conflict, snapshot: latest };
        }
        throw error;
      }
      if (!committed) {
        const latest = await load(input.conversationId);
        return latest
          ? { status: CONVERSATION_COMMIT_STATUSES.conflict, snapshot: latest }
          : { status: CONVERSATION_COMMIT_STATUSES.unavailable };
      }
      const snapshot = await load(input.conversationId);
      return snapshot
        ? { status: CONVERSATION_COMMIT_STATUSES.committed, snapshot }
        : { status: CONVERSATION_COMMIT_STATUSES.unavailable };
    },

    async clearCurrent() {},
  };
}

class ConversationCommitConflictError extends Error {}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

type SelectedConversationRow = Prisma.SocraticDraftConversationGetPayload<{
  select: typeof CONVERSATION_SELECT;
}>;

function toSnapshot(
  row: SelectedConversationRow,
): ConversationPersistenceSnapshot {
  const latestIdeaMap = row.ideaMapRevisions[0];
  return {
    ...emptyConversationSnapshot({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
    }),
    messages: row.messages.map((message) => ({ ...message })),
    ideaMap: latestIdeaMap
      ? {
          revision: latestIdeaMap.revision,
          ideas: latestIdeaMap.ideas as unknown as IdeaMap["ideas"],
        }
      : { revision: row.ideaMapRevision, ideas: [] },
    updatedAt: row.updatedAt.toISOString(),
  };
}
