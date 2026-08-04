import type { DraftStore } from "packages/products/src/socratic-draft/server/capabilities/drafting";
import { canonicalDraftMarkdown } from "packages/products/src/socratic-draft/server/capabilities/drafting/semantic-markdown";
import type { DraftSelection } from "packages/products/src/socratic-draft/shared";

export async function validateDraftSelection(input: {
  conversationId: string;
  drafts: DraftStore | null;
  selection?: DraftSelection;
}) {
  if (!input.selection) return true;
  const draft = (await input.drafts?.getDraftingState(input.conversationId))?.draft;
  if (!draft || draft.currentRevision !== input.selection.baseDraftRevision) {
    return false;
  }
  const body = canonicalDraftMarkdown(draft.body, draft.contentFormat);
  return input.selection.start >= 0 &&
    input.selection.end > input.selection.start &&
    input.selection.end <= body.length &&
    body.slice(input.selection.start, input.selection.end) ===
      input.selection.selectedText;
}
