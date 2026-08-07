import { LangfuseClient } from "@langfuse/client";
import type {
  ThoughtFormPromptDefinition,
  ThoughtFormPromptProvider,
} from "packages/products/src/thoughtform/server/ports/thoughtform-prompt-provider";

export type LangfusePromptProviderConfiguration = {
  publicKey?: string;
  secretKey?: string;
  baseUrl?: string;
  label: string;
  cacheTtlSeconds: number;
};

export function createLangfuseThoughtFormPromptProvider(
  configuration: LangfusePromptProviderConfiguration,
): ThoughtFormPromptProvider | null {
  if (
    !configuration.publicKey?.trim() ||
    !configuration.secretKey?.trim() ||
    !configuration.baseUrl?.trim()
  ) {
    return null;
  }
  try {
    return new LangfuseThoughtFormPromptProvider(
      new LangfuseClient({
        publicKey: configuration.publicKey,
        secretKey: configuration.secretKey,
        baseUrl: configuration.baseUrl,
      }),
      configuration,
    );
  } catch {
    return null;
  }
}

class LangfuseThoughtFormPromptProvider implements ThoughtFormPromptProvider {
  constructor(
    private readonly client: LangfuseClient,
    private readonly configuration: LangfusePromptProviderConfiguration,
  ) {}

  async getPrompt(definition: ThoughtFormPromptDefinition) {
    const prompt = await this.client.prompt.get(definition.name, {
      label: this.configuration.label,
      cacheTtlSeconds: this.configuration.cacheTtlSeconds,
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
  }
}
