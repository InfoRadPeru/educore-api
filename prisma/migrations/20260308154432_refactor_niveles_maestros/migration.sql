/*
  Warnings:

  - You are about to drop the column `nivel_id` on the `colegio_nivel_turnos` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `colegio_niveles` table. All the data in the column will be lost.
  - You are about to drop the column `orden` on the `colegio_niveles` table. All the data in the column will be lost.
  - You are about to drop the column `grado_id` on the `secciones` table. All the data in the column will be lost.
  - You are about to drop the `grados` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[colegio_nivel_id,turno]` on the table `colegio_nivel_turnos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[colegio_id,nivel_maestro_id]` on the table `colegio_niveles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[colegio_grado_id,nombre]` on the table `secciones` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `colegio_nivel_id` to the `colegio_nivel_turnos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_maestro_id` to the `colegio_niveles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `colegio_grado_id` to the `secciones` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "colegio_nivel_turnos" DROP CONSTRAINT "colegio_nivel_turnos_nivel_id_fkey";

-- DropForeignKey
ALTER TABLE "grados" DROP CONSTRAINT "grados_nivel_id_fkey";

-- DropForeignKey
ALTER TABLE "secciones" DROP CONSTRAINT "secciones_grado_id_fkey";

-- DropIndex
DROP INDEX "colegio_nivel_turnos_nivel_id_turno_key";

-- DropIndex
DROP INDEX "colegio_niveles_colegio_id_nombre_key";

-- DropIndex
DROP INDEX "secciones_grado_id_nombre_key";

-- AlterTable
ALTER TABLE "colegio_nivel_turnos" DROP COLUMN "nivel_id",
ADD COLUMN     "colegio_nivel_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "colegio_niveles" DROP COLUMN "nombre",
DROP COLUMN "orden",
ADD COLUMN     "nivel_maestro_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "secciones" DROP COLUMN "grado_id",
ADD COLUMN     "colegio_grado_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "grados";

-- CreateTable
CREATE TABLE "colegio_grados" (
    "id" TEXT NOT NULL,
    "colegio_nivel_id" TEXT NOT NULL,
    "grado_maestro_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegio_grados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "niveles_maestros" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "niveles_maestros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grados_maestros" (
    "id" TEXT NOT NULL,
    "nivel_maestro_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grados_maestros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colegio_grados_colegio_nivel_id_grado_maestro_id_key" ON "colegio_grados"("colegio_nivel_id", "grado_maestro_id");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_maestros_nombre_key" ON "niveles_maestros"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "niveles_maestros_orden_key" ON "niveles_maestros"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "grados_maestros_nivel_maestro_id_nombre_key" ON "grados_maestros"("nivel_maestro_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "grados_maestros_nivel_maestro_id_orden_key" ON "grados_maestros"("nivel_maestro_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_nivel_turnos_colegio_nivel_id_turno_key" ON "colegio_nivel_turnos"("colegio_nivel_id", "turno");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_niveles_colegio_id_nivel_maestro_id_key" ON "colegio_niveles"("colegio_id", "nivel_maestro_id");

-- CreateIndex
CREATE UNIQUE INDEX "secciones_colegio_grado_id_nombre_key" ON "secciones"("colegio_grado_id", "nombre");

-- AddForeignKey
ALTER TABLE "colegio_niveles" ADD CONSTRAINT "colegio_niveles_nivel_maestro_id_fkey" FOREIGN KEY ("nivel_maestro_id") REFERENCES "niveles_maestros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_nivel_turnos" ADD CONSTRAINT "colegio_nivel_turnos_colegio_nivel_id_fkey" FOREIGN KEY ("colegio_nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_grados" ADD CONSTRAINT "colegio_grados_colegio_nivel_id_fkey" FOREIGN KEY ("colegio_nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_grados" ADD CONSTRAINT "colegio_grados_grado_maestro_id_fkey" FOREIGN KEY ("grado_maestro_id") REFERENCES "grados_maestros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_colegio_grado_id_fkey" FOREIGN KEY ("colegio_grado_id") REFERENCES "colegio_grados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grados_maestros" ADD CONSTRAINT "grados_maestros_nivel_maestro_id_fkey" FOREIGN KEY ("nivel_maestro_id") REFERENCES "niveles_maestros"("id") ON DELETE CASCADE ON UPDATE CASCADE;
