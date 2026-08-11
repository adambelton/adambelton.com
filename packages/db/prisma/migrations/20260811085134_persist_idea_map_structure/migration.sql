-- AlterTable
ALTER TABLE "thoughtform_idea_map_revisions" ADD COLUMN     "potential_conflicts" JSONB,
ADD COLUMN     "structural_change" JSONB,
ADD COLUMN     "suppressed_structural_operation_signatures" JSONB;
