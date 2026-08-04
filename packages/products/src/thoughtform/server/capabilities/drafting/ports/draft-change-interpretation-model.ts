import type {
  ConversationMessage,
  DraftChange,
  DraftChangeInterpretationType,
  IdeaMap,
  PotentialConflict,
} from "packages/products/src/thoughtform/shared";

export interface DraftChangeInterpretationModelInput {
  change: DraftChange;
  currentIdeaMap: IdeaMap;
  previousMessages: ConversationMessage[];
}

export interface DraftChangeInterpretationModelResult {
  type: DraftChangeInterpretationType;
  assistantMessage: string;
  potentialConflicts: Omit<PotentialConflict, "id" | "draftChange">[];
}

export interface DraftChangeInterpretationModel {
  interpret(
    input: DraftChangeInterpretationModelInput,
  ): Promise<DraftChangeInterpretationModelResult>;
}
