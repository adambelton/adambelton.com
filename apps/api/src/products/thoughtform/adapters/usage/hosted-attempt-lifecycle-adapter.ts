import type {
  HostedAttemptLifecycle,
  HostedAttemptOutcome,
  HostedAttemptRecordStore,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { createHostedAttemptUsageContext } from "apps/api/src/products/thoughtform/adapters/usage/hosted-attempt-context";

const INTERRUPTED_AFTER_MS = 60 * 60 * 1_000;
const RETAIN_COMPLETED_FOR_MS = 90 * 24 * 60 * 60 * 1_000;

export class HostedAttemptLifecycleAdapter implements HostedAttemptLifecycle {
  constructor(
    private readonly records: HostedAttemptRecordStore,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async admit(input: Parameters<HostedAttemptLifecycle["admit"]>[0]) {
    const now = this.now();
    await Promise.all([
      this.records.interruptAdmittedBefore(
        new Date(now.getTime() - INTERRUPTED_AFTER_MS).toISOString(),
        now.toISOString(),
      ),
      this.records.deleteCompletedBefore(
        new Date(now.getTime() - RETAIN_COMPLETED_FOR_MS).toISOString(),
      ),
    ]);
    const record = await this.records.admit(input);
    const context = createHostedAttemptUsageContext();
    let isComplete = false;
    return {
      id: record.id,
      run: context.run,
      runStream: context.runStream,
      complete: async (outcome: HostedAttemptOutcome) => {
        if (isComplete) return;
        isComplete = true;
        await this.records.complete({
          attemptId: record.id,
          outcome,
          usage: context.usage(),
          completedAt: this.now().toISOString(),
        });
      },
      discard: async () => {
        if (isComplete) return;
        isComplete = true;
        await this.records.discard(record.id);
      },
    };
  }
}
