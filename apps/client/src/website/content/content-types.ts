declare const sanitizedHtml: unique symbol;

export type SanitizedHtml = string & { readonly [sanitizedHtml]: true };

export type CompiledContentPage = {
  bodyHtml: SanitizedHtml;
  description: string;
  source: string;
  title: string;
};

export type CompiledWritingPost = CompiledContentPage & {
  coverImage: string;
  coverImageAlt: string;
  coverImageSmall: string;
  createdAt: string;
  externalTags: string[];
  internalTags: string[];
  legacySlugs: string[];
  shortTitle: string;
  slug: string;
  tags: string[];
};

export type CapabilityClassificationKey =
  | "evidence_basis"
  | "development_trajectory"
  | "leverage_profile";

export type CapabilityProfileViewKey =
  | "overview"
  | "evidence-basis"
  | "development-trajectory"
  | "leverage-profile";

export type CapabilityClassificationValue = {
  key: string;
  label: string;
  explanationHtml: SanitizedHtml;
  order: number;
};

export type CapabilityClassification = {
  key: CapabilityClassificationKey;
  label: string;
  introductionHtml: SanitizedHtml;
  values: CapabilityClassificationValue[];
};

export type CapabilityClassificationGuide = {
  eyebrow: string;
  title: string;
};

export type CompiledCapability = {
  key: string;
  name: string;
  evidenceBasis: string;
  developmentTrajectory: string;
  leverageProfile: string;
  order: number;
  descriptionHtml: SanitizedHtml;
  experienceEvidenceHtml: SanitizedHtml;
  currentFocusHtml: SanitizedHtml;
  leverageProfileHtml: SanitizedHtml;
};

export type CapabilityProfileSection = {
  key: string;
  label: string;
  capabilities: CompiledCapability[];
};

export type CapabilityProfileView = {
  key: CapabilityProfileViewKey;
  label: string;
  introductionHtml: SanitizedHtml;
};

export type CompiledCapabilityProfile = {
  source: string;
  eyebrow: string;
  title: string;
  classificationGuide: CapabilityClassificationGuide;
  views: CapabilityProfileView[];
  classifications: Record<CapabilityClassificationKey, CapabilityClassification>;
  sections: CapabilityProfileSection[];
};
