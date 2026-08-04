export const AI_PROVIDER_IDS = {
  anthropic: "anthropic",
  openAi: "openai",
} as const;

export type AiProviderId =
  (typeof AI_PROVIDER_IDS)[keyof typeof AI_PROVIDER_IDS];

const disclosures = {
  anthropic: {
    id: AI_PROVIDER_IDS.anthropic,
    name: "Anthropic",
    service: "Claude API",
    retentionSummary: "Anthropic's standard commercial API terms may retain inputs and outputs for up to 30 days, subject to documented exceptions.",
    trainingSummary: "Anthropic says commercial API inputs and outputs are not used for model training unless the customer agrees otherwise.",
    policyUrl: "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention",
  },
  openai: {
    id: AI_PROVIDER_IDS.openAi,
    name: "OpenAI",
    service: "Responses API",
    retentionSummary: "OpenAI's API data controls and retention depend on the configured endpoint, features, and organisation controls.",
    trainingSummary: "OpenAI says API data is not used to train its models by default.",
    policyUrl: "https://platform.openai.com/docs/guides/your-data",
  },
} satisfies Record<AiProviderId, {
  id: string;
  name: string;
  service: string;
  retentionSummary: string;
  trainingSummary: string;
  policyUrl: string;
}>;

export function getAiProviderDisclosure(provider: string) {
  return provider === AI_PROVIDER_IDS.anthropic || provider === AI_PROVIDER_IDS.openAi
    ? disclosures[provider]
    : null;
}

export function listAiProviderDisclosures() {
  return Object.values(disclosures);
}
