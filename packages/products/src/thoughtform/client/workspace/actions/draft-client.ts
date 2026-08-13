import type { ApiResponse } from "packages/shared/src";
import type {
  DraftSelection,
  DraftOperationResponse,
  DraftOperationInterpretation,
  DraftingState,
  RevisionProposalScope,
  HostedUsageAllowance,
} from "packages/products/src/thoughtform/shared";
import {
  WORKSPACE_PERSISTENCE_TYPES,
  type WorkspacePersistenceType,
} from "packages/products/src/thoughtform/shared";

export class DraftClientError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly allowance?: HostedUsageAllowance,
  ) {
    super(allowance
      ? [
          message,
          `${allowance.remainingOperations} hosted operations remain.`,
          `It resets at ${new Date(allowance.resetsAt).toLocaleString()}.`,
        ].join(" ")
      : message);
    this.name = "DraftClientError";
  }
}

export function loadDraft(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
) {
  return request(persistenceType, conversationId, "", { method: "GET" });
}

export function composeDraft(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  input: { selectedIdeaIds: string[]; instruction: string },
) {
  return request(persistenceType, conversationId, "/compose", mutation("POST", input));
}

export function saveDraft(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  input: { expectedRevision: number; body: string },
) {
  return request<DraftOperationResponse>(persistenceType, conversationId, "", mutation("PUT", input));
}

export function restoreDraft(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  input: { expectedRevision: number; restoreRevision: number },
) {
  return request<DraftOperationResponse>(persistenceType, conversationId, "/restore", mutation("POST", input));
}

export function interpretDraftChange(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  change: import("packages/products/src/thoughtform/shared").DraftChange,
) {
  return request<DraftOperationInterpretation>(
    persistenceType,
    conversationId,
    "/interpret-change",
    mutation("POST", { change }),
  );
}

export function proposeDraftRevision(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  input: {
    expectedDraftRevision: number;
    scope: RevisionProposalScope;
    selection?: DraftSelection;
    userInstruction: string;
  },
) {
  return request(persistenceType, conversationId, "/proposals", mutation("POST", input));
}

export function amendDraftProposal(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  proposalId: string,
  input: { expectedProposalRevision: number; userInstruction: string },
) {
  return request(
    persistenceType,
    conversationId,
    `/proposals/${proposalId}`,
    mutation("PATCH", input),
  );
}

export function resolveDraftProposal(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  proposalId: string,
  action: "accept" | "reject",
  expectedDraftRevision?: number,
) {
  return request(
    persistenceType,
    conversationId,
    `/proposals/${proposalId}/${action}`,
    mutation("POST", { expectedDraftRevision }),
  );
}

function mutation(method: string, body: object): RequestInit {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": globalThis.crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  };
}

async function request<T = DraftingState | null>(
  persistenceType: WorkspacePersistenceType,
  conversationId: string,
  suffix: string,
  init: RequestInit,
) {
  const collection = persistenceType === WORKSPACE_PERSISTENCE_TYPES.temporary
    ? "temporary-drafts"
    : "drafts";
  const response = await fetch(
    `/api/products/thoughtform/${collection}/${encodeURIComponent(conversationId)}${suffix}`,
    init,
  );
  const payload = await response.json() as ApiResponse<T> & {
    allowance?: HostedUsageAllowance;
  };
  if (!response.ok || !payload.ok) {
    throw new DraftClientError(
      payload.ok ? "draft_unavailable" : payload.error.code,
      payload.ok
        ? "The drafting state could not be updated."
        : payload.error.message,
      payload.allowance,
    );
  }
  return payload.data;
}
