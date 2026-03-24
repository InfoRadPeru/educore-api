-- CreateEnum
CREATE TYPE "EstadoAsistencia" AS ENUM ('PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO');

-- AlterTable
ALTER TABLE "colegio_configuracion" ADD COLUMN     "decimales_nota" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nota_aprobatoria" DOUBLE PRECISION NOT NULL DEFAULT 11,
ADD COLUMN     "nota_maxima" DOUBLE PRECISION NOT NULL DEFAULT 20,
ADD COLUMN     "nota_minima" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "periodos_evaluacion" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_evaluacion" (
    "id" TEXT NOT NULL,
    "docente_asignacion_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" TEXT NOT NULL,
    "docente_asignacion_id" TEXT NOT NULL,
    "periodo_id" TEXT NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_limite" TIMESTAMP(3),
    "puntaje_maximo" DOUBLE PRECISION NOT NULL,
    "peso_en_categoria" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_actividades" (
    "id" TEXT NOT NULL,
    "actividad_id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "puntaje" DOUBLE PRECISION,
    "observacion" TEXT,
    "calificado_por_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias_notas" (
    "id" TEXT NOT NULL,
    "nota_actividad_id" TEXT NOT NULL,
    "puntaje_anterior" DOUBLE PRECISION,
    "puntaje_nuevo" DOUBLE PRECISION,
    "modificado_por_id" TEXT NOT NULL,
    "motivo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_notas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_periodo" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "docente_asignacion_id" TEXT NOT NULL,
    "periodo_id" TEXT NOT NULL,
    "nota_final" DOUBLE PRECISION NOT NULL,
    "es_manual" BOOLEAN NOT NULL DEFAULT false,
    "calculada_en" TIMESTAMP(3) NOT NULL,
    "calculada_por_id" TEXT NOT NULL,

    CONSTRAINT "notas_periodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" TEXT NOT NULL,
    "docente_asignacion_id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" "EstadoAsistencia" NOT NULL,
    "observacion" TEXT,
    "registrado_por_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "periodos_evaluacion_colegio_id_año_academico_numero_key" ON "periodos_evaluacion"("colegio_id", "año_academico", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_evaluacion_docente_asignacion_id_nombre_key" ON "categorias_evaluacion"("docente_asignacion_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "notas_actividades_actividad_id_alumno_id_key" ON "notas_actividades"("actividad_id", "alumno_id");

-- CreateIndex
CREATE UNIQUE INDEX "notas_periodo_alumno_id_docente_asignacion_id_periodo_id_key" ON "notas_periodo"("alumno_id", "docente_asignacion_id", "periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_docente_asignacion_id_alumno_id_fecha_key" ON "asistencias"("docente_asignacion_id", "alumno_id", "fecha");

-- AddForeignKey
ALTER TABLE "periodos_evaluacion" ADD CONSTRAINT "periodos_evaluacion_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_evaluacion" ADD CONSTRAINT "categorias_evaluacion_docente_asignacion_id_fkey" FOREIGN KEY ("docente_asignacion_id") REFERENCES "docente_asignaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_docente_asignacion_id_fkey" FOREIGN KEY ("docente_asignacion_id") REFERENCES "docente_asignaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividades" ADD CONSTRAINT "actividades_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias_evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_actividades" ADD CONSTRAINT "notas_actividades_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_actividades" ADD CONSTRAINT "notas_actividades_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_actividades" ADD CONSTRAINT "notas_actividades_calificado_por_id_fkey" FOREIGN KEY ("calificado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias_notas" ADD CONSTRAINT "auditorias_notas_nota_actividad_id_fkey" FOREIGN KEY ("nota_actividad_id") REFERENCES "notas_actividades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias_notas" ADD CONSTRAINT "auditorias_notas_modificado_por_id_fkey" FOREIGN KEY ("modificado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_periodo" ADD CONSTRAINT "notas_periodo_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_periodo" ADD CONSTRAINT "notas_periodo_docente_asignacion_id_fkey" FOREIGN KEY ("docente_asignacion_id") REFERENCES "docente_asignaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_periodo" ADD CONSTRAINT "notas_periodo_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_periodo" ADD CONSTRAINT "notas_periodo_calculada_por_id_fkey" FOREIGN KEY ("calculada_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_docente_asignacion_id_fkey" FOREIGN KEY ("docente_asignacion_id") REFERENCES "docente_asignaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
