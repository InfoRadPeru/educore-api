import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  TesoreriaRepository, CrearConceptoProps, ConfigurarTarifaProps,
  CrearCuotaProps, CrearPagoProps, MorosidadItem,
} from '../../domain/repositories/tesoreria.repository';
import { ConceptoPago } from '../../domain/entities/concepto-pago.entity';
import { TarifaConcepto } from '../../domain/entities/tarifa-concepto.entity';
import { CuotaAlumno, EstadoCuota } from '../../domain/entities/cuota-alumno.entity';
import { Pago } from '../../domain/entities/pago.entity';
import { TesoreriaMapper } from './tesoreria.mapper';

@Injectable()
export class PrismaTesoreriaRepository implements TesoreriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Conceptos ──────────────────────────────────────────────────────────────

  async crearConcepto(props: CrearConceptoProps): Promise<ConceptoPago> {
    const row = await this.prisma.conceptoPago.create({
      data: { colegioId: props.colegioId, nombre: props.nombre, tipo: props.tipo as any },
    });
    return TesoreriaMapper.toConceptoDomain(row);
  }

  async listarConceptos(colegioId: string): Promise<ConceptoPago[]> {
    const rows = await this.prisma.conceptoPago.findMany({
      where: { colegioId },
      orderBy: { nombre: 'asc' },
    });
    return rows.map(TesoreriaMapper.toConceptoDomain);
  }

  async buscarConceptoPorId(id: string): Promise<ConceptoPago | null> {
    const row = await this.prisma.conceptoPago.findUnique({ where: { id } });
    return row ? TesoreriaMapper.toConceptoDomain(row) : null;
  }

  async actualizarConcepto(
    id: string,
    props: Partial<{ nombre: string; activo: boolean }>,
  ): Promise<ConceptoPago> {
    const row = await this.prisma.conceptoPago.update({ where: { id }, data: props });
    return TesoreriaMapper.toConceptoDomain(row);
  }

  // ── Tarifas ────────────────────────────────────────────────────────────────

  async configurarTarifa(props: ConfigurarTarifaProps): Promise<TarifaConcepto> {
    const existing = await this.prisma.tarifaConcepto.findFirst({
      where: {
        conceptoPagoId: props.conceptoPagoId,
        añoAcademico:   props.añoAcademico,
        colegioNivelId: props.colegioNivelId ?? null,
      },
    });

    const row = existing
      ? await this.prisma.tarifaConcepto.update({ where: { id: existing.id }, data: { monto: props.monto } })
      : await this.prisma.tarifaConcepto.create({
          data: {
            conceptoPagoId: props.conceptoPagoId,
            añoAcademico:   props.añoAcademico,
            colegioNivelId: props.colegioNivelId ?? null,
            monto:          props.monto,
          },
        });

    return TesoreriaMapper.toTarifaDomain(row);
  }

  async listarTarifas(colegioId: string, añoAcademico: number): Promise<TarifaConcepto[]> {
    const rows = await this.prisma.tarifaConcepto.findMany({
      where: { conceptoPago: { colegioId }, añoAcademico },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(TesoreriaMapper.toTarifaDomain);
  }

  async buscarTarifa(
    conceptoPagoId: string,
    añoAcademico: number,
    colegioNivelId?: string,
  ): Promise<TarifaConcepto | null> {
    const row = await this.prisma.tarifaConcepto.findFirst({
      where: {
        conceptoPagoId,
        añoAcademico,
        colegioNivelId: colegioNivelId ?? null,
      },
    });
    return row ? TesoreriaMapper.toTarifaDomain(row) : null;
  }

  async eliminarTarifa(id: string): Promise<void> {
    await this.prisma.tarifaConcepto.delete({ where: { id } });
  }

  // ── Cuotas ─────────────────────────────────────────────────────────────────

  async crearCuotas(cuotas: CrearCuotaProps[]): Promise<CuotaAlumno[]> {
    return this.prisma.$transaction(async (tx) => {
      const creadas: CuotaAlumno[] = [];
      for (const c of cuotas) {
        const row = await tx.cuotaAlumno.create({
          data: {
            alumnoId:         c.alumnoId,
            conceptoPagoId:   c.conceptoPagoId,
            añoAcademico:     c.añoAcademico,
            mes:              c.mes ?? null,
            descripcion:      c.descripcion,
            monto:            c.monto,
            fechaVencimiento: c.fechaVencimiento,
          },
        });
        creadas.push(TesoreriaMapper.toCuotaDomain(row));
      }
      return creadas;
    });
  }

  async listarCuotasAlumno(alumnoId: string, añoAcademico: number): Promise<CuotaAlumno[]> {
    const rows = await this.prisma.cuotaAlumno.findMany({
      where: { alumnoId, añoAcademico },
      orderBy: [{ mes: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map(TesoreriaMapper.toCuotaDomain);
  }

  async buscarCuota(id: string): Promise<CuotaAlumno | null> {
    const row = await this.prisma.cuotaAlumno.findUnique({ where: { id } });
    return row ? TesoreriaMapper.toCuotaDomain(row) : null;
  }

  async actualizarCuota(
    id: string,
    props: Partial<{ montoPagado: number; estado: EstadoCuota }>,
  ): Promise<CuotaAlumno> {
    const row = await this.prisma.cuotaAlumno.update({ where: { id }, data: props as any });
    return TesoreriaMapper.toCuotaDomain(row);
  }

  async listarMorosidad(colegioId: string, añoAcademico: number, hoy: Date): Promise<MorosidadItem[]> {
    const cuotas = await this.prisma.cuotaAlumno.findMany({
      where: {
        añoAcademico,
        estado:           'VENCIDA',
        fechaVencimiento: { lt: hoy },
        alumno: { colegioId },
      },
      include: {
        alumno: { include: { persona: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
    });

    // Agrupar por alumno
    const mapa = new Map<string, MorosidadItem>();
    for (const cuota of cuotas) {
      const perfil  = cuota.alumno;
      const persona = perfil.persona;
      const key     = perfil.id;

      if (!mapa.has(key)) {
        mapa.set(key, {
          alumnoId:        perfil.id,
          nombres:         persona.nombres,
          apellidos:       persona.apellidos,
          codigoMatricula: perfil.codigoMatricula,
          cuotasVencidas:  0,
          montoDeuda:      0,
          cuotaMasAntigua: cuota.fechaVencimiento,
        });
      }

      const item = mapa.get(key)!;
      item.cuotasVencidas++;
      item.montoDeuda += Number(cuota.monto) - Number(cuota.montoPagado);
      if (cuota.fechaVencimiento < item.cuotaMasAntigua) {
        item.cuotaMasAntigua = cuota.fechaVencimiento;
      }
    }

    return [...mapa.values()].sort((a, b) => b.montoDeuda - a.montoDeuda);
  }

  // ── Pagos ──────────────────────────────────────────────────────────────────

  async crearPago(props: CrearPagoProps): Promise<Pago> {
    const row = await this.prisma.pago.create({
      data: {
        cuotaId:         props.cuotaId,
        colegioId:       props.colegioId,
        alumnoId:        props.alumnoId,
        registradoPorId: props.registradoPorId,
        monto:           props.monto,
        metodoPago:      props.metodoPago as any,
        referencia:      props.referencia ?? null,
        observacion:     props.observacion ?? null,
      },
    });
    return TesoreriaMapper.toPagoDomain(row);
  }

  async listarPagos(
    colegioId: string,
    filtros: { alumnoId?: string; añoAcademico?: number },
  ): Promise<Pago[]> {
    const rows = await this.prisma.pago.findMany({
      where: {
        colegioId,
        ...(filtros.alumnoId     ? { alumnoId: filtros.alumnoId }                                     : {}),
        ...(filtros.añoAcademico ? { cuota: { añoAcademico: { equals: filtros.añoAcademico } } }      : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(TesoreriaMapper.toPagoDomain);
  }

  async buscarPago(id: string): Promise<Pago | null> {
    const row = await this.prisma.pago.findUnique({ where: { id } });
    return row ? TesoreriaMapper.toPagoDomain(row) : null;
  }

  async anularPago(id: string, motivo: string): Promise<Pago> {
    const row = await this.prisma.pago.update({
      where: { id },
      data: { estado: 'ANULADO', motivoAnulacion: motivo },
    });
    return TesoreriaMapper.toPagoDomain(row);
  }

  // ── Resumen ────────────────────────────────────────────────────────────────

  async resumenFinanciero(
    colegioId: string,
    añoAcademico: number,
  ): Promise<{
    totalEsperado:   number;
    totalCobrado:    number;
    totalPendiente:  number;
    cuotasPorEstado: Record<EstadoCuota, number>;
  }> {
    const cuotas = await this.prisma.cuotaAlumno.findMany({
      where: { añoAcademico, alumno: { colegioId } },
      select: { monto: true, montoPagado: true, estado: true },
    });

    let totalEsperado  = 0;
    let totalCobrado   = 0;
    const porEstado: Record<string, number> = {
      PENDIENTE: 0, PAGADA: 0, VENCIDA: 0, ANULADA: 0,
    };

    for (const c of cuotas) {
      const monto      = Number(c.monto);
      const pagado     = Number(c.montoPagado);
      totalEsperado   += monto;
      totalCobrado    += pagado;
      porEstado[c.estado] = (porEstado[c.estado] ?? 0) + 1;
    }

    return {
      totalEsperado,
      totalCobrado,
      totalPendiente:  totalEsperado - totalCobrado,
      cuotasPorEstado: porEstado as Record<EstadoCuota, number>,
    };
  }
}
