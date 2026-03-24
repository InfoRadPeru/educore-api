import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import {
  PERIODO_EVALUACION_REPOSITORY,
  type PeriodoEvaluacionRepository,
} from '../../domain/repositories/periodo-evaluacion.repository';
import { PeriodoEvaluacion } from '../../domain/entities/periodo-evaluacion.entity';

@Injectable()
export class ListarPeriodosUseCase {
  constructor(
    @Inject(PERIODO_EVALUACION_REPOSITORY)
    private readonly repo: PeriodoEvaluacionRepository,
  ) {}

  async execute(colegioId: string, año?: number): Promise<Result<PeriodoEvaluacion[], never>> {
    return ok(await this.repo.listarPorColegio(colegioId, año));
  }
}
