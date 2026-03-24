import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  CategoriaEvaluacionRepository,
  CrearCategoriaProps,
  ActualizarCategoriaProps,
} from '../../domain/repositories/categoria-evaluacion.repository';
import { CategoriaEvaluacion } from '../../domain/entities/categoria-evaluacion.entity';
import { AcademicoMapper } from './academico.mapper';

@Injectable()
export class PrismaCategoriaEvaluacionRepository implements CategoriaEvaluacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async crear(props: CrearCategoriaProps): Promise<CategoriaEvaluacion> {
    const raw = await this.prisma.categoriaEvaluacion.create({ data: props });
    return AcademicoMapper.categoriaToDomain(raw);
  }

  async buscarPorId(id: string): Promise<CategoriaEvaluacion | null> {
    const raw = await this.prisma.categoriaEvaluacion.findUnique({ where: { id } });
    return raw ? AcademicoMapper.categoriaToDomain(raw) : null;
  }

  async listarPorAsignacion(docenteAsignacionId: string, soloActivas = false): Promise<CategoriaEvaluacion[]> {
    const rows = await this.prisma.categoriaEvaluacion.findMany({
      where:   { docenteAsignacionId, ...(soloActivas ? { activo: true } : {}) },
      orderBy: { orden: 'asc' },
    });
    return rows.map(AcademicoMapper.categoriaToDomain);
  }

  async buscarPorNombreEnAsignacion(docenteAsignacionId: string, nombre: string): Promise<CategoriaEvaluacion | null> {
    const raw = await this.prisma.categoriaEvaluacion.findUnique({
      where: { docenteAsignacionId_nombre: { docenteAsignacionId, nombre } },
    });
    return raw ? AcademicoMapper.categoriaToDomain(raw) : null;
  }

  async sumaPesosPorAsignacion(docenteAsignacionId: string, excluirId?: string): Promise<number> {
    const result = await this.prisma.categoriaEvaluacion.aggregate({
      _sum:  { peso: true },
      where: {
        docenteAsignacionId,
        activo: true,
        ...(excluirId ? { id: { not: excluirId } } : {}),
      },
    });
    return result._sum.peso ?? 0;
  }

  async tieneActividades(id: string): Promise<boolean> {
    const count = await this.prisma.actividad.count({ where: { categoriaId: id, activo: true } });
    return count > 0;
  }

  async actualizar(id: string, props: ActualizarCategoriaProps): Promise<CategoriaEvaluacion> {
    const raw = await this.prisma.categoriaEvaluacion.update({ where: { id }, data: props });
    return AcademicoMapper.categoriaToDomain(raw);
  }

  async desactivar(id: string): Promise<void> {
    await this.prisma.categoriaEvaluacion.update({ where: { id }, data: { activo: false } });
  }
}
