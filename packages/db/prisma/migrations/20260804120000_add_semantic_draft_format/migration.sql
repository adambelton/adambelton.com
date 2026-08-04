ALTER TABLE "socratic_draft_drafts"
ADD COLUMN "content_format" TEXT NOT NULL DEFAULT 'plain_text',
ADD COLUMN "schema_version" INTEGER;

ALTER TABLE "socratic_draft_draft_revisions"
ADD COLUMN "content_format" TEXT NOT NULL DEFAULT 'plain_text',
ADD COLUMN "schema_version" INTEGER;
