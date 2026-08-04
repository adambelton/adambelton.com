import {
  DRAFT_CHANGE_SCOPES,
  type DraftChange,
  type DraftRevision,
} from "packages/products/src/thoughtform/shared";

export const MAX_DRAFT_CHANGE_CONTEXT_CHARACTERS = 16_000;
const MAX_DRAFT_CHANGE_PASSAGE_CHARACTERS = 8_000;

export function deriveDraftChange(
  previous: DraftRevision,
  committed: DraftRevision,
): DraftChange | null {
  if (
    committed.revision !== previous.revision + 1 ||
    committed.body === previous.body
  ) return null;

  let start = 0;
  while (
    start < previous.body.length &&
    start < committed.body.length &&
    previous.body[start] === committed.body[start]
  ) start += 1;

  let previousEnd = previous.body.length;
  let committedEnd = committed.body.length;
  while (
    previousEnd > start &&
    committedEnd > start &&
    previous.body[previousEnd - 1] === committed.body[committedEnd - 1]
  ) {
    previousEnd -= 1;
    committedEnd -= 1;
  }

  while (
    start > 0 &&
    !/\s/.test(previous.body[start - 1] ?? "") &&
    !/\s/.test(committed.body[start - 1] ?? "")
  ) start -= 1;
  while (
    previousEnd < previous.body.length &&
    !/\s/.test(previous.body[previousEnd] ?? "")
  ) previousEnd += 1;
  while (
    committedEnd < committed.body.length &&
    !/\s/.test(committed.body[committedEnd] ?? "")
  ) committedEnd += 1;

  const removedText = previous.body.slice(start, previousEnd);
  const addedText = committed.body.slice(start, committedEnd);
  if (removedText.length + addedText.length <= MAX_DRAFT_CHANGE_PASSAGE_CHARACTERS) {
    return {
      fromRevision: previous.revision,
      toRevision: committed.revision,
      scope: DRAFT_CHANGE_SCOPES.passage,
      start,
      end: previousEnd,
      removedText,
      addedText,
    };
  }

  if (
    previous.body.length + committed.body.length >
    MAX_DRAFT_CHANGE_CONTEXT_CHARACTERS
  ) return null;

  return {
    fromRevision: previous.revision,
    toRevision: committed.revision,
    scope: DRAFT_CHANGE_SCOPES.wholeDraft,
    start: 0,
    end: previous.body.length,
    removedText: previous.body,
    addedText: committed.body,
  };
}
