import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ApoderadoRepository,
  CrearApoderadoConPersonaProps,
  CrearApoderadoProps,
} from '../../domain/repositories/apoderado.repository';
import { Apoderado, TipoParentesco, VinculoAlumno } from '../../domain/entities/apoderado.entity';
import { ApoderadoMapper } from './apoderado.mapper';

const INCLUDE_PERSONA = {
  persona: {
    select: {
      dni: true, nombres: true, apellidos: true, telefono: true,
      usuario: { select: { id: true } },
    },
  },
} as const;

@Injectable()
export class PrismaApoderadoRepository implements ApoderadoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearApoderadoProps): Promise<Apoderado> {
    const raw = await this.prisma.perfilApoderado.create({
      data:    { personaId: props.personaId },
      include: INCLUDE_PERSONA,
    });
    return ApoderadoMapper.toDomain(raw);
  }

  async crearConPersona(props: CrearApoderadoConPersonaProps): Promise<Apoderado> {
    const raw = await this.prisma.perfilApoderado.create({
      data: {
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
    return ApoderadoMapper.toDomain(raw);
  }

  async buscarPorDni(dni: string): Promise<Apoderado | null> {
    const raw = await this.prisma.perfilApoderado.findFirst({
      where:   { persona: { dni } },
      include: INCLUDE_PERSONA,
    });
    return raw ? ApoderadoMapper.toDomain(raw) : null;
  }

  async buscarPorId(id: string): Promise<Apoderado | null> {
    const raw = await this.prisma.perfilApoderado.findUnique({
      where:   { id },
      include: INCLUDE_PERSONA,
    });
    return raw ? ApoderadoMapper.toDomain(raw) : null;
  }

  async buscarPorPersonaId(personaId: string): Promise<Apoderado | null> {
    const raw = await this.prisma.perfilApoderado.findUnique({
      where:   { personaId },
      include: INCLUDE_PERSONA,
    });
    return raw ? ApoderadoMapper.toDomain(raw) : null;
  }

  async listarPorAlumno(alumnoId: string): Promise<Array<Apoderado & { parentesco: TipoParentesco }>> {
    const vinculos = await this.prisma.apoderadoAlumno.findMany({
      where:   { alumnoId },
      include: { apoderado: { include: INCLUDE_PERSONA } },
    });
    return vinculos.map(v => {
      const apoderado = ApoderadoMapper.toDomain(v.apoderado);
      return Object.assign(apoderado, { parentesco: v.parentesco as TipoParentesco });
    });
  }

  async listarPorColegio(colegioId: string): Promise<Apoderado[]> {
    // Apoderados vinculados a alumnos de ese colegio (distinct)
    const rows = await this.prisma.perfilApoderado.findMany({
      where: {
        alumnos: {
          some: { alumno: { colegioId } },
        },
      },
      include:  INCLUDE_PERSONA,
      distinct: ['id'],
    });
    return rows.map(ApoderadoMapper.toDomain);
  }

  async asignarAlumno(apoderadoId: string, alumnoId: string, parentesco: TipoParentesco): Promise<VinculoAlumno> {
    const raw = await this.prisma.apoderadoAlumno.create({
      data: { apoderadoId, alumnoId, parentesco },
    });
    return { alumnoId: raw.alumnoId, parentesco: raw.parentesco as TipoParentesco };
  }

  async desvincularAlumno(apoderadoId: string, alumnoId: string): Promise<void> {
    await this.prisma.apoderadoAlumno.deleteMany({
      where: { apoderadoId, alumnoId },
    });
  }

  async contarVinculosPorAlumno(alumnoId: string): Promise<number> {
    return this.prisma.apoderadoAlumno.count({ where: { alumnoId } });
  }

  async existeVinculo(apoderadoId: string, alumnoId: string): Promise<boolean> {
    const count = await this.prisma.apoderadoAlumno.count({
      where: { apoderadoId, alumnoId },
    });
    return count > 0;
  }

  async existeParentescoPorAlumno(alumnoId: string, parentesco: TipoParentesco): Promise<boolean> {
    const count = await this.prisma.apoderadoAlumno.count({
      where: { alumnoId, parentesco },
    });
    return count > 0;
  }
}
