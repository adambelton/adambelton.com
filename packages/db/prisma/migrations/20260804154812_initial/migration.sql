-- CreateEnum
CREATE TYPE "ConversationMessageRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "is_owner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "next_message_position" INTEGER NOT NULL DEFAULT 0,
    "idea_map_revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thoughtform_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_idea_map_revisions" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "ideas" JSONB NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thoughtform_idea_map_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_conversation_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "role" "ConversationMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thoughtform_conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_drafts" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "current_revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thoughtform_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_draft_revisions" (
    "id" TEXT NOT NULL,
    "draft_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "proposal_id" TEXT,
    "restored_from_revision" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thoughtform_draft_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_revision_proposals" (
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

    CONSTRAINT "thoughtform_revision_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_revision_proposal_versions" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "proposed_content" TEXT NOT NULL,
    "intended_effect" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thoughtform_revision_proposal_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thoughtform_operations" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "operation_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thoughtform_operations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "thoughtform_conversations_user_id_updated_at_idx" ON "thoughtform_conversations"("user_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_conversations_id_user_id_key" ON "thoughtform_conversations"("id", "user_id");

-- CreateIndex
CREATE INDEX "thoughtform_idea_map_revisions_conversation_id_idx" ON "thoughtform_idea_map_revisions"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_idea_map_revisions_conversation_id_revision_key" ON "thoughtform_idea_map_revisions"("conversation_id", "revision");

-- CreateIndex
CREATE INDEX "thoughtform_conversation_messages_conversation_id_idx" ON "thoughtform_conversation_messages"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_conversation_messages_conversation_id_position_key" ON "thoughtform_conversation_messages"("conversation_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_drafts_conversation_id_key" ON "thoughtform_drafts"("conversation_id");

-- CreateIndex
CREATE INDEX "thoughtform_draft_revisions_draft_id_idx" ON "thoughtform_draft_revisions"("draft_id");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_draft_revisions_draft_id_revision_key" ON "thoughtform_draft_revisions"("draft_id", "revision");

-- CreateIndex
CREATE INDEX "thoughtform_revision_proposals_draft_id_state_idx" ON "thoughtform_revision_proposals"("draft_id", "state");

-- CreateIndex
CREATE INDEX "thoughtform_revision_proposal_versions_proposal_id_idx" ON "thoughtform_revision_proposal_versions"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_revision_proposal_versions_proposal_id_revision_key" ON "thoughtform_revision_proposal_versions"("proposal_id", "revision");

-- CreateIndex
CREATE INDEX "thoughtform_operations_conversation_id_idx" ON "thoughtform_operations"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "thoughtform_operations_conversation_id_operation_id_key" ON "thoughtform_operations"("conversation_id", "operation_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_conversations" ADD CONSTRAINT "thoughtform_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_idea_map_revisions" ADD CONSTRAINT "thoughtform_idea_map_revisions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "thoughtform_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_conversation_messages" ADD CONSTRAINT "thoughtform_conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "thoughtform_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_drafts" ADD CONSTRAINT "thoughtform_drafts_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "thoughtform_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_draft_revisions" ADD CONSTRAINT "thoughtform_draft_revisions_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "thoughtform_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_revision_proposals" ADD CONSTRAINT "thoughtform_revision_proposals_draft_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "thoughtform_drafts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_revision_proposal_versions" ADD CONSTRAINT "thoughtform_revision_proposal_versions_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "thoughtform_revision_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thoughtform_operations" ADD CONSTRAINT "thoughtform_operations_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "thoughtform_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
