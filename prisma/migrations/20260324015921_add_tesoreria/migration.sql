-- CreateEnum
CREATE TYPE "TipoConceptoPago" AS ENUM ('MATRICULA', 'PENSION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoCuota" AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('REGISTRADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'DEPOSITO');

-- CreateTable
CREATE TABLE "conceptos_pago" (
    "id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoConceptoPago" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conceptos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarifas_concepto" (
    "id" TEXT NOT NULL,
    "concepto_pago_id" TEXT NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "colegio_nivel_id" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarifas_concepto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuotas_alumno" (
    "id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "concepto_pago_id" TEXT NOT NULL,
    "año_academico" INTEGER NOT NULL,
    "mes" INTEGER,
    "descripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "monto_pagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCuota" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cuotas_alumno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "cuota_id" TEXT NOT NULL,
    "colegio_id" TEXT NOT NULL,
    "alumno_id" TEXT NOT NULL,
    "registrado_por_id" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "referencia" TEXT,
    "observacion" TEXT,
    "estado" "EstadoPago" NOT NULL DEFAULT 'REGISTRADO',
    "motivo_anulacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conceptos_pago_colegio_id_nombre_key" ON "conceptos_pago"("colegio_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tarifas_concepto_concepto_pago_id_año_academico_colegio_ni_key" ON "tarifas_concepto"("concepto_pago_id", "año_academico", "colegio_nivel_id");

-- CreateIndex
CREATE UNIQUE INDEX "cuotas_alumno_alumno_id_concepto_pago_id_año_academico_mes_key" ON "cuotas_alumno"("alumno_id", "concepto_pago_id", "año_academico", "mes");

-- AddForeignKey
ALTER TABLE "conceptos_pago" ADD CONSTRAINT "conceptos_pago_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifas_concepto" ADD CONSTRAINT "tarifas_concepto_concepto_pago_id_fkey" FOREIGN KEY ("concepto_pago_id") REFERENCES "conceptos_pago"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarifas_concepto" ADD CONSTRAINT "tarifas_concepto_colegio_nivel_id_fkey" FOREIGN KEY ("colegio_nivel_id") REFERENCES "colegio_niveles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas_alumno" ADD CONSTRAINT "cuotas_alumno_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuotas_alumno" ADD CONSTRAINT "cuotas_alumno_concepto_pago_id_fkey" FOREIGN KEY ("concepto_pago_id") REFERENCES "conceptos_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cuota_id_fkey" FOREIGN KEY ("cuota_id") REFERENCES "cuotas_alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_colegio_id_fkey" FOREIGN KEY ("colegio_id") REFERENCES "colegios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_alumno_id_fkey" FOREIGN KEY ("alumno_id") REFERENCES "perfil_alumnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
