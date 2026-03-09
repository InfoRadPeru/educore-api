// Qué es: Caso de uso — retorna el plan actual con límites y uso real.

import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError, ok, Result } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { SEDE_REPOSITORY, type SedeRepository } from '@modules/colegios/domain/repositories/sede.repository';

export interface PlanResponseDto {
  plan:                     string;
  planVenceEn:              Date | null;
  limitesSedes:             number;
  sedesActivas:             number;
  limitesSeccionesPorGrado: number | null;
  planSugerido:             string | null;
}

@Injectable()
export class ObtenerPlanUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
    @Inject(SEDE_REPOSITORY)
    private readonly sedeRepository: SedeRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<PlanResponseDto>> {
    const colegio = await this.colegioRepository.buscarPorId(colegioId);
    if (!colegio) return fail(new NotFoundError('Colegio', colegioId));

    const sedesActivas = await this.sedeRepository.contarActivas(colegioId);

    return ok({
      plan:                     colegio.plan,
      planVenceEn:              colegio.planVenceEn,
      limitesSedes:             colegio.limitesSedes(),
      sedesActivas,
      limitesSeccionesPorGrado: colegio.limitesSeccionesPorGrado(),
      planSugerido:             colegio.planSugerido(),
    });
  }
}