import type { DatabaseClient } from "packages/db/src/client";
import { Prisma } from "packages/db/src/generated/prisma/client";
import {
  DRAFT_COMMIT_STATUSES,
  type DraftCommitInput,
  type DraftPersistence,
} from "packages/products/src/socratic-draft/server/draft";
import {
  EMPTY_DRAFT_WORKSPACE,
  type DraftWorkspace,
  type RevisionProposalScope,
  type RevisionProposalState,
} from "packages/products/src/socratic-draft/shared";

export function createPrismaDraftPersistence(
  prisma: DatabaseClient,
  userId: string,
): DraftPersistence {
  async function load(conversationId: string): Promise<DraftWorkspace | null> {
    const conversation = await prisma.socraticDraftConversation.findFirst({
      where: { id: conversationId, userId },
      select: { draft: { select: {
        id: true, conversationId: true, body: true, currentRevision: true, createdAt: true, updatedAt: true,
        revisions: { orderBy: { revision: "asc" }, select: { revision: true, body: true, source: true, createdAt: true, proposalId: true, restoredFromRevision: true } },
        proposals: { orderBy: { createdAt: "desc" }, take: 1, select: {
          id: true, draftId: true, baseDraftRevision: true, scope: true, originalStart: true, originalEnd: true,
          originalContent: true, userInstruction: true, state: true, currentProposalRevision: true, createdAt: true, resolvedAt: true,
          versions: { orderBy: { revision: "asc" }, select: { revision: true, proposedContent: true, intendedEffect: true, createdAt: true } },
        } },
      } } },
    });
    if (!conversation) return null;
    if (!conversation.draft) return structuredClone(EMPTY_DRAFT_WORKSPACE);
    const draft = conversation.draft;
    const proposal = draft.proposals[0];
    return {
      draft: { id: draft.id, conversationId: draft.conversationId, body: draft.body, currentRevision: draft.currentRevision, createdAt: draft.createdAt.toISOString(), updatedAt: draft.updatedAt.toISOString() },
      revisions: draft.revisions.map((revision) => ({ ...revision, source: revision.source as DraftWorkspace["revisions"][number]["source"], createdAt: revision.createdAt.toISOString() })),
      activeProposal: proposal ? {
        ...proposal,
        scope: proposal.scope as RevisionProposalScope,
        state: proposal.state as RevisionProposalState,
        createdAt: proposal.createdAt.toISOString(),
        resolvedAt: proposal.resolvedAt?.toISOString() ?? null,
        versions: proposal.versions.map((version) => ({ ...version, createdAt: version.createdAt.toISOString() })),
      } : null,
    };
  }

  return {
    async initialize(conversationId) {
      const exists = await prisma.socraticDraftConversation.findFirst({
        where: { id: conversationId, userId },
        select: { id: true },
      });
      return exists ? structuredClone(EMPTY_DRAFT_WORKSPACE) : null;
    },

    async loadCompletedOperation(conversationId, operationId) {
      const operation = await prisma.socraticDraftOperation.findUnique({
        where: {
          conversationId_operationId: { conversationId, operationId },
        },
        select: { id: true },
      });
      return operation ? load(conversationId) : null;
    },

    load,

    async commit(input: DraftCommitInput) {
      const current = await load(input.conversationId);
      if (!current) return { status: DRAFT_COMMIT_STATUSES.notFound };
      const duplicate = await prisma.socraticDraftOperation.findUnique({
        where: { conversationId_operationId: { conversationId: input.conversationId, operationId: input.operationId } },
        select: { id: true },
      });
      if (duplicate) return { status: DRAFT_COMMIT_STATUSES.duplicate, workspace: current };
      if (
        (current.draft?.currentRevision ?? null) !== input.expectedDraftRevision ||
        (current.activeProposal?.currentProposalRevision ?? null) !== input.expectedProposalRevision
      ) return { status: DRAFT_COMMIT_STATUSES.conflict, workspace: current };

      let committed: boolean;
      try {
        committed = await prisma.$transaction(async (transaction) => {
        await transaction.socraticDraftOperation.create({ data: { conversationId: input.conversationId, operationId: input.operationId, kind: input.operationKind } });
        const next = input.nextWorkspace;
        if (!current.draft && next.draft) {
          await transaction.socraticDraftDraft.create({ data: {
            id: next.draft.id, conversationId: input.conversationId, body: next.draft.body,
            currentRevision: next.draft.currentRevision, createdAt: new Date(next.draft.createdAt), updatedAt: new Date(next.draft.updatedAt),
          } });
        } else if (current.draft && next.draft) {
          const updated = await transaction.socraticDraftDraft.updateMany({
            where: { id: current.draft.id, conversation: { userId }, currentRevision: input.expectedDraftRevision ?? undefined },
            data: { body: next.draft.body, currentRevision: next.draft.currentRevision, updatedAt: new Date(next.draft.updatedAt) },
          });
          if (updated.count !== 1) throw new DraftCommitConflictError();
        }

        for (const revision of next.revisions.slice(current.revisions.length)) {
          await transaction.socraticDraftDraftRevision.create({ data: {
            draftId: next.draft!.id, revision: revision.revision, body: revision.body, source: revision.source,
            proposalId: revision.proposalId, restoredFromRevision: revision.restoredFromRevision, createdAt: new Date(revision.createdAt),
          } });
        }

        const currentProposal = current.activeProposal;
        const nextProposal = next.activeProposal;
        if (
          nextProposal &&
          (!currentProposal || currentProposal.id !== nextProposal.id)
        ) {
          await transaction.socraticDraftRevisionProposal.create({ data: {
            id: nextProposal.id, draftId: nextProposal.draftId, baseDraftRevision: nextProposal.baseDraftRevision,
            scope: nextProposal.scope, originalStart: nextProposal.originalStart, originalEnd: nextProposal.originalEnd,
            originalContent: nextProposal.originalContent, userInstruction: nextProposal.userInstruction,
            state: nextProposal.state, currentProposalRevision: nextProposal.currentProposalRevision,
            createdAt: new Date(nextProposal.createdAt), resolvedAt: nextProposal.resolvedAt ? new Date(nextProposal.resolvedAt) : null,
            versions: { create: nextProposal.versions.map((version) => ({ revision: version.revision, proposedContent: version.proposedContent, intendedEffect: version.intendedEffect, createdAt: new Date(version.createdAt) })) },
          } });
        } else if (currentProposal && nextProposal) {
          const proposalUpdated = await transaction.socraticDraftRevisionProposal.updateMany({
            where: {
              id: currentProposal.id,
              currentProposalRevision: input.expectedProposalRevision ?? undefined,
            },
            data: { state: nextProposal.state, currentProposalRevision: nextProposal.currentProposalRevision, resolvedAt: nextProposal.resolvedAt ? new Date(nextProposal.resolvedAt) : null },
          });
          if (proposalUpdated.count !== 1) throw new DraftCommitConflictError();
          for (const version of nextProposal.versions.slice(currentProposal.versions.length)) {
            await transaction.socraticDraftRevisionProposalVersion.create({ data: { proposalId: nextProposal.id, revision: version.revision, proposedContent: version.proposedContent, intendedEffect: version.intendedEffect, createdAt: new Date(version.createdAt) } });
          }
        }

        return true;
        });
      } catch (error) {
        const latest = await load(input.conversationId);
        if (!latest) return { status: DRAFT_COMMIT_STATUSES.notFound };
        if (isUniqueConstraintError(error)) {
          const completed = await prisma.socraticDraftOperation.findUnique({
            where: { conversationId_operationId: { conversationId: input.conversationId, operationId: input.operationId } },
            select: { id: true },
          });
          if (completed) {
            return { status: DRAFT_COMMIT_STATUSES.duplicate, workspace: latest };
          }
        }
        if (error instanceof DraftCommitConflictError || isUniqueConstraintError(error)) {
          return { status: DRAFT_COMMIT_STATUSES.conflict, workspace: latest };
        }
        throw error;
      }
      if (!committed) {
        const latest = await load(input.conversationId);
        return latest ? { status: DRAFT_COMMIT_STATUSES.conflict, workspace: latest } : { status: DRAFT_COMMIT_STATUSES.notFound };
      }
      const workspace = await load(input.conversationId);
      return workspace ? { status: DRAFT_COMMIT_STATUSES.committed, workspace } : { status: DRAFT_COMMIT_STATUSES.notFound };
    },

    async delete(conversationId) {
      await prisma.socraticDraftDraft.deleteMany({ where: { conversationId, conversation: { userId } } });
    },
  };
}

class DraftCommitConflictError extends Error {}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}
