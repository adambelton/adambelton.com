export const PRODUCT_OVERVIEW_SECTIONS = {
  completed: "completed",
  current: "current",
} as const;

export type ProductOverviewSection =
  (typeof PRODUCT_OVERVIEW_SECTIONS)[keyof typeof PRODUCT_OVERVIEW_SECTIONS];

export type ProductOverviewDefinition = {
  catalogueSection: ProductOverviewSection;
  description: string;
  id: string;
  name: string;
  publicPath: `/${string}`;
  slug: string;
  statusLabel: string;
  summary: string;
};

export const productOverviewCatalogue = [
  {
    catalogueSection: PRODUCT_OVERVIEW_SECTIONS.current,
    description:
      "A learning project using a bounded coordination concept to develop healthcare-domain, clinical-safety, information-handover and assurance reasoning.",
    id: "care-calendar",
    name: "Care Calendar",
    publicPath: "/products/care-calendar",
    slug: "care-calendar",
    statusLabel: "In definition",
    summary:
      "A healthcare and social-care product-learning project exploring how patients and authorised carers could coordinate appointment information across services without creating a competing source of truth.",
  },
  {
    catalogueSection: PRODUCT_OVERVIEW_SECTIONS.current,
    description:
      "Start with a rough thought. The assistant asks questions, challenges assumptions, tracks threads, and helps turn the conversation into a private entry.",
    id: "thoughtform",
    name: "ThoughtForm",
    publicPath: "/products/thoughtform",
    slug: "thoughtform",
    statusLabel: "Demo available",
    summary:
      "A conversational workspace for exploring ideas that are difficult to put into words. Develop an inspectable Idea Map, then compose a Draft when expressing the current shape would be useful.",
  },
  {
    catalogueSection: PRODUCT_OVERVIEW_SECTIONS.completed,
    description:
      "A completed concept prototype for consuming blacked-out Saturday football as a shared live literary experience, driven by quality writing and enabled by AI.",
    id: "the-blackout",
    name: "The Blackout",
    publicPath: "/products/the-blackout",
    slug: "the-blackout",
    statusLabel: "Concept prototype complete",
    summary:
      "A new way to consume live football through quality football writing, with AI turning the writer's perspective into synchronized prose, narration and illustration.",
  },
] satisfies ProductOverviewDefinition[];

export function getProductOverviewBySlug(slug: string) {
  return productOverviewCatalogue.find((product) => product.slug === slug);
}
