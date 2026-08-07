export type ThoughtFormPromptDefinition = Readonly<{
  name: string;
  fallback: string;
}>;

export type ThoughtFormPromptReference = Readonly<{
  name: string;
  version: number;
  isFallback: boolean;
}>;

export type ResolvedThoughtFormPrompt = Readonly<{
  content: string;
  reference: ThoughtFormPromptReference;
}>;

export interface ThoughtFormPromptProvider {
  getPrompt(
    definition: ThoughtFormPromptDefinition,
  ): Promise<ResolvedThoughtFormPrompt>;
}

export const fallbackThoughtFormPromptProvider: ThoughtFormPromptProvider = {
  async getPrompt(definition) {
    return {
      content: definition.fallback,
      reference: {
        name: definition.name,
        version: 0,
        isFallback: true,
      },
    };
  },
};
