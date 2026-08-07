import type { ConversationMessage } from "packages/products/src/thoughtform/shared";
import type { ThoughtFormPromptReference } from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

export interface IdeaMapAnalysisModelRequest {
  maxOutputTokens: number;
  messages: ConversationMessage[];
  outputFormat: {
    name: string;
    schema: Record<string, unknown>;
  };
  system: string;
  context: string;
  promptReference?: ThoughtFormPromptReference;
}

export interface IdeaMapAnalysisModel {
  createAnalysis(request: IdeaMapAnalysisModelRequest): Promise<{ content: string }>;
}
