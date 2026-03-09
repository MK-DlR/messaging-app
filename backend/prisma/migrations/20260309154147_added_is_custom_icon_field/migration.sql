-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "isCustomIcon" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isCustomIcon" BOOLEAN NOT NULL DEFAULT false;
