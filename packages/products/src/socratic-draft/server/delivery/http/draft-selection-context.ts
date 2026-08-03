import type { DraftStore } from "packages/products/src/socratic-draft/server/capabilities/drafting";
import type { DraftSelection } from "packages/products/src/socratic-draft/shared";

export async function validateDraftSelection(input: {
  conversationId: string;
  drafts: DraftStore | null;
  selection?: DraftSelection;
}) {
  if (!input.selection) return true;
  const draft = (await input.drafts?.getDraftWorkspace(input.conversationId))?.draft;
  if (!draft || draft.currentRevision !== input.selection.baseDraftRevision) {
    return false;
  }
  return input.selection.start >= 0 &&
    input.selection.end > input.selection.start &&
    input.selection.end <= draft.body.length &&
    draft.body.slice(input.selection.start, input.selection.end) ===
      input.selection.selectedText;
}
