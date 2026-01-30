-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "completed" BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[];
