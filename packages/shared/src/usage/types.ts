import type { ProductId } from "packages/shared/src/products";
import type { AccessLevel } from "packages/shared/src/users";

export type UsageEvent = {
  id: string;
  userId: string;
  productId: ProductId;
  accessLevel: AccessLevel;
  action: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string;
};
