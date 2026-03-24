/*
  Warnings:

  - The values [APROBADA,RECHAZADA,EXPIRADA] on the enum `EstadoPrematricula` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `apellidos` on the `prematriculas` table. All the data in the column will be lost.
  - You are about to drop the column `dni` on the `prematriculas` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_nac` on the `prematriculas` table. All the data in the column will be lost.
  - You are about to drop the column `genero` on the `prematriculas` table. All the data in the column will be lost.
  - You are about to drop the column `nombres` on the `prematriculas` table. All the data in the column will be lost.
  - You are about to drop the column `perfil_alumno_id` on the `prematriculas` table. All the data in the column will be lost.
  - You are about to drop the column `sede_id` on the `prematriculas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matricula_id]` on the table `prematriculas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `alumno_id` to the `prematriculas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "TipoParentesco" AS ENUM ('PADRE', 'MADRE', 'TUTOR');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoPrematricula_new" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA');
ALTER TABLE "public"."prematriculas" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "prematriculas" ALTER COLUMN "estado" TYPE "EstadoPrematricula_new" USING ("estado"::text::"EstadoPrematricula_new");
ALTER TYPE "EstadoPrematricula" RENAME TO "EstadoPrematricula_old";
ALTER TYPE "EstadoPrematricula_new" RENAME TO "EstadoPrematricula";
DROP TYPE "public"."EstadoPrematricula_old";
ALTER TABLE "prematriculas" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "prematriculas" DROP CONSTRAINT "prematriculas_perfil_alumno_id_fkey";

-- DropForeignKey
ALTER TABLE "prematriculas" DROP CONSTRAINT "prematriculas_sede_id_fkey";

-- DropIndex
DROP INDEX "prematriculas_perfil_alumno_id_key";

-- AlterTable
ALTER TABLE "prematriculas" DROP COLUMN "apellidos",
DROP COLUMN "dni",
DROP COLUMN "fecha_nac",
DROP COLUMN "genero",
DROP COLUMN "nombres",
DROP COLUMN "perfil_alumno_id",
DROP COLUMN "sede_id",
ADD COLUMN     "alumno_id" TEXT NOT NULL,
ADD COLUMN     "matricula_id" TEXT,
ADD COLUMN     "seccion_id" TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "postulaciones" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "sede_id" TEXT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "fecha_nac" TIMESTAMP(3) NOT NULL,
    "genero" "Genero" NOT NULL,
    "colegio_nivel_id" TEXT NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "estado" "EstadoPostulacion" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "perfil_alumno_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postulaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_apoderados" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_apoderados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apoderado_alumnos" (
    "id" TEXT NOT NULL,
    "apoderado_id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "parentesco" "TipoParentesco" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apoderado_alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postulaciones_perfil_alumno_id_key" ON "postulaciones"("perfil_alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_apoderados_persona_id_key" ON "perfil_apoderados"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "apoderado_alumnos_alumno_id_parentesco_key" ON "apoderado_alumnos"("alumno_id", "parentesco");

-- CreateIndex
CREATE UNIQUE INDEX "prematriculas_matricula_id_key" ON "prematriculas"("matricula_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_colegio_nivel_id_fkey" FOREIGN KEY ("colegio_nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postulaciones" ADD CONSTRAINT "postulaciones_perfil_alumno_id_fkey" FOREIGN KEY ("perfil_alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prematriculas" ADD CONSTRAINT "prematriculas_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prematriculas" ADD CONSTRAINT "prematriculas_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "secciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prematriculas" ADD CONSTRAINT "prematriculas_matricula_id_fkey" FOREIGN KEY ("matricula_id") REFERENCES "matriculas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_apoderados" ADD CONSTRAINT "perfil_apoderados_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apoderado_alumnos" ADD CONSTRAINT "apoderado_alumnos_apoderado_id_fkey" FOREIGN KEY ("apoderado_id") REFERENCES "perfil_apoderados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apoderado_alumnos" ADD CONSTRAINT "apoderado_alumnos_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
