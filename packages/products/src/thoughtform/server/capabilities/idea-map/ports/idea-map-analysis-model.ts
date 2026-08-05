import type { ConversationMessage } from "packages/products/src/thoughtform/shared";

export interface IdeaMapAnalysisModelRequest {
  maxOutputTokens: number;
  messages: ConversationMessage[];
  outputFormat: {
    name: string;
    schema: Record<string, unknown>;
  };
  system: string;
  context: string;
}

export interface IdeaMapAnalysisModel {
  createAnalysis(request: IdeaMapAnalysisModelRequest): Promise<{ content: string }>;
}
