// Qué es: Caso de uso — PLATFORM_ADMIN cambia el plan de un colegio.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ColegioResponseDto } from '../dtos/colegio-response.dto';
import type { PlanColegio } from 'src/generated/prisma/enums';

@Injectable()
export class CambiarPlanUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, plan: PlanColegio): Promise<Result<ColegioResponseDto>> {
    const colegio = await this.colegioRepository.buscarPorId(colegioId);
    if (!colegio) return fail(new NotFoundError('Colegio', colegioId));
    const actualizado = await this.colegioRepository.cambiarPlan(colegioId, plan);
    return ok({
      id: actualizado.id, nombre: actualizado.nombre, ruc: actualizado.ruc,
      direccion: actualizado.direccion, telefono: actualizado.telefono,
      email: actualizado.email, estado: actualizado.estado, plan: actualizado.plan,
      planVenceEn: actualizado.planVenceEn, createdAt: actualizado.createdAt, updatedAt: actualizado.updatedAt,
    });
  }
}