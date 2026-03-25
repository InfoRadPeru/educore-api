-- CreateTable
CREATE TABLE "publicaciones_boletin" (
    "id" TEXT NOT NULL,
    "periodo_id" TEXT NOT NULL,
    "seccion_id" TEXT NOT NULL,
    "publicado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicado_por_id" TEXT NOT NULL,

    CONSTRAINT "publicaciones_boletin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publicaciones_boletin_periodo_id_seccion_id_key" ON "publicaciones_boletin"("periodo_id", "seccion_id");

-- AddForeignKey
ALTER TABLE "publicaciones_boletin" ADD CONSTRAINT "publicaciones_boletin_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones_boletin" ADD CONSTRAINT "publicaciones_boletin_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "secciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones_boletin" ADD CONSTRAINT "publicaciones_boletin_publicado_por_id_fkey" FOREIGN KEY ("publicado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
