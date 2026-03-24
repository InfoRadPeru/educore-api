import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  PERIODO_EVALUACION_REPOSITORY,
  type PeriodoEvaluacionRepository,
} from '../../domain/repositories/periodo-evaluacion.repository';
import { PeriodoEvaluacion } from '../../domain/entities/periodo-evaluacion.entity';

@Injectable()
export class CambiarEstadoPeriodoUseCase {
  constructor(
    @Inject(PERIODO_EVALUACION_REPOSITORY)
    private readonly repo: PeriodoEvaluacionRepository,
  ) {}

  async execute(
    colegioId: string,
    id: string,
    activo: boolean,
  ): Promise<Result<PeriodoEvaluacion, NotFoundError | ConflictError>> {
    const periodo = await this.repo.buscarPorId(id);
    if (!periodo || periodo.colegioId !== colegioId) return fail(new NotFoundError('PeriodoEvaluacion', id));
    if (periodo.activo === activo)
      return fail(new ConflictError(`El periodo ya está ${activo ? 'activo' : 'inactivo'}`));

    const actualizado = await this.repo.cambiarEstado(id, activo);
    return ok(actualizado);
  }
}
