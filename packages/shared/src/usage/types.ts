import type { ProductId } from "../products";
import type { AccessLevel } from "../users";

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
