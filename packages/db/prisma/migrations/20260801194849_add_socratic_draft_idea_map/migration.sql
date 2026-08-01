-- AlterTable
ALTER TABLE "socratic_draft_conversations" ADD COLUMN     "idea_map_revision" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "socratic_draft_idea_map_revisions" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "ideas" JSONB NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "socratic_draft_idea_map_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "socratic_draft_idea_map_revisions_conversation_id_idx" ON "socratic_draft_idea_map_revisions"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_idea_map_revisions_conversation_id_revision_key" ON "socratic_draft_idea_map_revisions"("conversation_id", "revision");

-- AddForeignKey
ALTER TABLE "socratic_draft_idea_map_revisions" ADD CONSTRAINT "socratic_draft_idea_map_revisions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "socratic_draft_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
