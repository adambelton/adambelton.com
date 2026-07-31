import {
  PRODUCT_IDS,
  PRODUCT_STATUSES,
  type ProductDefinition,
} from "packages/shared/src/products/types";

export const products = [
  {
    id: PRODUCT_IDS.socraticDraft,
    name: "The Socratic Draft",
    slug: "socratic-draft",
    summary:
      "A Socratic writing tool for working out what you think before writing it.",
    description:
      "Start with a rough thought. The assistant asks questions, challenges assumptions, tracks threads, and helps turn the conversation into a private entry.",
    status: PRODUCT_STATUSES.prototype,
    publicPath: "/products/socratic-draft",
    demoPath: "/products/socratic-draft/editor",
    requiresAuth: true,
  }
] satisfies ProductDefinition[];

export function getProductById(
  id: ProductDefinition["id"]
): ProductDefinition | undefined {
  return products.find((product) => product.id === id);
}

export function getProductBySlug(slug: string): ProductDefinition | undefined {
  return products.find((product) => product.slug === slug);
}
