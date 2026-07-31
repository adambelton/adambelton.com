export const PRODUCT_IDS = {
  socraticDraft: "socratic-draft",
} as const;

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS];

export const PRODUCT_STATUSES = {
  active: "active",
  archived: "archived",
  prototype: "prototype",
} as const;

export type ProductStatus =
  (typeof PRODUCT_STATUSES)[keyof typeof PRODUCT_STATUSES];

export interface ProductDefinition {
  id: ProductId;
  name: string;
  slug: string;
  summary: string;
  description: string;
  status: ProductStatus;
  publicPath: string;
  demoPath?: string;
  requiresAuth: boolean;
}
