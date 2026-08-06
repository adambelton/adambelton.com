import {
  PRODUCT_IDS,
  PRODUCT_STATUSES,
  type ProductDefinition,
} from "packages/shared/src/products/types";

export const products = [
  {
    id: PRODUCT_IDS.thoughtForm,
    name: "ThoughtForm",
    slug: "thoughtform",
    summary:
      "A conversational thinking workspace where an AI assistant helps you explore, organise and articulate what you think or feel. Through focused questions, examples, clarification, challenge and alternative perspectives, it helps you develop an evolving idea map you can inspect and correct. It then brings that understanding together into a coherent expression, in your own words. It is useful when something is bothering you, but you cannot put your finger on why.",
    description:
      "Start with a rough thought. The assistant asks questions, challenges assumptions, tracks threads, and helps turn the conversation into a private entry.",
    status: PRODUCT_STATUSES.prototype,
    publicPath: "/products/thoughtform",
    demoPath: "/products/thoughtform/editor",
    privacyPath: "/products/thoughtform/privacy",
    requiresAuth: false,
  },
] satisfies ProductDefinition[];

export function getProductById(id: ProductDefinition["id"]) {
  return products.find((product) => product.id === id);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
