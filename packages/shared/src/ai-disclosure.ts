export type AiProviderDisclosure = {
  id: string;
  name: string;
  service: string;
  retentionSummary: string;
  trainingSummary: string;
  policyUrl: string;
};

export type AiProcessingDisclosure = {
  activeProvider: AiProviderDisclosure | null;
  supportedProviders: AiProviderDisclosure[];
};
