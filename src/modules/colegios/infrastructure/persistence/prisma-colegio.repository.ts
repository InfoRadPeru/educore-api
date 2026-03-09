// Qué es: Implementación concreta del ColegioRepository usando Prisma.
// Patrón: Repository Pattern — Domain define el contrato, Infrastructure lo implementa.
// Principio SOLID: Dependency Inversion — los use cases nunca importan este archivo directamente.
// Por qué upsert en configuracion: La configuración se crea junto al colegio en register.
// Si por alguna razón no existe, upsert la crea. Sin errores inesperados.

import { Colegio } from "@modules/colegios/domain/entities/colegio.entity";
import { ActualizarColegioProps, ActualizarConfiguracionProps, ActualizarSedeProps, ColegioConfiguracion, ColegioRepository, CrearSedeProps, PlanInfo } from "@modules/colegios/domain/repositories/colegio.repository";
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

  // ─── Colegio ───────────────────────────────────────────────────────────────

  async findById(id: string): Promise<Colegio | null> {
    const raw = await this.prisma.colegio.findUnique({ where: { id } });
    return raw ? ColegioMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Colegio[]> {
    const rows = await this.prisma.colegio.findMany({
      orderBy: { createdAt: 'desc' },
    });
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

  async cambiarEstado(id: string, estado: string): Promise<Colegio> {
    const raw = await this.prisma.colegio.update({
      where: { id },
      data:  { estado: estado as any },
    });
    return ColegioMapper.toDomain(raw);
  }

  async cambiarPlan(id: string, plan: string): Promise<Colegio> {
    const raw = await this.prisma.colegio.update({
      where: { id },
      data:  { plan: plan as any },
    });
    return ColegioMapper.toDomain(raw);
  }

  // ─── Configuración ─────────────────────────────────────────────────────────

  async findConfiguracion(colegioId: string): Promise<ColegioConfiguracion | null> {
    const raw = await this.prisma.colegioConfiguracion.findUnique({
      where: { colegioId },
    });
    if (!raw) return null;
    return {
      id:              raw.id,
      logoUrl:         raw.logoUrl,
      colorPrimario:   raw.colorPrimario,
      colorSecundario: raw.colorSecundario,
      periodo:         raw.periodo,
      zonaHoraria:     raw.zonaHoraria,
      moneda:          raw.moneda,
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
    };
  }

  // ─── Plan ──────────────────────────────────────────────────────────────────

  async findPlanInfo(colegioId: string): Promise<PlanInfo> {
    const colegio = await this.prisma.colegio.findUniqueOrThrow({ where: { id: colegioId } });
    const entity  = ColegioMapper.toDomain(colegio);
    const sedesActivas = await this.contarSedesActivas(colegioId);

    return {
      plan:                    colegio.plan,
      planVenceEn:             colegio.planVenceEn,
      limitesSedes:            entity.limitesSedes(),
      sedesActivas,
      limitesSeccionesPorGrado: entity.limitesSeccionesPorGrado(),
      planSugerido:            entity.planSugerido(),
    };
  }

  // ─── Sedes ─────────────────────────────────────────────────────────────────

  async findSedes(colegioId: string): Promise<Sede[]> {
    const rows = await this.prisma.sede.findMany({
      where:   { colegioId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(ColegioMapper.sedeToDomain);
  }

  async findSedeById(id: string, colegioId: string): Promise<Sede | null> {
    const raw = await this.prisma.sede.findFirst({
      where: { id, colegioId },
    });
    return raw ? ColegioMapper.sedeToDomain(raw) : null;
  }

  async contarSedesActivas(colegioId: string): Promise<number> {
    return this.prisma.sede.count({
      where: { colegioId, activo: true },
    });
  }

  async crearSede(props: CrearSedeProps): Promise<Sede> {
    const raw = await this.prisma.sede.create({
      data: {
        colegioId: props.colegioId,
        nombre:    props.nombre,
        direccion: props.direccion,
        telefono:  props.telefono,
        email:     props.email,
      },
    });
    return ColegioMapper.sedeToDomain(raw);
  }

  async actualizarSede(id: string, props: ActualizarSedeProps): Promise<Sede> {
    const raw = await this.prisma.sede.update({
      where: { id },
      data: {
        ...(props.nombre    !== undefined && { nombre:    props.nombre    }),
        ...(props.direccion !== undefined && { direccion: props.direccion }),
        ...(props.telefono  !== undefined && { telefono:  props.telefono  }),
        ...(props.email     !== undefined && { email:     props.email     }),
      },
    });
    return ColegioMapper.sedeToDomain(raw);
  }

  async cambiarEstadoSede(id: string, activo: boolean): Promise<Sede> {
    const raw = await this.prisma.sede.update({
      where: { id },
      data:  { activo },
    });
    return ColegioMapper.sedeToDomain(raw);
  }

  // ─── Niveles ───────────────────────────────────────────────────────────────

  async findNiveles(colegioId: string): Promise<Nivel[]> {
    // Trae todos los niveles maestros activos y combina con el estado de activación del colegio
    const maestros = await this.prisma.nivelMaestro.findMany({
      where:   { activo: true },
      orderBy: { orden: 'asc' },
      include: {
        colegioNiveles: {
          where:   { colegioId },
          include: INCLUDE_NIVEL,
        },
      },
    });

    return maestros.map(maestro => {
      const colegioNivel = maestro.colegioNiveles[0];
      // Si el colegio aún no activó este nivel, retorna como inactivo
      if (!colegioNivel) {
        return Nivel.reconstitute({
          id:             '',
          nivelMaestroId: maestro.id,
          nombre:         maestro.nombre,
          orden:          maestro.orden,
          activo:         false,
          turnos:         [],
        });
      }
      return ColegioMapper.nivelToDomain(colegioNivel as any);
    });
  }

  async findNivelById(nivelMaestroId: string, colegioId: string): Promise<Nivel | null> {
    const raw = await this.prisma.colegioNivel.findUnique({
      where:   { colegioId_nivelMaestroId: { colegioId, nivelMaestroId } },
      include: INCLUDE_NIVEL,
    });
    return raw ? ColegioMapper.nivelToDomain(raw as any) : null;
  }

  async cambiarEstadoNivel(id: string, activo: boolean): Promise<Nivel> {
    const raw = await this.prisma.colegioNivel.update({
      where:   { id },
      data:    { activo },
      include: INCLUDE_NIVEL,
    });
    return ColegioMapper.nivelToDomain(raw as any);
  }

  async activarNivel(colegioId: string, nivelMaestroId: string): Promise<Nivel> {
    const raw = await this.prisma.colegioNivel.create({
      data: {
        colegioId,
        nivelMaestroId,
        activo: true,
      },
      include: INCLUDE_NIVEL,
    });
    return ColegioMapper.nivelToDomain(raw as any);
  }
}