/*
  Warnings:

  - You are about to drop the column `escala_notas` on the `colegio_configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `nivel_educativo` on the `colegio_configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `turno` on the `colegio_configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `vacantes_x_seccion` on the `colegio_configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `activo` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `colegio_id` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `rol` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[persona_id]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `persona_id` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'INACTIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "PeriodoAcademico" AS ENUM ('BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('MANANA', 'TARDE', 'NOCHE', 'COMPLETO');

-- CreateEnum
CREATE TYPE "Genero" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_colegio_id_fkey";

-- AlterTable
ALTER TABLE "colegio_configuracion" DROP COLUMN "escala_notas",
DROP COLUMN "nivel_educativo",
DROP COLUMN "turno",
DROP COLUMN "vacantes_x_seccion",
ADD COLUMN     "periodo" "PeriodoAcademico" NOT NULL DEFAULT 'BIMESTRAL';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "activo",
DROP COLUMN "colegio_id",
DROP COLUMN "rol",
ADD COLUMN     "es_platform_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estado" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
ADD COLUMN     "persona_id" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Rol";

-- CreateTable
CREATE TABLE "colegio_niveles" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegio_niveles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colegio_nivel_turnos" (
    "id" TEXT NOT NULL,
    "nivel_id" TEXT NOT NULL,
    "turno" "Turno" NOT NULL,

    CONSTRAINT "colegio_nivel_turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sedes" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sede_configuracion" (
    "id" TEXT NOT NULL,
    "sede_id" TEXT NOT NULL,
    "logo_url" TEXT,
    "color_primario" TEXT,
    "color_secundario" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sede_configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grados" (
    "id" TEXT NOT NULL,
    "nivel_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secciones" (
    "id" TEXT NOT NULL,
    "grado_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "vacantes" INTEGER NOT NULL DEFAULT 30,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fecha_nac" TIMESTAMP(3) NOT NULL,
    "genero" "Genero" NOT NULL,
    "telefono" TEXT,
    "direccion" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_alumnos" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "codigo_matricula" TEXT NOT NULL,
    "colegio_origen_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_alumnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colegio_roles" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "es_sistema" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegio_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colegio_rol_permisos" (
    "id" TEXT NOT NULL,
    "rol_id" TEXT NOT NULL,
    "permiso" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colegio_rol_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_asignaciones" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "sede_id" TEXT,
    "rol_id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "colegio_niveles_colegio_id_nombre_key" ON "colegio_niveles"("colegio_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_nivel_turnos_nivel_id_turno_key" ON "colegio_nivel_turnos"("nivel_id", "turno");

-- CreateIndex
CREATE UNIQUE INDEX "sede_configuracion_sede_id_key" ON "sede_configuracion"("sede_id");

-- CreateIndex
CREATE UNIQUE INDEX "grados_nivel_id_nombre_key" ON "grados"("nivel_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "secciones_grado_id_nombre_key" ON "secciones"("grado_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "personas_dni_key" ON "personas"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_alumnos_persona_id_key" ON "perfil_alumnos"("persona_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_alumnos_codigo_matricula_key" ON "perfil_alumnos"("codigo_matricula");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_roles_colegio_id_nombre_key" ON "colegio_roles"("colegio_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_rol_permisos_rol_id_permiso_key" ON "colegio_rol_permisos"("rol_id", "permiso");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_asignaciones_usuario_id_colegio_id_sede_id_rol_id_key" ON "usuario_asignaciones"("usuario_id", "colegio_id", "sede_id", "rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_persona_id_key" ON "usuarios"("persona_id");

-- AddForeignKey
ALTER TABLE "colegio_niveles" ADD CONSTRAINT "colegio_niveles_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_nivel_turnos" ADD CONSTRAINT "colegio_nivel_turnos_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sedes" ADD CONSTRAINT "sedes_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sede_configuracion" ADD CONSTRAINT "sede_configuracion_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grados" ADD CONSTRAINT "grados_nivel_id_fkey" FOREIGN KEY ("nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_grado_id_fkey" FOREIGN KEY ("grado_id") REFERENCES "grados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_alumnos" ADD CONSTRAINT "perfil_alumnos_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_roles" ADD CONSTRAINT "colegio_roles_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_rol_permisos" ADD CONSTRAINT "colegio_rol_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "colegio_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_asignaciones" ADD CONSTRAINT "usuario_asignaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_asignaciones" ADD CONSTRAINT "usuario_asignaciones_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_asignaciones" ADD CONSTRAINT "usuario_asignaciones_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_asignaciones" ADD CONSTRAINT "usuario_asignaciones_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "colegio_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
