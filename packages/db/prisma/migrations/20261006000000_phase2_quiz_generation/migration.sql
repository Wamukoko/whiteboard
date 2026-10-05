-- Phase 2 — quiz generation pipeline.
--
-- Adds the state the background generation job needs (extraction/generation
-- lifecycle, token accounting, reviewer notes) and records which learner a
-- generated quiz targets, since CBC alignment and difficulty are grade-band
-- specific.
--
-- Generated with `prisma migrate diff` against the Phase 1 datamodel, then
-- hardened for the learnerId column (see below).

-- CreateEnum
CREATE TYPE "ExtractionState" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "GenerationState" AS ENUM ('QUEUED', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "UploadedMaterial" ADD COLUMN     "extractedChars" INTEGER,
ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "extractionState" "ExtractionState" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "failureReason" TEXT;

-- AlterTable
-- learnerId is added nullable first so this migration also applies to a
-- database that already holds rows, then tightened below.
ALTER TABLE "GeneratedLearningContent" ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "generationState" "GenerationState" NOT NULL DEFAULT 'QUEUED',
ADD COLUMN     "inputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "learnerId" TEXT,
ADD COLUMN     "outputTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reviewNotes" TEXT;

-- CreateIndex
CREATE INDEX "UploadedMaterial_extractionState_idx" ON "UploadedMaterial"("extractionState");

-- CreateIndex
-- Serves monthly cap counting without a separate ledger table.
CREATE INDEX "GeneratedLearningContent_familyId_createdAt_idx" ON "GeneratedLearningContent"("familyId", "createdAt");

-- CreateIndex
CREATE INDEX "GeneratedLearningContent_learnerId_idx" ON "GeneratedLearningContent"("learnerId");

-- CreateIndex
CREATE INDEX "GeneratedLearningContent_generationState_idx" ON "GeneratedLearningContent"("generationState");

-- AddForeignKey
ALTER TABLE "GeneratedLearningContent" ADD CONSTRAINT "GeneratedLearningContent_learnerId_fkey" FOREIGN KEY ("learnerId") REFERENCES "LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Guard, then tighten.
--
-- A generated quiz cannot be attributed to a learner without guessing a grade
-- band, so such a row would be unusable. Rather than silently deleting data if
-- this migration is ever applied to a populated table, fail loudly and let the
-- operator backfill first. On a database with no generated content (the expected
-- state, since Phase 1 has no code path that writes this table) this is a no-op.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "GeneratedLearningContent" WHERE "learnerId" IS NULL) THEN
    RAISE EXCEPTION
      'GeneratedLearningContent contains rows with no learnerId. Backfill them (or delete them deliberately) before re-running this migration.';
  END IF;
END $$;

ALTER TABLE "GeneratedLearningContent" ALTER COLUMN "learnerId" SET NOT NULL;