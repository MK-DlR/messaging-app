/*
  Warnings:

  - Made the column `icon` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT 'default-channel.png';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "icon" SET NOT NULL,
ALTER COLUMN "icon" SET DEFAULT 'default-user.png';
