import type { ProductId } from "packages/shared/src/products";
import type { AccessLevel } from "packages/shared/src/users";

export interface UsageEvent {
  id: string;
  userId: string;
  productId: ProductId;
  accessLevel: AccessLevel;
  action: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  createdAt: string;
}

export interface HostedOperationOutcomeTotals {
  succeeded: number;
  providerFailed: number;
  persistenceFailed: number;
  interrupted: number;
  inProgress: number;
}

export interface HostedOperationModelTotal {
  model: string | null;
  operations: number;
  tokens: number;
}

export interface HostedOperationWindow {
  operations: number;
  tokens: number;
  outcomes: HostedOperationOutcomeTotals;
}

export interface HostedPersonalAllowanceWindow extends HostedOperationWindow {
  operationLimit: number;
  operationsRemaining: number | null;
  tokenLimit: number;
  tokensRemaining: number | null;
  resetsAt: string;
  isExempt: boolean;
}

export interface ThoughtFormOperationsAccount {
  email: string;
  latestOperationAt: string | null;
  current: HostedPersonalAllowanceWindow;
  retained: HostedOperationWindow;
  retainedModels: HostedOperationModelTotal[];
}

export interface HostedGlobalAllowanceWindow extends HostedOperationWindow {
  resetsAt: string;
}

export interface ThoughtFormOperationsOverview {
  generatedAt: string;
  currentGlobal: HostedGlobalAllowanceWindow;
  accounts: ThoughtFormOperationsAccount[];
  nextCursor: string | null;
}
