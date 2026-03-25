import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, ConflictError } from '@shared/domain/result';
import {
  PERIODO_EVALUACION_REPOSITORY,
  type PeriodoEvaluacionRepository,
  type CrearPeriodoProps,
} from '../../domain/repositories/periodo-evaluacion.repository';
import { PeriodoEvaluacion } from '../../domain/entities/periodo-evaluacion.entity';

@Injectable()
export class CrearPeriodoUseCase {
  constructor(
    @Inject(PERIODO_EVALUACION_REPOSITORY)
    private readonly repo: PeriodoEvaluacionRepository,
  ) {}

  async execute(props: CrearPeriodoProps): Promise<Result<PeriodoEvaluacion, ConflictError>> {
    const existe = await this.repo.buscarPorNumeroYAño(props.colegioId, props.añoAcademico, props.numero);
    if (existe) return fail(new ConflictError(`Ya existe el periodo número ${props.numero} para el año ${props.añoAcademico}`));

    const periodo = await this.repo.crear(props);
    return ok(periodo);
  }
}
