import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Alumno, EstadoAlumno } from '../../domain/entities/alumno.entity';
import { ActualizarAlumnoProps, AlumnoRepository, CrearAlumnoProps } from '../../domain/repositories/alumno.repository';
import { AlumnoMapper } from './alumno.mapper';

const INCLUDE_PERSONA = {
  persona: {
    select: { id: true, dni: true, nombres: true, apellidos: true, fechaNac: true, genero: true, telefono: true, direccion: true },
  },
} as const;

@Injectable()
export class PrismaAlumnoRepository implements AlumnoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearAlumnoProps): Promise<Alumno> {
    const raw = await this.prisma.perfilAlumno.create({
      data: {
        codigoMatricula:  props.codigoMatricula,
        colegioOrigenRef: props.colegioOrigenRef ?? null,
        // Relaciones via connect/create para usar PerfilAlumnoCreateInput (no el Unchecked)
        colegio: { connect: { id: props.colegioId } },
        persona: {
          create: {
            dni:       props.dni,
            nombres:   props.nombres,
            apellidos: props.apellidos,
            fechaNac:  props.fechaNac,
            genero:    props.genero as any,
            telefono:  props.telefono ?? null,
            direccion: props.direccion ?? null,
          },
        },
      },
      include: INCLUDE_PERSONA,
    });
    return AlumnoMapper.toDomain(raw);
  }

  async buscarPorId(id: string): Promise<Alumno | null> {
    const raw = await this.prisma.perfilAlumno.findUnique({ where: { id }, include: INCLUDE_PERSONA });
    return raw ? AlumnoMapper.toDomain(raw) : null;
  }

  async buscarPorDni(dni: string, colegioId: string): Promise<Alumno | null> {
    const raw = await this.prisma.perfilAlumno.findFirst({
      where: { colegioId, persona: { dni } },
      include: INCLUDE_PERSONA,
    });
    return raw ? AlumnoMapper.toDomain(raw) : null;
  }

  async listarPorColegio(colegioId: string, estado?: EstadoAlumno): Promise<Alumno[]> {
    const raw = await this.prisma.perfilAlumno.findMany({
      where: { colegioId, ...(estado ? { estado: estado as any } : {}) },
      include: INCLUDE_PERSONA,
      orderBy: { persona: { apellidos: 'asc' } },
    });
    return raw.map(r => AlumnoMapper.toDomain(r));
  }

  async actualizar(id: string, props: ActualizarAlumnoProps): Promise<Alumno> {
    const raw = await this.prisma.perfilAlumno.update({
      where: { id },
      data: {
        ...(props.colegioOrigenRef !== undefined && { colegioOrigenRef: props.colegioOrigenRef }),
        persona: {
          update: {
            ...(props.nombres    !== undefined && { nombres: props.nombres }),
            ...(props.apellidos  !== undefined && { apellidos: props.apellidos }),
            ...(props.fechaNac   !== undefined && { fechaNac: props.fechaNac }),
            ...(props.genero     !== undefined && { genero: props.genero as any }),
            ...(props.telefono   !== undefined && { telefono: props.telefono }),
            ...(props.direccion  !== undefined && { direccion: props.direccion }),
          },
        },
      },
      include: INCLUDE_PERSONA,
    });
    return AlumnoMapper.toDomain(raw);
  }

  async cambiarEstado(id: string, estado: EstadoAlumno): Promise<Alumno> {
    const raw = await this.prisma.perfilAlumno.update({
      where: { id },
      data:  { estado: estado as any },
      include: INCLUDE_PERSONA,
    });
    return AlumnoMapper.toDomain(raw);
  }
}
