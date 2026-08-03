ALTER TABLE "socratic_draft_conversations"
ADD COLUMN "draft_format" TEXT,
ADD COLUMN "draft_format_revision" INTEGER NOT NULL DEFAULT 0;
