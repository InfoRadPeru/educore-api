-- CreateEnum
CREATE TYPE "EstadoDocente" AS ENUM ('ACTIVO', 'INACTIVO', 'LICENCIA');

-- CreateTable
CREATE TABLE "perfil_docentes" (
    "id" TEXT NOT NULL,
    "persona_id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "sede_id" TEXT,
    "especialidad" TEXT,
    "estado" "EstadoDocente" NOT NULL DEFAULT 'ACTIVO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_docentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "docente_asignaciones" (
    "id" TEXT NOT NULL,
    "docente_id" TEXT NOT NULL,
    "seccion_id" TEXT NOT NULL,
    "colegio_asignatura_id" TEXT NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "es_tutor" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docente_asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaturas_maestras" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaturas_maestras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colegio_asignaturas" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "asignatura_maestra_id" TEXT NOT NULL,
    "nombre" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colegio_asignaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grado_asignaturas" (
    "id" TEXT NOT NULL,
    "colegio_grado_id" TEXT NOT NULL,
    "colegio_asignatura_id" TEXT NOT NULL,
    "horas_semanales" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grado_asignaturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfil_docentes_persona_id_colegio_id_key" ON "perfil_docentes"("persona_id", "colegio_id");

-- CreateIndex
CREATE UNIQUE INDEX "docente_asignaciones_docente_id_seccion_id_colegio_asignatu_key" ON "docente_asignaciones"("docente_id", "seccion_id", "colegio_asignatura_id", "año_academico");

-- CreateIndex
CREATE UNIQUE INDEX "asignaturas_maestras_nombre_key" ON "asignaturas_maestras"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "colegio_asignaturas_colegio_id_asignatura_maestra_id_key" ON "colegio_asignaturas"("colegio_id", "asignatura_maestra_id");

-- CreateIndex
CREATE UNIQUE INDEX "grado_asignaturas_colegio_grado_id_colegio_asignatura_id_key" ON "grado_asignaturas"("colegio_grado_id", "colegio_asignatura_id");

-- AddForeignKey
ALTER TABLE "perfil_docentes" ADD CONSTRAINT "perfil_docentes_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_docentes" ADD CONSTRAINT "perfil_docentes_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_docentes" ADD CONSTRAINT "perfil_docentes_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_asignaciones" ADD CONSTRAINT "docente_asignaciones_docente_id_fkey" FOREIGN KEY ("docente_id") REFERENCES "perfil_docentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_asignaciones" ADD CONSTRAINT "docente_asignaciones_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "secciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "docente_asignaciones" ADD CONSTRAINT "docente_asignaciones_colegio_asignatura_id_fkey" FOREIGN KEY ("colegio_asignatura_id") REFERENCES "colegio_asignaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_asignaturas" ADD CONSTRAINT "colegio_asignaturas_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colegio_asignaturas" ADD CONSTRAINT "colegio_asignaturas_asignatura_maestra_id_fkey" FOREIGN KEY ("asignatura_maestra_id") REFERENCES "asignaturas_maestras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grado_asignaturas" ADD CONSTRAINT "grado_asignaturas_colegio_grado_id_fkey" FOREIGN KEY ("colegio_grado_id") REFERENCES "colegio_grados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grado_asignaturas" ADD CONSTRAINT "grado_asignaturas_colegio_asignatura_id_fkey" FOREIGN KEY ("colegio_asignatura_id") REFERENCES "colegio_asignaturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
