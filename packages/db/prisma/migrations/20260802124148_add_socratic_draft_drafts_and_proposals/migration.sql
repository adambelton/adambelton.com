-- CreateTable
CREATE TABLE "socratic_draft_drafts" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "current_revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "socratic_draft_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socratic_draft_draft_revisions" (
    "id" TEXT NOT NULL,
    "draft_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "proposal_id" TEXT,
    "restored_from_revision" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "socratic_draft_draft_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socratic_draft_revision_proposals" (
    "id" TEXT NOT NULL,
    "draft_id" TEXT NOT NULL,
    "base_draft_revision" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "original_start" INTEGER NOT NULL,
    "original_end" INTEGER NOT NULL,
    "original_content" TEXT NOT NULL,
    "user_instruction" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "current_proposal_revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "socratic_draft_revision_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socratic_draft_revision_proposal_versions" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "proposed_content" TEXT NOT NULL,
    "intended_effect" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "socratic_draft_revision_proposal_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socratic_draft_operations" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "socratic_draft_operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_drafts_conversation_id_key" ON "socratic_draft_drafts"("conversation_id");

-- CreateIndex
CREATE INDEX "socratic_draft_draft_revisions_draft_id_idx" ON "socratic_draft_draft_revisions"("draft_id");

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_draft_revisions_draft_id_revision_key" ON "socratic_draft_draft_revisions"("draft_id", "revision");

-- CreateIndex
CREATE INDEX "socratic_draft_revision_proposals_draft_id_state_idx" ON "socratic_draft_revision_proposals"("draft_id", "state");

-- CreateIndex
CREATE INDEX "socratic_draft_revision_proposal_versions_proposal_id_idx" ON "socratic_draft_revision_proposal_versions"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_revision_proposal_versions_proposal_id_revis_key" ON "socratic_draft_revision_proposal_versions"("proposal_id", "revision");

-- CreateIndex
CREATE INDEX "socratic_draft_operations_conversation_id_idx" ON "socratic_draft_operations"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "socratic_draft_operations_conversation_id_operation_id_key" ON "socratic_draft_operations"("conversation_id", "operation_id");

-- AddForeignKey
ALTER TABLE "socratic_draft_drafts" ADD CONSTRAINT "socratic_draft_drafts_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "socratic_draft_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socratic_draft_draft_revisions" ADD CONSTRAINT "socratic_draft_draft_revisions_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "socratic_draft_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socratic_draft_revision_proposals" ADD CONSTRAINT "socratic_draft_revision_proposals_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "socratic_draft_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socratic_draft_revision_proposal_versions" ADD CONSTRAINT "socratic_draft_revision_proposal_versions_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "socratic_draft_revision_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socratic_draft_operations" ADD CONSTRAINT "socratic_draft_operations_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "socratic_draft_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
