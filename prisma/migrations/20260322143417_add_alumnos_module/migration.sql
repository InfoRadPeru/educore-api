/*
  Warnings:

  - Added the required column `colegio_id` to the `perfil_alumnos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoAlumno" AS ENUM ('ACTIVO', 'INACTIVO', 'RETIRADO');

-- CreateEnum
CREATE TYPE "EstadoPrematricula" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "EstadoMatricula" AS ENUM ('NUEVA_MATRICULA', 'MATRICULADO', 'REPITENTE', 'PROMOVIDO', 'EXPULSADO', 'CAMBIO_DE_COLEGIO');

-- AlterTable
ALTER TABLE "perfil_alumnos" ADD COLUMN     "colegio_id" TEXT NOT NULL,
ADD COLUMN     "estado" "EstadoAlumno" NOT NULL DEFAULT 'ACTIVO';

-- CreateTable
CREATE TABLE "prematriculas" (
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
    "estado" "EstadoPrematricula" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "perfil_alumno_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prematriculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriculas" (
    "id" TEXT NOT NULL,
    "perfil_alumno_id" TEXT NOT NULL,
    "seccion_id" TEXT NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "estado" "EstadoMatricula" NOT NULL DEFAULT 'NUEVA_MATRICULA',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prematriculas_perfil_alumno_id_key" ON "prematriculas"("perfil_alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "matriculas_perfil_alumno_id_seccion_id_año_academico_key" ON "matriculas"("perfil_alumno_id", "seccion_id", "año_academico");

-- AddForeignKey
ALTER TABLE "prematriculas" ADD CONSTRAINT "prematriculas_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prematriculas" ADD CONSTRAINT "prematriculas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prematriculas" ADD CONSTRAINT "prematriculas_colegio_nivel_id_fkey" FOREIGN KEY ("colegio_nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prematriculas" ADD CONSTRAINT "prematriculas_perfil_alumno_id_fkey" FOREIGN KEY ("perfil_alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_perfil_alumno_id_fkey" FOREIGN KEY ("perfil_alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "secciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_alumnos" ADD CONSTRAINT "perfil_alumnos_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
