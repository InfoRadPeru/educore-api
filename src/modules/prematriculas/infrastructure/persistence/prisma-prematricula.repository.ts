import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Prematricula, EstadoPrematricula } from '../../domain/entities/prematricula.entity';
import { ActualizarPrematriculaProps, CrearPrematriculaProps, PrematriculaRepository } from '../../domain/repositories/prematricula.repository';
import { PrematriculaMapper } from './prematricula.mapper';

@Injectable()
export class PrismaPrematriculaRepository implements PrematriculaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearPrematriculaProps): Promise<Prematricula> {
    const raw = await this.prisma.prematricula.create({
      data: {
        colegioId: props.colegioId, alumnoId: props.alumnoId,
        colegioNivelId: props.colegioNivelId, seccionId: props.seccionId ?? null,
        añoAcademico: props.añoAcademico, observaciones: props.observaciones ?? null,
      },
    });
    return PrematriculaMapper.toDomain(raw);
  }

  async buscarPorId(id: string): Promise<Prematricula | null> {
    const raw = await this.prisma.prematricula.findUnique({ where: { id } });
    return raw ? PrematriculaMapper.toDomain(raw) : null;
  }

  async listarPorColegio(colegioId: string, estado?: EstadoPrematricula): Promise<Prematricula[]> {
    const raw = await this.prisma.prematricula.findMany({
      where: { colegioId, ...(estado ? { estado: estado as any } : {}) },
      orderBy: { createdAt: 'desc' },
    });
    return raw.map(r => PrematriculaMapper.toDomain(r));
  }

  async listarPorAlumno(alumnoId: string): Promise<Prematricula[]> {
    const raw = await this.prisma.prematricula.findMany({
      where: { alumnoId },
      orderBy: { createdAt: 'desc' },
    });
    return raw.map(r => PrematriculaMapper.toDomain(r));
  }

  async actualizar(id: string, props: ActualizarPrematriculaProps): Promise<Prematricula> {
    const raw = await this.prisma.prematricula.update({
      where: { id },
      data: {
        ...(props.estado        !== undefined && { estado: props.estado as any }),
        ...(props.seccionId     !== undefined && { seccionId: props.seccionId }),
        ...(props.observaciones !== undefined && { observaciones: props.observaciones }),
        ...(props.matriculaId   !== undefined && { matriculaId: props.matriculaId }),
      },
    });
    return PrematriculaMapper.toDomain(raw);
  }
}
