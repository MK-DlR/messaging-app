-- DropIndex
DROP INDEX "users_usernameNormalized_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "usernameNormalized" DROP NOT NULL;
