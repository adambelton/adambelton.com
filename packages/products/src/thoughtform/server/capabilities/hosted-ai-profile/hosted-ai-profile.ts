export const THOUGHTFORM_AI_PROFILES = {
  anthropic: "anthropic",
  openAi: "openai",
} as const;

export type ThoughtFormAiProfile =
  (typeof THOUGHTFORM_AI_PROFILES)[keyof typeof THOUGHTFORM_AI_PROFILES];

const supportedModels: Record<ThoughtFormAiProfile, readonly string[]> = {
  anthropic: ["claude-sonnet-5"],
  openai: ["gpt-5.6-terra"],
};

export function isSupportedThoughtFormAiProfile(
  provider: string,
  model: string,
): provider is ThoughtFormAiProfile {
  return (provider === THOUGHTFORM_AI_PROFILES.anthropic ||
    provider === THOUGHTFORM_AI_PROFILES.openAi) &&
    supportedModels[provider].includes(model);
}

export function projectThoughtFormOutputSchema(
  profile: ThoughtFormAiProfile,
  schema: Record<string, unknown>,
): Record<string, unknown> {
  return profile === THOUGHTFORM_AI_PROFILES.anthropic
    ? projectAnthropicSchemaValue(schema) as Record<string, unknown>
    : schema;
}

function projectAnthropicSchemaValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(projectAnthropicSchemaValue);
  if (!value || typeof value !== "object") return value;
  const schema = value as Record<string, unknown>;
  if (Array.isArray(schema.type)) {
    const enumValues = Array.isArray(schema.enum) ? schema.enum : null;
    const remaining = Object.fromEntries(
      Object.entries(schema).filter(([key]) => key !== "type" && key !== "enum"),
    );
    return {
      ...(projectAnthropicSchemaValue(remaining) as Record<string, unknown>),
      anyOf: schema.type.map((type) => ({
        type,
        ...(enumValues ? { enum: enumValues.filter((entry) => matchesType(entry, type)) } : {}),
      })),
    };
  }
  return Object.fromEntries(
    Object.entries(schema)
      .filter(([key]) => key !== "maxItems")
      .map(([key, child]) => [
        key,
        key === "minItems" && typeof child === "number" && child > 1
          ? 1
          : projectAnthropicSchemaValue(child),
      ]),
  );
}

function matchesType(value: unknown, type: unknown) {
  if (type === "null") return value === null;
  return typeof value === type;
}
