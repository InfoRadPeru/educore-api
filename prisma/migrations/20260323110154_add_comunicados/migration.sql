-- CreateEnum
CREATE TYPE "EstadoComunicado" AS ENUM ('BORRADOR', 'PUBLICADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "AudienciaComunicado" AS ENUM ('COLEGIO', 'NIVEL', 'GRADO', 'SECCION', 'INDIVIDUAL');

-- CreateTable
CREATE TABLE "comunicados" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "autor_id" TEXT NOT NULL,
    "estado" "EstadoComunicado" NOT NULL DEFAULT 'BORRADOR',
    "audiencia" "AudienciaComunicado" NOT NULL,
    "colegio_nivel_id" TEXT,
    "colegio_grado_id" TEXT,
    "seccion_id" TEXT,
    "destinatario_id" TEXT,
    "año_academico" INTEGER NOT NULL,
    "publicado_en" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comunicados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicado_lecturas" (
    "id" TEXT NOT NULL,
    "comunicado_id" TEXT NOT NULL,
    "apoderado_id" TEXT NOT NULL,
    "leido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comunicado_lecturas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comunicado_lecturas_comunicado_id_apoderado_id_key" ON "comunicado_lecturas"("comunicado_id", "apoderado_id");

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_colegio_nivel_id_fkey" FOREIGN KEY ("colegio_nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_colegio_grado_id_fkey" FOREIGN KEY ("colegio_grado_id") REFERENCES "colegio_grados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "secciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicados" ADD CONSTRAINT "comunicados_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "perfil_apoderados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado_lecturas" ADD CONSTRAINT "comunicado_lecturas_comunicado_id_fkey" FOREIGN KEY ("comunicado_id") REFERENCES "comunicados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicado_lecturas" ADD CONSTRAINT "comunicado_lecturas_apoderado_id_fkey" FOREIGN KEY ("apoderado_id") REFERENCES "perfil_apoderados"("id") ON DELETE CASCADE ON UPDATE CASCADE;
