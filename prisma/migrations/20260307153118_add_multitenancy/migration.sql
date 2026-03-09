/*
  Warnings:

  - Added the required column `colegio_id` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoColegio" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "PlanColegio" AS ENUM ('BASICO', 'PREMIUM', 'ENTERPRISE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Rol" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Rol" ADD VALUE 'ALUMNO';

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "colegio_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "colegios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "estado" "EstadoColegio" NOT NULL DEFAULT 'ACTIVO',
    "plan" "PlanColegio" NOT NULL DEFAULT 'BASICO',
    "plan_vence_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colegio_configuracion" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "logo_url" TEXT,
    "color_primario" TEXT DEFAULT '#1a73e8',
    "color_secundario" TEXT DEFAULT '#ffffff',
    "favicon_url" TEXT,
    "nivel_educativo" TEXT,
    "escala_notas" TEXT DEFAULT '0-20',
    "vacantes_x_seccion" INTEGER DEFAULT 30,
    "turno" TEXT DEFAULT 'mañana',
    "idioma" TEXT NOT NULL DEFAULT 'es',
    "zona_horaria" TEXT NOT NULL DEFAULT 'America/Lima',
    "formato_fecha" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegio_configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colegios_ruc_key" ON "colegios"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "colegios_email_key" ON "colegios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_configuracion_colegio_id_key" ON "colegio_configuracion"("colegio_id");

-- AddForeignKey
ALTER TABLE "colegio_configuracion" ADD CONSTRAINT "colegio_configuracion_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
