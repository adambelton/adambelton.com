import {
  DRAFT_CHANGE_INTERPRETATION_TYPES,
  type DraftChange,
  type DraftChangeInterpretationType,
} from "packages/products/src/thoughtform/shared";

const WORD_CHARACTER = /[\p{L}\p{N}]/u;

export function classifyObviousDraftMaintenance(
  change: DraftChange,
): DraftChangeInterpretationType | null {
  const removed = normalizeMaintenanceText(change.removedText);
  const added = normalizeMaintenanceText(change.addedText);

  if (removed === added) {
    return DRAFT_CHANGE_INTERPRETATION_TYPES.textualMaintenance;
  }

  if (
    stripNonWordCharacters(removed) === stripNonWordCharacters(added) ||
    isSentenceBoundaryCaseMaintenance(removed, added)
  ) {
    return DRAFT_CHANGE_INTERPRETATION_TYPES.textualMaintenance;
  }

  return null;
}

function normalizeMaintenanceText(value: string) {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

function stripNonWordCharacters(value: string) {
  return [...value].filter((character) => WORD_CHARACTER.test(character)).join("");
}

function wordCharacters(value: string) {
  return stripNonWordCharacters(value);
}

function isSentenceBoundaryCaseMaintenance(removed: string, added: string) {
  const first = wordCharacters(removed);
  const second = wordCharacters(added);
  return first.length > 1 && first.length === second.length &&
    first.slice(1) === second.slice(1) &&
    first[0]?.toLocaleLowerCase() === second[0]?.toLocaleLowerCase();
}
