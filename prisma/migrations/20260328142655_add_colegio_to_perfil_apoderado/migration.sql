/*
  Warnings:

  - Added the required column `colegio_id` to the `perfil_apoderados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "perfil_apoderados" ADD COLUMN     "colegio_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "perfil_apoderados" ADD CONSTRAINT "perfil_apoderados_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
