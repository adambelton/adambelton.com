-- AlterTable
ALTER TABLE "socratic_draft_entries" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "socratic_draft_entries_user_id_updated_at_idx" ON "socratic_draft_entries"("user_id", "updated_at");

-- AddForeignKey
ALTER TABLE "socratic_draft_entries" ADD CONSTRAINT "socratic_draft_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
