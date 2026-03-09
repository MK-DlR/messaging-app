/*
  Warnings:

  - You are about to drop the column `isCustomIcon` on the `channels` table. All the data in the column will be lost.
  - You are about to drop the column `isCustomIcon` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channels" DROP COLUMN "isCustomIcon";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isCustomIcon";
