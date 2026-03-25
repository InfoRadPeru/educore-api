import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  PERIODO_EVALUACION_REPOSITORY,
  type PeriodoEvaluacionRepository,
  type ActualizarPeriodoProps,
} from '../../domain/repositories/periodo-evaluacion.repository';
import { PeriodoEvaluacion } from '../../domain/entities/periodo-evaluacion.entity';

@Injectable()
export class ActualizarPeriodoUseCase {
  constructor(
    @Inject(PERIODO_EVALUACION_REPOSITORY)
    private readonly repo: PeriodoEvaluacionRepository,
  ) {}

  async execute(
    colegioId: string,
    id: string,
    props: ActualizarPeriodoProps,
  ): Promise<Result<PeriodoEvaluacion, NotFoundError>> {
    const periodo = await this.repo.buscarPorId(id);
    if (!periodo || periodo.colegioId !== colegioId) return fail(new NotFoundError('PeriodoEvaluacion', id));

    const actualizado = await this.repo.actualizar(id, props);
    return ok(actualizado);
  }
}
