-- DropForeignKey
ALTER TABLE "socratic_draft_entries" DROP CONSTRAINT "socratic_draft_entries_user_id_fkey";

-- DropForeignKey
ALTER TABLE "socratic_draft_conversation_messages" DROP CONSTRAINT "socratic_draft_conversation_messages_entry_id_fkey";

-- DropIndex
DROP INDEX "socratic_draft_conversation_messages_entry_id_idx";

-- DropIndex
DROP INDEX "socratic_draft_conversation_messages_entry_id_position_key";

-- AlterTable
ALTER TABLE "socratic_draft_conversation_messages" DROP COLUMN "entry_id",
ADD COLUMN     "conversation_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "socratic_draft_entries";

-- CreateTable
CREATE TABLE "socratic_draft_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "socratic_draft_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "socratic_draft_conversations_user_id_updated_at_idx" ON "socratic_draft_conversations"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "socratic_draft_conversation_messages_conversation_id_idx" ON "socratic_draft_conversation_messages"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_conversation_messages_conversation_id_positi_key" ON "socratic_draft_conversation_messages"("conversation_id", "position");

-- AddForeignKey
ALTER TABLE "socratic_draft_conversations" ADD CONSTRAINT "socratic_draft_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socratic_draft_conversation_messages" ADD CONSTRAINT "socratic_draft_conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "socratic_draft_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
