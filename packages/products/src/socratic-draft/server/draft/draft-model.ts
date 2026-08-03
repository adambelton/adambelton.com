import type {
  Idea,
  RevisionProposalScope,
} from "packages/products/src/socratic-draft/shared";

export interface DraftCompositionModelInput {
  selectedIdeas: DraftCompositionIdeaMaterial[];
  relevantConversationLanguage: string[];
  instruction: string;
}

export type DraftCompositionIdeaMaterial = Pick<
  Idea,
  "id" | "title" | "synthesis" | "substance" | "unresolvedQuestions"
>;

export function createDraftCompositionIdeaMaterial(
  ideas: Idea[],
): DraftCompositionIdeaMaterial[] {
  return ideas.map(({ id, title, synthesis, substance, unresolvedQuestions }) => ({
    id,
    title,
    synthesis,
    substance,
    unresolvedQuestions,
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
