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
      "A conversational workspace for exploring ideas that are difficult to put into words. Develop an inspectable Idea Map, then compose a Draft when expressing the current shape would be useful.",
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
