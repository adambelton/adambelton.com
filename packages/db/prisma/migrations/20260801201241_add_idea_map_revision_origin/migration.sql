/*
  Warnings:

  - You are about to drop the column `source` on the `socratic_draft_idea_map_revisions` table. All the data in the column will be lost.
  - Added the required column `source_id` to the `socratic_draft_idea_map_revisions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_type` to the `socratic_draft_idea_map_revisions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "socratic_draft_idea_map_revisions" DROP COLUMN "source",
ADD COLUMN     "source_id" TEXT NOT NULL,
ADD COLUMN     "source_type" TEXT NOT NULL;
