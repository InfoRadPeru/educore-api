import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  DocenteRepository,
  CrearDocenteConPersonaProps,
  ActualizarDocenteProps,
  AsignarSeccionProps,
} from '../../domain/repositories/docente.repository';
import { Docente, DocenteAsignacion, EstadoDocente } from '../../domain/entities/docente.entity';
import { DocenteMapper } from './docente.mapper';

const INCLUDE_PERSONA = {
  persona: {
    select: {
      dni: true, nombres: true, apellidos: true, telefono: true,
      usuario: { select: { id: true } },
    },
  },
} as const;

const INCLUDE_ASIGNATURA = {
  colegioAsignatura: {
    select: {
      nombre: true,
      asignaturaMaestra: { select: { nombre: true } },
    },
  },
} as const;

@Injectable()
export class PrismaDocenteRepository implements DocenteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crearConPersona(props: CrearDocenteConPersonaProps): Promise<Docente> {
    // Usar relaciones en lugar de escalares para que Prisma resuelva CreateInput (no UncheckedCreateInput)
    const raw = await this.prisma.perfilDocente.create({
      data: {
        colegio:     { connect: { id: props.colegioId } },
        ...(props.sedeId ? { sede: { connect: { id: props.sedeId } } } : {}),
        especialidad: props.especialidad ?? null,
        persona: {
          connectOrCreate: {
            where:  { dni: props.dni },
            create: {
              dni:       props.dni,
              nombres:   props.nombres,
              apellidos: props.apellidos,
              fechaNac:  props.fechaNac,
              genero:    props.genero,
              telefono:  props.telefono ?? null,
            },
          },
        },
      },
      include: INCLUDE_PERSONA,
    });
    return DocenteMapper.toDomain(raw);
  }

  async buscarPorId(id: string): Promise<Docente | null> {
    const raw = await this.prisma.perfilDocente.findUnique({
      where:   { id },
      include: INCLUDE_PERSONA,
    });
    return raw ? DocenteMapper.toDomain(raw) : null;
  }

  async buscarPorDni(dni: string, colegioId: string): Promise<Docente | null> {
    const raw = await this.prisma.perfilDocente.findFirst({
      where:   { colegioId, persona: { dni } },
      include: INCLUDE_PERSONA,
    });
    return raw ? DocenteMapper.toDomain(raw) : null;
  }

  async listarPorColegio(colegioId: string, estado?: EstadoDocente): Promise<Docente[]> {
    const rows = await this.prisma.perfilDocente.findMany({
      where:   { colegioId, ...(estado ? { estado } : {}) },
      include: INCLUDE_PERSONA,
      orderBy: { persona: { apellidos: 'asc' } },
    });
    return rows.map(DocenteMapper.toDomain);
  }

  async actualizar(id: string, props: ActualizarDocenteProps): Promise<Docente> {
    const raw = await this.prisma.perfilDocente.update({
      where:   { id },
      data:    { sedeId: props.sedeId, especialidad: props.especialidad },
      include: INCLUDE_PERSONA,
    });
    return DocenteMapper.toDomain(raw);
  }

  async cambiarEstado(id: string, estado: EstadoDocente): Promise<Docente> {
    const raw = await this.prisma.perfilDocente.update({
      where:   { id },
      data:    { estado },
      include: INCLUDE_PERSONA,
    });
    return DocenteMapper.toDomain(raw);
  }

  async asignarSeccion(props: AsignarSeccionProps): Promise<DocenteAsignacion> {
    const raw = await this.prisma.docenteAsignacion.create({
      data:    props,
      include: INCLUDE_ASIGNATURA,
    });
    return DocenteMapper.asignacionToDomain(raw);
  }

  async removerAsignacion(id: string): Promise<void> {
    await this.prisma.docenteAsignacion.delete({ where: { id } });
  }

  async buscarAsignacion(id: string): Promise<DocenteAsignacion | null> {
    const raw = await this.prisma.docenteAsignacion.findUnique({
      where:   { id },
      include: INCLUDE_ASIGNATURA,
    });
    return raw ? DocenteMapper.asignacionToDomain(raw) : null;
  }

  async listarAsignaciones(docenteId: string, año?: number): Promise<DocenteAsignacion[]> {
    const rows = await this.prisma.docenteAsignacion.findMany({
      where:   { docenteId, ...(año ? { añoAcademico: año } : {}) },
      include: INCLUDE_ASIGNATURA,
      orderBy: { añoAcademico: 'desc' },
    });
    return rows.map(DocenteMapper.asignacionToDomain);
  }

  async existeAsignacion(
    docenteId: string, seccionId: string, colegioAsignaturaId: string, año: number,
  ): Promise<boolean> {
    const count = await this.prisma.docenteAsignacion.count({
      where: { docenteId, seccionId, colegioAsignaturaId, añoAcademico: año },
    });
    return count > 0;
  }

  async esTutorEnColegio(docenteId: string, colegioId: string, año: number): Promise<boolean> {
    const count = await this.prisma.docenteAsignacion.count({
      where: {
        docenteId,
        esTutor: true,
        añoAcademico: año,
        docente: { colegioId },
      },
    });
    return count > 0;
  }

  async existeTutorEnSeccion(seccionId: string, año: number): Promise<boolean> {
    const count = await this.prisma.docenteAsignacion.count({
      where: { seccionId, esTutor: true, añoAcademico: año },
    });
    return count > 0;
  }
}
