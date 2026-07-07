import type { ProductId } from "../products/types";

export type WritingPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  publishedAt: string | null;
  sourceProductId: ProductId | null;
  createdAt: string;
  updatedAt: string;
};
