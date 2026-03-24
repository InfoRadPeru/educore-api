import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { Matricula, EstadoMatricula } from '../../domain/entities/matricula.entity';
import { CrearMatriculaProps, MatriculaRepository } from '../../domain/repositories/matricula.repository';
import { MatriculaMapper } from './matricula.mapper';

@Injectable()
export class PrismaMatriculaRepository implements MatriculaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearMatriculaProps): Promise<Matricula> {
    const raw = await this.prisma.matricula.create({
      data: {
        perfilAlumnoId: props.perfilAlumnoId,
        seccionId:      props.seccionId,
        añoAcademico:   props.añoAcademico,
        estado:         (props.estado ?? 'NUEVA_MATRICULA') as any,
        observaciones:  props.observaciones ?? null,
      },
    });
    return MatriculaMapper.toDomain(raw);
  }

  async buscarPorId(id: string): Promise<Matricula | null> {
    const raw = await this.prisma.matricula.findUnique({ where: { id } });
    return raw ? MatriculaMapper.toDomain(raw) : null;
  }

  async listarPorAlumno(perfilAlumnoId: string): Promise<Matricula[]> {
    const raw = await this.prisma.matricula.findMany({
      where:   { perfilAlumnoId },
      orderBy: { añoAcademico: 'desc' },
    });
    return raw.map(r => MatriculaMapper.toDomain(r));
  }

  async listarPorSeccion(seccionId: string, añoAcademico: number): Promise<Matricula[]> {
    const raw = await this.prisma.matricula.findMany({
      where:   { seccionId, añoAcademico },
      orderBy: { createdAt: 'asc' },
    });
    return raw.map(r => MatriculaMapper.toDomain(r));
  }

  async cambiarEstado(id: string, estado: EstadoMatricula, observaciones?: string): Promise<Matricula> {
    const raw = await this.prisma.matricula.update({
      where: { id },
      data: {
        estado: estado as any,
        ...(observaciones !== undefined && { observaciones }),
      },
    });
    return MatriculaMapper.toDomain(raw);
  }

  async existeMatriculaActiva(perfilAlumnoId: string, añoAcademico: number): Promise<boolean> {
    const count = await this.prisma.matricula.count({
      where: {
        perfilAlumnoId,
        añoAcademico,
        estado: { notIn: ['EXPULSADO', 'CAMBIO_DE_COLEGIO'] as any[] },
      },
    });
    return count > 0;
  }
}
