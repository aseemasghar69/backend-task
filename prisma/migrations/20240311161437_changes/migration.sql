/*
  Warnings:

  - You are about to drop the column `user_id` on the `Projects` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Projects" DROP CONSTRAINT "Projects_user_id_fkey";

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
