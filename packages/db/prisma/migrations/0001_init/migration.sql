-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ConversationMessageRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "socratic_draft_entries" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "socratic_draft_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socratic_draft_conversation_messages" (
    "id" TEXT NOT NULL,
    "entry_id" TEXT NOT NULL,
    "role" "ConversationMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "socratic_draft_conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "socratic_draft_conversation_messages_entry_id_idx" ON "socratic_draft_conversation_messages"("entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_conversation_messages_entry_id_position_key" ON "socratic_draft_conversation_messages"("entry_id", "position");

-- AddForeignKey
ALTER TABLE "socratic_draft_conversation_messages" ADD CONSTRAINT "socratic_draft_conversation_messages_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "socratic_draft_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
