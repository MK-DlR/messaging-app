/*
  Warnings:

  - You are about to alter the column `channelInfo` on the `channels` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `body` on the `messages` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2000)`.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `displayName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - You are about to alter the column `profileInfo` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.

*/
-- AlterTable
ALTER TABLE "channels" ALTER COLUMN "channelInfo" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "body" SET DATA TYPE VARCHAR(2000);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "displayName" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "profileInfo" SET DATA TYPE VARCHAR(200);
