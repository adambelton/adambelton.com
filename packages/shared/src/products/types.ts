export type ProductId = "socratic-draft";

export type ProductStatus = "prototype" | "active" | "archived";

export type ProductDefinition = {
  id: ProductId;
  name: string;
  slug: string;
  summary: string;
  description: string;
  status: ProductStatus;
  publicPath: string;
  demoPath?: string;
  requiresAuth: boolean;
};
