-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "brandName" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'generating';
