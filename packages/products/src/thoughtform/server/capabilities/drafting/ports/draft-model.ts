import type {
  Idea,
  RevisionProposalScope,
} from "packages/products/src/thoughtform/shared";

export interface DraftCompositionModelInput {
  selectedIdeas: DraftCompositionIdeaMaterial[];
  relevantConversationLanguage: string[];
  instruction: string;
}

export type DraftCompositionIdeaMaterial = Pick<
  Idea,
  "id" | "title" | "synthesis" | "substance"
>;

export function createDraftCompositionIdeaMaterial(
  ideas: Idea[],
): DraftCompositionIdeaMaterial[] {
  return ideas.map(({ id, title, synthesis, substance }) => ({
    id,
    title,
    synthesis,
    substance,
  }));
}

export interface DraftCompositionModel {
  compose(input: DraftCompositionModelInput): Promise<{ body: string }>;
}

export interface RevisionProposalModelInput {
  draftBody: string;
  scope: RevisionProposalScope;
  originalContent: string;
  userInstruction: string;
}

export interface RevisionProposalModel {
  propose(input: RevisionProposalModelInput): Promise<{
    proposedContent: string;
    intendedEffect: string;
  }>;
}
