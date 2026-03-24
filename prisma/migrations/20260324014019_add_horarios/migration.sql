-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO');

-- CreateEnum
CREATE TYPE "EstadoHorario" AS ENUM ('BORRADOR', 'PUBLICADO');

-- CreateTable
CREATE TABLE "franjas_horarias" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franjas_horarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_seccion" (
    "id" TEXT NOT NULL,
    "seccion_id" TEXT NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "estado" "EstadoHorario" NOT NULL DEFAULT 'BORRADOR',
    "generado_auto" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_seccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horario_bloques" (
    "id" TEXT NOT NULL,
    "horario_seccion_id" TEXT NOT NULL,
    "docente_asignacion_id" TEXT NOT NULL,
    "franja_horaria_id" TEXT NOT NULL,
    "dia_semana" "DiaSemana" NOT NULL,
    "aula" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horario_bloques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "franjas_horarias_colegio_id_hora_inicio_hora_fin_key" ON "franjas_horarias"("colegio_id", "hora_inicio", "hora_fin");

-- CreateIndex
CREATE UNIQUE INDEX "franjas_horarias_colegio_id_orden_key" ON "franjas_horarias"("colegio_id", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_seccion_seccion_id_año_academico_key" ON "horarios_seccion"("seccion_id", "año_academico");

-- CreateIndex
CREATE UNIQUE INDEX "horario_bloques_horario_seccion_id_dia_semana_franja_horari_key" ON "horario_bloques"("horario_seccion_id", "dia_semana", "franja_horaria_id");

-- AddForeignKey
ALTER TABLE "franjas_horarias" ADD CONSTRAINT "franjas_horarias_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_seccion" ADD CONSTRAINT "horarios_seccion_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "secciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_bloques" ADD CONSTRAINT "horario_bloques_horario_seccion_id_fkey" FOREIGN KEY ("horario_seccion_id") REFERENCES "horarios_seccion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_bloques" ADD CONSTRAINT "horario_bloques_docente_asignacion_id_fkey" FOREIGN KEY ("docente_asignacion_id") REFERENCES "docente_asignaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horario_bloques" ADD CONSTRAINT "horario_bloques_franja_horaria_id_fkey" FOREIGN KEY ("franja_horaria_id") REFERENCES "franjas_horarias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
