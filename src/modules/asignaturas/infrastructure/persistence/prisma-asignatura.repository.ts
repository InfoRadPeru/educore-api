import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  AsignaturaMaestraRepository,
  CrearAsignaturaMaestraProps,
  ActualizarAsignaturaMaestraProps,
} from '../../domain/repositories/asignatura-maestra.repository';
import { ColegioAsignaturaRepository } from '../../domain/repositories/colegio-asignatura.repository';
import { AsignaturaMaestra, ColegioAsignatura } from '../../domain/entities/asignatura.entity';
import { AsignaturaMapper } from './asignatura.mapper';

const INCLUDE_MAESTRA = { asignaturaMaestra: { select: { nombre: true } } } as const;

@Injectable()
export class PrismaAsignaturaMaestraRepository implements AsignaturaMaestraRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listar(soloActivas = false): Promise<AsignaturaMaestra[]> {
    const rows = await this.prisma.asignaturaMaestra.findMany({
      where:   soloActivas ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    });
    return rows.map(AsignaturaMapper.maestraToDomain);
  }

  async buscarPorId(id: string): Promise<AsignaturaMaestra | null> {
    const raw = await this.prisma.asignaturaMaestra.findUnique({ where: { id } });
    return raw ? AsignaturaMapper.maestraToDomain(raw) : null;
  }

  async buscarPorNombre(nombre: string): Promise<AsignaturaMaestra | null> {
    const raw = await this.prisma.asignaturaMaestra.findUnique({ where: { nombre } });
    return raw ? AsignaturaMapper.maestraToDomain(raw) : null;
  }

  async crear(props: CrearAsignaturaMaestraProps): Promise<AsignaturaMaestra> {
    const raw = await this.prisma.asignaturaMaestra.create({
      data: { nombre: props.nombre, descripcion: props.descripcion ?? null },
    });
    return AsignaturaMapper.maestraToDomain(raw);
  }

  async actualizar(id: string, props: ActualizarAsignaturaMaestraProps): Promise<AsignaturaMaestra> {
    const raw = await this.prisma.asignaturaMaestra.update({
      where: { id },
      data:  {
        ...(props.nombre      !== undefined ? { nombre:      props.nombre      } : {}),
        ...(props.descripcion !== undefined ? { descripcion: props.descripcion } : {}),
      },
    });
    return AsignaturaMapper.maestraToDomain(raw);
  }

  async cambiarEstado(id: string, activo: boolean): Promise<AsignaturaMaestra> {
    const raw = await this.prisma.asignaturaMaestra.update({ where: { id }, data: { activo } });
    return AsignaturaMapper.maestraToDomain(raw);
  }
}

@Injectable()
export class PrismaColegioAsignaturaRepository implements ColegioAsignaturaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorColegio(colegioId: string, soloActivas = false): Promise<ColegioAsignatura[]> {
    const rows = await this.prisma.colegioAsignatura.findMany({
      where:   { colegioId, ...(soloActivas ? { activo: true } : {}) },
      include: INCLUDE_MAESTRA,
      orderBy: { asignaturaMaestra: { nombre: 'asc' } },
    });
    return rows.map(AsignaturaMapper.colegioToDomain);
  }

  async buscarPorId(id: string): Promise<ColegioAsignatura | null> {
    const raw = await this.prisma.colegioAsignatura.findUnique({
      where:   { id },
      include: INCLUDE_MAESTRA,
    });
    return raw ? AsignaturaMapper.colegioToDomain(raw) : null;
  }

  async activar(colegioId: string, asignaturaMaestraId: string): Promise<ColegioAsignatura> {
    const raw = await this.prisma.colegioAsignatura.upsert({
      where:   { colegioId_asignaturaMaestraId: { colegioId, asignaturaMaestraId } },
      create:  { colegioId, asignaturaMaestraId },
      update:  { activo: true },
      include: INCLUDE_MAESTRA,
    });
    return AsignaturaMapper.colegioToDomain(raw);
  }

  async renombrar(id: string, nombre: string | null): Promise<ColegioAsignatura> {
    const raw = await this.prisma.colegioAsignatura.update({
      where:   { id },
      data:    { nombre },
      include: INCLUDE_MAESTRA,
    });
    return AsignaturaMapper.colegioToDomain(raw);
  }

  async cambiarEstado(id: string, activo: boolean): Promise<ColegioAsignatura> {
    const raw = await this.prisma.colegioAsignatura.update({
      where:   { id },
      data:    { activo },
      include: INCLUDE_MAESTRA,
    });
    return AsignaturaMapper.colegioToDomain(raw);
  }

  async existeEnColegio(colegioId: string, asignaturaMaestraId: string): Promise<boolean> {
    const count = await this.prisma.colegioAsignatura.count({
      where: { colegioId, asignaturaMaestraId },
    });
    return count > 0;
  }
}
