import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDatabaseClient, type DatabaseClient } from "packages/db/src/client";
import { createPrismaDraftPersistence } from "packages/db/src/socratic-draft/draft-persistence";
import {
  createDraftStore,
  DRAFT_WRITE_STATUSES,
} from "packages/products/src/socratic-draft/server/draft";

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("Prisma draft persistence integration", () => {
  let prisma: DatabaseClient;
  const userId = `draft-integration-${globalThis.crypto.randomUUID()}`;
  const conversationId = `draft-integration-${globalThis.crypto.randomUUID()}`;

  beforeAll(async () => {
    prisma = createDatabaseClient(databaseUrl!);
    await prisma.user.create({
      data: {
        id: userId,
        name: "Draft integration test",
        email: `${userId}@example.invalid`,
        isOwner: true,
      },
    });
    await prisma.socraticDraftConversation.create({
      data: { id: conversationId, userId },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("serializes concurrent revisions and returns a stable conflict", async () => {
    const store = createDraftStore(
      createPrismaDraftPersistence(prisma, userId),
    );
    const createdAt = "2026-08-02T12:00:00.000Z";
    await store.createDraft({
      conversationId,
      draftId: globalThis.crypto.randomUUID(),
      operationId: "compose",
      body: "Initial body.",
      createdAt,
    });

    const results = await Promise.all([
      store.appendDraftRevision({
        conversationId,
        operationId: "save-a",
        expectedRevision: 1,
        body: "Revision A.",
        source: "manual_edit",
        createdAt,
      }),
      store.appendDraftRevision({
        conversationId,
        operationId: "save-b",
        expectedRevision: 1,
        body: "Revision B.",
        source: "manual_edit",
        createdAt,
      }),
    ]);

    expect(results.map((result) => result.status).sort()).toEqual([
      DRAFT_WRITE_STATUSES.changed,
      DRAFT_WRITE_STATUSES.conflict,
    ].sort());
    const workspace = await store.getDraftWorkspace(conversationId);
    expect(workspace?.draft?.currentRevision).toBe(2);
    expect(workspace?.revisions).toHaveLength(2);
  });
});
