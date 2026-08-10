-- CreateTable
CREATE TABLE "thoughtform_hosted_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "outcome" TEXT,
    "model" TEXT,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "reasoning_tokens" INTEGER,
    "cache_read_tokens" INTEGER,
    "cache_write_tokens" INTEGER,
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "thoughtform_hosted_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "thoughtform_hosted_attempts_user_id_admitted_at_idx" ON "thoughtform_hosted_attempts"("user_id", "admitted_at");

-- CreateIndex
CREATE INDEX "thoughtform_hosted_attempts_outcome_admitted_at_idx" ON "thoughtform_hosted_attempts"("outcome", "admitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_hosted_attempts_user_id_action_operation_id_key" ON "thoughtform_hosted_attempts"("user_id", "action", "operation_id");

-- AddForeignKey
ALTER TABLE "thoughtform_hosted_attempts" ADD CONSTRAINT "thoughtform_hosted_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
