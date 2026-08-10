import type { DatabaseClient } from "packages/db/src/client/database-client";
import type {
  HostedAttemptAdmission,
  HostedAttemptRecordStore,
} from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";
import { HOSTED_ATTEMPT_OUTCOMES } from "packages/products/src/thoughtform/server/capabilities/hosted-attempt";

export class PrismaThoughtFormHostedAttemptRecordStore
  implements HostedAttemptRecordStore
{
  constructor(
    private readonly database: DatabaseClient,
    private readonly userId: string,
    private readonly createId: () => string = () => globalThis.crypto.randomUUID(),
  ) {}

  async admit(input: HostedAttemptAdmission) {
    const record = await this.database.thoughtFormHostedAttempt.upsert({
      where: {
        userId_action_operationId: {
          userId: this.userId,
          action: input.action,
          operationId: input.operationId,
        },
      },
      update: {},
      create: {
        id: this.createId(),
        userId: this.userId,
        action: input.action,
        operationId: input.operationId,
      },
      select: { id: true },
    });
    return record;
  }

  async complete(input: Parameters<HostedAttemptRecordStore["complete"]>[0]) {
    await this.database.thoughtFormHostedAttempt.updateMany({
      where: { id: input.attemptId, userId: this.userId, completedAt: null },
      data: {
        outcome: input.outcome,
        model: input.usage.model,
        inputTokens: input.usage.inputTokens,
        outputTokens: input.usage.outputTokens,
        reasoningTokens: input.usage.reasoningTokens,
        cacheReadTokens: input.usage.cacheReadTokens,
        cacheWriteTokens: input.usage.cacheWriteTokens,
        completedAt: new Date(input.completedAt),
      },
    });
  }

  async interruptAdmittedBefore(cutoff: string, completedAt: string) {
    const result = await this.database.thoughtFormHostedAttempt.updateMany({
      where: {
        userId: this.userId,
        completedAt: null,
        admittedAt: { lt: new Date(cutoff) },
      },
      data: {
        outcome: HOSTED_ATTEMPT_OUTCOMES.interrupted,
        completedAt: new Date(completedAt),
      },
    });
    return result.count;
  }

  async deleteCompletedBefore(cutoff: string) {
    const result = await this.database.thoughtFormHostedAttempt.deleteMany({
      where: {
        userId: this.userId,
        completedAt: { lt: new Date(cutoff) },
      },
    });
    return result.count;
  }

  async discard(attemptId: string) {
    await this.database.thoughtFormHostedAttempt.deleteMany({
      where: { id: attemptId, userId: this.userId, completedAt: null },
    });
  }
}
