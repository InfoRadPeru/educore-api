import { ConceptoPago } from '../../domain/entities/concepto-pago.entity';
import { TarifaConcepto } from '../../domain/entities/tarifa-concepto.entity';
import { CuotaAlumno } from '../../domain/entities/cuota-alumno.entity';
import { Pago } from '../../domain/entities/pago.entity';

type ConceptoPagoPrisma = {
  id: string; colegioId: string; nombre: string; tipo: string;
  activo: boolean; createdAt: Date; updatedAt: Date;
};

type TarifaConceptoPrisma = {
  id: string; conceptoPagoId: string; añoAcademico: number;
  colegioNivelId: string | null; monto: { toNumber(): number } | number;
  createdAt: Date; updatedAt: Date;
};

type CuotaAlumnoPrisma = {
  id: string; alumnoId: string; conceptoPagoId: string; añoAcademico: number;
  mes: number | null; descripcion: string;
  monto: { toNumber(): number } | number;
  montoPagado: { toNumber(): number } | number;
  fechaVencimiento: Date; estado: string; createdAt: Date; updatedAt: Date;
};

type PagoPrisma = {
  id: string; cuotaId: string; colegioId: string; alumnoId: string;
  registradoPorId: string; monto: { toNumber(): number } | number;
  metodoPago: string; referencia: string | null; observacion: string | null;
  estado: string; motivoAnulacion: string | null; createdAt: Date; updatedAt: Date;
};

function toNum(v: { toNumber(): number } | number): number {
  return typeof v === 'number' ? v : v.toNumber();
}

export class TesoreriaMapper {
  static toConceptoDomain(row: ConceptoPagoPrisma): ConceptoPago {
    return ConceptoPago.reconstitute({
      id:        row.id,
      colegioId: row.colegioId,
      nombre:    row.nombre,
      tipo:      row.tipo as any,
      activo:    row.activo,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toTarifaDomain(row: TarifaConceptoPrisma): TarifaConcepto {
    return TarifaConcepto.reconstitute({
      id:             row.id,
      conceptoPagoId: row.conceptoPagoId,
      añoAcademico:   row.añoAcademico,
      colegioNivelId: row.colegioNivelId,
      monto:          toNum(row.monto),
      createdAt:      row.createdAt,
      updatedAt:      row.updatedAt,
    });
  }

  static toCuotaDomain(row: CuotaAlumnoPrisma): CuotaAlumno {
    return CuotaAlumno.reconstitute({
      id:               row.id,
      alumnoId:         row.alumnoId,
      conceptoPagoId:   row.conceptoPagoId,
      añoAcademico:     row.añoAcademico,
      mes:              row.mes,
      descripcion:      row.descripcion,
      monto:            toNum(row.monto),
      montoPagado:      toNum(row.montoPagado),
      fechaVencimiento: row.fechaVencimiento,
      estado:           row.estado as any,
      createdAt:        row.createdAt,
      updatedAt:        row.updatedAt,
    });
  }

  static toPagoDomain(row: PagoPrisma): Pago {
    return Pago.reconstitute({
      id:              row.id,
      cuotaId:         row.cuotaId,
      colegioId:       row.colegioId,
      alumnoId:        row.alumnoId,
      registradoPorId: row.registradoPorId,
      monto:           toNum(row.monto),
      metodoPago:      row.metodoPago as any,
      referencia:      row.referencia,
      observacion:     row.observacion,
      estado:          row.estado as any,
      motivoAnulacion: row.motivoAnulacion,
      createdAt:       row.createdAt,
      updatedAt:       row.updatedAt,
    });
  }
}
