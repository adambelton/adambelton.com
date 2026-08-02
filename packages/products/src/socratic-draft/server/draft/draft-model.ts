import type {
  Idea,
  RevisionProposalScope,
} from "packages/products/src/socratic-draft/shared";

export interface DraftCompositionModelInput {
  selectedIdeas: Idea[];
  relevantConversationLanguage: string[];
  instruction: string;
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
