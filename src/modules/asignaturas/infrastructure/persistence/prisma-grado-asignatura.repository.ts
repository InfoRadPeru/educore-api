import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GradoAsignaturaRepository } from '../../domain/repositories/grado-asignatura.repository';
import { GradoAsignatura } from '../../domain/entities/grado-asignatura.entity';
import { AsignaturaMapper } from './asignatura.mapper';

const INCLUDE_NOMBRE = {
  colegioAsignatura: { include: { asignaturaMaestra: { select: { nombre: true } } } },
} as const;

@Injectable()
export class PrismaGradoAsignaturaRepository implements GradoAsignaturaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarPorGrado(colegioGradoId: string): Promise<GradoAsignatura[]> {
    const rows = await this.prisma.gradoAsignatura.findMany({
      where:   { colegioGradoId },
      include: INCLUDE_NOMBRE,
      orderBy: { colegioAsignatura: { asignaturaMaestra: { nombre: 'asc' } } },
    });
    return rows.map(AsignaturaMapper.gradoToDomain);
  }

  async buscarPorId(id: string): Promise<GradoAsignatura | null> {
    const raw = await this.prisma.gradoAsignatura.findUnique({
      where:   { id },
      include: INCLUDE_NOMBRE,
    });
    return raw ? AsignaturaMapper.gradoToDomain(raw) : null;
  }

  async asignar(
    colegioGradoId: string,
    colegioAsignaturaId: string,
    horasSemanales?: number,
  ): Promise<GradoAsignatura> {
    const raw = await this.prisma.gradoAsignatura.create({
      data:    { colegioGradoId, colegioAsignaturaId, horasSemanales: horasSemanales ?? null },
      include: INCLUDE_NOMBRE,
    });
    return AsignaturaMapper.gradoToDomain(raw);
  }

  async actualizar(id: string, horasSemanales: number | null): Promise<GradoAsignatura> {
    const raw = await this.prisma.gradoAsignatura.update({
      where:   { id },
      data:    { horasSemanales },
      include: INCLUDE_NOMBRE,
    });
    return AsignaturaMapper.gradoToDomain(raw);
  }

  async remover(id: string): Promise<void> {
    await this.prisma.gradoAsignatura.delete({ where: { id } });
  }

  async existeEnGrado(colegioGradoId: string, colegioAsignaturaId: string): Promise<boolean> {
    const count = await this.prisma.gradoAsignatura.count({
      where: { colegioGradoId, colegioAsignaturaId },
    });
    return count > 0;
  }
}
