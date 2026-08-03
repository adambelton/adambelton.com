import { deriveDraftChange } from "packages/products/src/socratic-draft/server/capabilities/drafting";
import type { DraftStore } from "packages/products/src/socratic-draft/server/capabilities/drafting";
import type { DraftChange } from "packages/products/src/socratic-draft/shared";

export async function validateDraftChange(input: {
  conversationId: string;
  drafts: DraftStore | null;
  change?: DraftChange;
}) {
  if (!input.change) return true;
  const workspace = await input.drafts?.getDraftWorkspace(input.conversationId);
  if (
    !workspace?.draft ||
    workspace.draft.currentRevision !== input.change.toRevision
  ) return false;
  const previous = workspace.revisions.find(
    (revision) => revision.revision === input.change!.fromRevision,
  );
  const committed = workspace.revisions.find(
    (revision) => revision.revision === input.change!.toRevision,
  );
  if (!previous || !committed) return false;
  const canonical = deriveDraftChange(previous, committed);
  return canonical !== null &&
    JSON.stringify(canonical) === JSON.stringify(input.change);
}
