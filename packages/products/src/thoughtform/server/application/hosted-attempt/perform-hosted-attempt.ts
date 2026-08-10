import {
  HOSTED_ATTEMPT_OUTCOMES,
  type HostedAttemptAction,
  type HostedAttemptLifecycle,
  type HostedAttemptOutcome,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { HostedAiUnavailableError } from "packages/products/src/thoughtform/server/capabilities/conversation";

export async function performHostedAttempt<T>(input: {
  action: HostedAttemptAction;
  operationId: string;
  lifecycle: HostedAttemptLifecycle;
  operation: () => Promise<T>;
  outcome?: (result: T) => HostedAttemptOutcome;
}): Promise<T> {
  const attempt = await input.lifecycle.admit({
    action: input.action,
    operationId: input.operationId,
  });
  try {
    const result = await attempt.run(input.operation);
    await attempt.complete(
      input.outcome?.(result) ?? HOSTED_ATTEMPT_OUTCOMES.succeeded,
    );
    return result;
  } catch (error) {
    await attempt.complete(
      error instanceof HostedAiUnavailableError
        ? HOSTED_ATTEMPT_OUTCOMES.providerFailed
        : HOSTED_ATTEMPT_OUTCOMES.persistenceFailed,
    );
    throw error;
  }
}
