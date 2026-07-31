-- AlterTable
ALTER TABLE "socratic_draft_conversations" ADD COLUMN     "next_message_position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_conversations_id_user_id_key" ON "socratic_draft_conversations"("id", "user_id");
