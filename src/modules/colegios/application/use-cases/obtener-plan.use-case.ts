// Qué es: Caso de uso — retorna el plan actual con límites y uso real.

import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { PlanResponseDto } from '../dtos/plan-response.dto';

@Injectable()
export class ObtenerPlanUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<PlanResponseDto>> {
    const info = await this.colegioRepository.findPlanInfo(colegioId);
    return ok(info);
  }
}