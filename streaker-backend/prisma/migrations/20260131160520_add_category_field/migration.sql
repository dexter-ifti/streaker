-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "category" TEXT[] DEFAULT ARRAY[]::TEXT[];
