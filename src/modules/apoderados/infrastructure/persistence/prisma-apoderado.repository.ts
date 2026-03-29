import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  ApoderadoRepository,
  CrearApoderadoConAccesoProps,
  CrearApoderadoConPersonaProps,
  CrearApoderadoProps,
  CrearApoderadoResult,
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
      data:    { personaId: props.personaId, colegioId: props.colegioId },
      include: INCLUDE_PERSONA,
    });
    return ApoderadoMapper.toDomain(raw);
  }

  async crearConPersona(props: CrearApoderadoConPersonaProps): Promise<Apoderado> {
    const raw = await this.prisma.perfilApoderado.create({
      data: {
        // Usar forma de relación (no FK directa) para poder combinar con persona.connectOrCreate
        colegio: { connect: { id: props.colegioId } },
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

  async crearConPersonaYAcceso(props: CrearApoderadoConAccesoProps): Promise<CrearApoderadoResult> {
    return this.prisma.$transaction(async (tx) => {
      // Paso 1: Obtener o crear Persona
      let persona = await tx.persona.findUnique({ where: { dni: props.dni } });
      if (!persona) {
        persona = await tx.persona.create({
          data: {
            dni:       props.dni,
            nombres:   props.nombres,
            apellidos: props.apellidos,
            fechaNac:  props.fechaNac,
            genero:    props.genero,
            telefono:  props.telefono ?? null,
          },
        });
      }

      // Paso 2: Crear PerfilApoderado vinculado a la Persona y al Colegio
      const raw = await tx.perfilApoderado.create({
        data:    { personaId: persona.id, colegioId: props.colegioId },
        include: INCLUDE_PERSONA,
      });

      // Paso 3: Crear Usuario solo si la Persona aún no tiene uno
      const usuarioExistente = await tx.usuario.findUnique({ where: { personaId: persona.id } });
      let usuarioCreado = false;
      if (!usuarioExistente) {
        await tx.usuario.create({
          data: {
            personaId:    persona.id,
            email:        `${props.dni}@apoderado.local`,
            username:     props.dni,
            passwordHash: props.passwordHash,
          },
        });
        usuarioCreado = true;
      }

      return { apoderado: ApoderadoMapper.toDomain(raw), usuarioCreado };
    });
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
    const rows = await this.prisma.perfilApoderado.findMany({
      where:   { colegioId },
      include: INCLUDE_PERSONA,
      orderBy: { createdAt: 'desc' },
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
