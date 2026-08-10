import { AsyncLocalStorage } from "node:async_hooks";
import type { LlmResponse } from "packages/ai/src";
import type { HostedAttemptUsage } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

type UsageTotal = {
  model: string | null;
  callCount: number;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  cacheReadTokens: number | null;
  cacheWriteTokens: number | null;
};

const hostedAttemptContext = new AsyncLocalStorage<UsageTotal>();

export function createHostedAttemptUsageContext() {
  const usage = emptyUsage();
  return {
    run<T>(operation: () => Promise<T>) {
      return hostedAttemptContext.run(usage, operation);
    },
    runStream<T>(operation: () => AsyncIterable<T>): AsyncIterable<T> {
      return {
        [Symbol.asyncIterator]() {
          const iterator = operation()[Symbol.asyncIterator]();
          return {
            next: () => hostedAttemptContext.run(usage, () => iterator.next()),
            return: (value?: unknown) => hostedAttemptContext.run(
              usage,
              () => iterator.return
                ? iterator.return(value as never)
                : Promise.resolve({ done: true as const, value: value as never }),
            ),
            throw: (error?: unknown) => hostedAttemptContext.run(
              usage,
              () => iterator.throw ? iterator.throw(error) : Promise.reject(error),
            ),
          };
        },
      };
    },
    usage: (): HostedAttemptUsage => ({
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      reasoningTokens: usage.reasoningTokens,
      cacheReadTokens: usage.cacheReadTokens,
      cacheWriteTokens: usage.cacheWriteTokens,
    }),
  };
}

export function recordHostedAttemptUsage(response: LlmResponse) {
  const usage = hostedAttemptContext.getStore();
  if (!usage) return;
  usage.model = usage.model === null || usage.model === response.model
    ? response.model
    : null;
  usage.inputTokens = addKnown(usage.inputTokens, response.inputTokens, usage.callCount);
  usage.outputTokens = addKnown(usage.outputTokens, response.outputTokens, usage.callCount);
  usage.reasoningTokens = addKnown(usage.reasoningTokens, response.reasoningTokens, usage.callCount);
  usage.cacheReadTokens = addKnown(usage.cacheReadTokens, response.cacheReadTokens, usage.callCount);
  usage.cacheWriteTokens = addKnown(usage.cacheWriteTokens, response.cacheWriteTokens, usage.callCount);
  usage.callCount += 1;
}

function emptyUsage(): UsageTotal {
  return {
    model: null,
    callCount: 0,
    inputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    cacheReadTokens: null,
    cacheWriteTokens: null,
  };
}

function addKnown(current: number | null, next: number | undefined, callCount: number) {
  if (next === undefined || (callCount > 0 && current === null)) return null;
  return (current ?? 0) + next;
}
