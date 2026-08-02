import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabaseClient, type DatabaseClient } from "packages/db/src/client";
import { createPrismaConversationPersistence } from "packages/db/src/socratic-draft/conversation-persistence";
import {
  CONVERSATION_COMMIT_STATUSES,
  createConversationStore,
  emptyConversationSnapshot,
} from "packages/products/src/socratic-draft/server/conversation";
import type { ConversationPersistenceSnapshot } from "packages/products/src/socratic-draft/server/conversation";

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("Prisma conversation persistence integration", () => {
  let prisma: DatabaseClient;
  const userId = `conversation-integration-${globalThis.crypto.randomUUID()}`;
  const otherUserId = `conversation-integration-${globalThis.crypto.randomUUID()}`;

  beforeAll(async () => {
    prisma = createDatabaseClient(databaseUrl!);
    await prisma.user.createMany({
      data: [userId, otherUserId].map((id) => ({
        id,
        name: "Conversation integration test",
        email: `${id}@example.invalid`,
        isOwner: true,
      })),
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
    await prisma.$disconnect();
  });

  it("serializes concurrent turns with unique ordered positions", async () => {
    const conversationId = globalThis.crypto.randomUUID();
    const persistence = createPrismaConversationPersistence(prisma, userId);
    await persistence.initialize({ conversationId, createdAt: now() });
    const store = createConversationStore(persistence);

    const results = await Promise.all([
      store.appendConversationTurn(turn(conversationId, "operation-a", "First")),
      store.appendConversationTurn(turn(conversationId, "operation-b", "Second")),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([
      "conflict",
      "retained",
    ]);
    const messages = await prisma.socraticDraftConversationMessage.findMany({
      where: { conversationId },
      orderBy: { position: "asc" },
      select: { position: true },
    });
    expect(messages).toEqual([{ position: 0 }, { position: 1 }]);
  });

  it("returns duplicate without appending a repeated operation", async () => {
    const conversationId = globalThis.crypto.randomUUID();
    const persistence = createPrismaConversationPersistence(prisma, userId);
    const current = await persistence.initialize({ conversationId, createdAt: now() });
    if (!current) throw new Error("Expected an initialized conversation.");
    const input = commitInput(current, "same-operation");

    expect((await persistence.commit(input)).status).toBe(
      CONVERSATION_COMMIT_STATUSES.committed,
    );
    expect((await persistence.commit(input)).status).toBe(
      CONVERSATION_COMMIT_STATUSES.duplicate,
    );
    expect(await prisma.socraticDraftConversationMessage.count({
      where: { conversationId },
    })).toBe(2);
  });

  it("rolls back the operation reservation and messages when a later write fails", async () => {
    const conversationId = globalThis.crypto.randomUUID();
    const persistence = createPrismaConversationPersistence(prisma, userId);
    const current = await persistence.initialize({ conversationId, createdAt: now() });
    if (!current) throw new Error("Expected an initialized conversation.");
    await prisma.socraticDraftIdeaMapRevision.create({
      data: {
        conversationId,
        revision: 1,
        ideas: [],
        sourceType: "fixture",
        sourceId: "fixture",
      },
    });

    const result = await persistence.commit({
      ...commitInput(current, "rollback-operation"),
      nextSnapshot: {
        ...commitInput(current, "rollback-operation").nextSnapshot,
        ideaMap: { revision: 1, ideas: [] },
      },
    });

    expect(result.status).toBe(CONVERSATION_COMMIT_STATUSES.conflict);
    expect(await prisma.socraticDraftOperation.count({
      where: { conversationId, operationId: "rollback-operation" },
    })).toBe(0);
    expect(await prisma.socraticDraftConversationMessage.count({
      where: { conversationId },
    })).toBe(0);
  });

  it("keeps reads owner-scoped and cascades the complete workspace", async () => {
    const conversationId = globalThis.crypto.randomUUID();
    const persistence = createPrismaConversationPersistence(prisma, userId);
    const current = await persistence.initialize({ conversationId, createdAt: now() });
    if (!current) throw new Error("Expected an initialized conversation.");
    await persistence.commit(commitInput(current, "cascade-operation"));
    await prisma.socraticDraftDraft.create({
      data: {
        id: globalThis.crypto.randomUUID(),
        conversationId,
        body: "Canonical draft.",
        revisions: {
          create: {
            revision: 1,
            body: "Canonical draft.",
            source: "initial_composition",
          },
        },
      },
    });

    await expect(
      createPrismaConversationPersistence(prisma, otherUserId).load(conversationId),
    ).resolves.toBeNull();
    await prisma.socraticDraftConversation.delete({
      where: { id: conversationId },
    });

    expect(await prisma.socraticDraftConversationMessage.count({ where: { conversationId } })).toBe(0);
    expect(await prisma.socraticDraftOperation.count({ where: { conversationId } })).toBe(0);
    expect(await prisma.socraticDraftDraft.count({ where: { conversationId } })).toBe(0);
  });
});

function now() {
  return "2026-08-02T12:00:00.000Z";
}

function turn(conversationId: string, operationId: string, label: string) {
  return {
    conversationId,
    operationId,
    expectedIdeaMapRevision: 0,
    userMessage: { role: "user" as const, content: `${label} user message` },
    assistantMessage: { role: "assistant" as const, content: `${label} assistant message` },
    ideaMap: { revision: 0, ideas: [] },
  };
}

function commitInput(
  current: ConversationPersistenceSnapshot,
  operationId: string,
) {
  return {
    conversationId: current.id,
    operationId,
    operationKind: "conversation_turn" as const,
    expectedIdeaMapRevision: 0,
    nextSnapshot: {
      ...emptyConversationSnapshot({ id: current.id, createdAt: current.createdAt }),
      messages: [
        { role: "user" as const, content: "Retained user message" },
        { role: "assistant" as const, content: "Retained assistant message" },
      ],
      updatedAt: now(),
    },
  };
}
