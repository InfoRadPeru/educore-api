import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  PeriodoEvaluacionRepository,
  CrearPeriodoProps,
  ActualizarPeriodoProps,
} from '../../domain/repositories/periodo-evaluacion.repository';
import { PeriodoEvaluacion } from '../../domain/entities/periodo-evaluacion.entity';
import { AcademicoMapper } from './academico.mapper';

@Injectable()
export class PrismaPeriodoEvaluacionRepository implements PeriodoEvaluacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearPeriodoProps): Promise<PeriodoEvaluacion> {
    const raw = await this.prisma.periodoEvaluacion.create({ data: props });
    return AcademicoMapper.periodoToDomain(raw);
  }

  async buscarPorId(id: string): Promise<PeriodoEvaluacion | null> {
    const raw = await this.prisma.periodoEvaluacion.findUnique({ where: { id } });
    return raw ? AcademicoMapper.periodoToDomain(raw) : null;
  }

  async listarPorColegio(colegioId: string, año?: number): Promise<PeriodoEvaluacion[]> {
    const rows = await this.prisma.periodoEvaluacion.findMany({
      where:   { colegioId, ...(año !== undefined ? { añoAcademico: año } : {}) },
      orderBy: [{ añoAcademico: 'desc' }, { numero: 'asc' }],
    });
    return rows.map(AcademicoMapper.periodoToDomain);
  }

  async buscarPorNumeroYAño(colegioId: string, año: number, numero: number): Promise<PeriodoEvaluacion | null> {
    const raw = await this.prisma.periodoEvaluacion.findUnique({
      where: { colegioId_añoAcademico_numero: { colegioId, añoAcademico: año, numero } },
    });
    return raw ? AcademicoMapper.periodoToDomain(raw) : null;
  }

  async actualizar(id: string, props: ActualizarPeriodoProps): Promise<PeriodoEvaluacion> {
    const raw = await this.prisma.periodoEvaluacion.update({ where: { id }, data: props });
    return AcademicoMapper.periodoToDomain(raw);
  }

  async cambiarEstado(id: string, activo: boolean): Promise<PeriodoEvaluacion> {
    const raw = await this.prisma.periodoEvaluacion.update({ where: { id }, data: { activo } });
    return AcademicoMapper.periodoToDomain(raw);
  }
}
