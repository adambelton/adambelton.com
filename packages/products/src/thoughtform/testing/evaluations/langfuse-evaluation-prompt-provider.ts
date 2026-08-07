import { LangfuseClient } from "@langfuse/client";
import type {
  ThoughtFormPromptDefinition,
  ThoughtFormPromptProvider,
} from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

export function createLangfuseEvaluationPromptProvider(): ThoughtFormPromptProvider {
  const client = new LangfuseClient();
  return {
    async getPrompt(definition: ThoughtFormPromptDefinition) {
      const prompt = await client.prompt.get(definition.name, {
        label: "development",
        cacheTtlSeconds: 0,
        fallback: definition.fallback,
        type: "text",
      });
      return {
        content: prompt.compile(),
        reference: {
          name: prompt.name,
          version: prompt.version,
          isFallback: prompt.isFallback,
        },
      };
    },
  };
}
