import type { ApiResponse } from "packages/shared/src";
import type {
  DraftSelection,
  DraftOperationResponse,
  DraftOperationInterpretation,
  DraftingState,
  RevisionProposalScope,
} from "packages/products/src/thoughtform/shared";

export type DraftPersistenceKind = "persistent" | "temporary";

export class DraftClientError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
  }
}

export function loadDraft(
  kind: DraftPersistenceKind,
  conversationId: string,
) {
  return request(kind, conversationId, "", { method: "GET" });
}

export function composeDraft(
  kind: DraftPersistenceKind,
  conversationId: string,
  input: { selectedIdeaIds: string[]; instruction: string },
) {
  return request(kind, conversationId, "/compose", mutation("POST", input));
}

export function saveDraft(
  kind: DraftPersistenceKind,
  conversationId: string,
  input: { expectedRevision: number; body: string },
) {
  return request<DraftOperationResponse>(kind, conversationId, "", mutation("PUT", input));
}

export function restoreDraft(
  kind: DraftPersistenceKind,
  conversationId: string,
  input: { expectedRevision: number; restoreRevision: number },
) {
  return request<DraftOperationResponse>(kind, conversationId, "/restore", mutation("POST", input));
}

export function interpretDraftChange(
  kind: DraftPersistenceKind,
  conversationId: string,
  change: import("packages/products/src/thoughtform/shared").DraftChange,
) {
  return request<DraftOperationInterpretation>(
    kind,
    conversationId,
    "/interpret-change",
    mutation("POST", { change }),
  );
}

export function proposeDraftRevision(
  kind: DraftPersistenceKind,
  conversationId: string,
  input: {
    expectedDraftRevision: number;
    scope: RevisionProposalScope;
    selection?: DraftSelection;
    userInstruction: string;
  },
) {
  return request(kind, conversationId, "/proposals", mutation("POST", input));
}

export function amendDraftProposal(
  kind: DraftPersistenceKind,
  conversationId: string,
  proposalId: string,
  input: { expectedProposalRevision: number; userInstruction: string },
) {
  return request(
    kind,
    conversationId,
    `/proposals/${proposalId}`,
    mutation("PATCH", input),
  );
}

export function resolveDraftProposal(
  kind: DraftPersistenceKind,
  conversationId: string,
  proposalId: string,
  action: "accept" | "reject",
  expectedDraftRevision?: number,
) {
  return request(
    kind,
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
  kind: DraftPersistenceKind,
  conversationId: string,
  suffix: string,
  init: RequestInit,
) {
  const collection = kind === "temporary" ? "temporary-drafts" : "drafts";
  const response = await fetch(
    `/api/products/thoughtform/${collection}/${encodeURIComponent(conversationId)}${suffix}`,
    init,
  );
  const payload = await response.json() as ApiResponse<T>;
  if (!response.ok || !payload.ok) {
    throw new DraftClientError(
      payload.ok ? "draft_unavailable" : payload.error.code,
      payload.ok
        ? "The drafting state could not be updated."
        : payload.error.message,
    );
  }
  return payload.data;
}
