// Qué es: Implementación concreta del ColegioRepository usando Prisma.
// Patrón: Repository Pattern — Domain define el contrato, Infrastructure lo implementa.
// Principio SOLID: Dependency Inversion — los use cases nunca importan este archivo directamente.
// Por qué upsert en configuracion: La configuración se crea junto al colegio en register.
// Si por alguna razón no existe, upsert la crea. Sin errores inesperados.

import { Colegio, EstadoColegio, PlanColegio } from "@modules/colegios/domain/entities/colegio.entity";
import { ActualizarColegioProps, ActualizarConfiguracionProps, ColegioConfiguracion, ColegioRepository } from "@modules/colegios/domain/repositories/colegio.repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/infrastructure/prisma/prisma.service";
import { ColegioMapper } from "./colegio.mapper";
import { Sede } from "@modules/colegios/domain/entities/sede.entity";
import { Nivel } from "@modules/colegios/domain/entities/nivel.entity";


// Include reutilizable para ColegioNivel con sus relaciones
const INCLUDE_NIVEL = {
  nivelMaestro: true,
  turnos:       true,
} as const;

@Injectable()
export class PrismaColegioRepository implements ColegioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<Colegio | null> {
    const raw = await this.prisma.colegio.findUnique({ where: { id } });
    return raw ? ColegioMapper.toDomain(raw) : null;
  }

  async buscarTodos(): Promise<Colegio[]> {
    const rows = await this.prisma.colegio.findMany({ orderBy: { createdAt: 'desc' } });
    return rows.map(ColegioMapper.toDomain);
  }

  async actualizar(id: string, props: ActualizarColegioProps): Promise<Colegio> {
    const raw = await this.prisma.colegio.update({
      where: { id },
      data: {
        ...(props.direccion !== undefined && { direccion: props.direccion }),
        ...(props.telefono  !== undefined && { telefono:  props.telefono  }),
        ...(props.email     !== undefined && { email:     props.email     }),
      },
    });
    return ColegioMapper.toDomain(raw);
  }

  async cambiarEstado(id: string, estado: EstadoColegio): Promise<Colegio> {
    const raw = await this.prisma.colegio.update({
      where: { id },
      data:  { estado: estado as any },
    });
    return ColegioMapper.toDomain(raw);
  }

  async cambiarPlan(id: string, plan: PlanColegio): Promise<Colegio> {
    const raw = await this.prisma.colegio.update({
      where: { id },
      data:  { plan: plan as any },
    });
    return ColegioMapper.toDomain(raw);
  }

  async buscarConfiguracion(colegioId: string): Promise<ColegioConfiguracion | null> {
    const raw = await this.prisma.colegioConfiguracion.findUnique({ where: { colegioId } });
    if (!raw) return null;
    return {
      id:              raw.id,
      logoUrl:         raw.logoUrl,
      colorPrimario:   raw.colorPrimario,
      colorSecundario: raw.colorSecundario,
      periodo:         raw.periodo,
      zonaHoraria:     raw.zonaHoraria,
      moneda:          raw.moneda,
      notaMinima:      raw.notaMinima,
      notaMaxima:      raw.notaMaxima,
      notaAprobatoria: raw.notaAprobatoria,
      decimalesNota:   raw.decimalesNota,
    };
  }

  async actualizarConfiguracion(colegioId: string, props: ActualizarConfiguracionProps): Promise<ColegioConfiguracion> {
    const raw = await this.prisma.colegioConfiguracion.upsert({
      where:  { colegioId },
      create: {
        colegioId,
        logoUrl:         props.logoUrl,
        colorPrimario:   props.colorPrimario,
        colorSecundario: props.colorSecundario,
        periodo:         props.periodo as any,
        zonaHoraria:     props.zonaHoraria ?? 'America/Lima',
        moneda:          props.moneda      ?? 'PEN',
      },
      update: {
        ...(props.logoUrl         !== undefined && { logoUrl:         props.logoUrl         }),
        ...(props.colorPrimario   !== undefined && { colorPrimario:   props.colorPrimario   }),
        ...(props.colorSecundario !== undefined && { colorSecundario: props.colorSecundario }),
        ...(props.periodo         !== undefined && { periodo:         props.periodo as any  }),
        ...(props.zonaHoraria     !== undefined && { zonaHoraria:     props.zonaHoraria     }),
        ...(props.moneda          !== undefined && { moneda:          props.moneda          }),
      },
    });
    return {
      id:              raw.id,
      logoUrl:         raw.logoUrl,
      colorPrimario:   raw.colorPrimario,
      colorSecundario: raw.colorSecundario,
      periodo:         raw.periodo,
      zonaHoraria:     raw.zonaHoraria,
      moneda:          raw.moneda,
      notaMinima:      raw.notaMinima,
      notaMaxima:      raw.notaMaxima,
      notaAprobatoria: raw.notaAprobatoria,
      decimalesNota:   raw.decimalesNota,
    };
  }
}