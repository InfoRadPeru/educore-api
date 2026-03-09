// Qué es: Caso de uso — edita datos del colegio (sin nombre ni RUC).
// Principio SOLID: Single Responsibility + Dependency Inversion.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ActualizarColegioDto } from '../dtos/actualizar-colegio.dto';
import { ColegioResponseDto } from '../dtos/colegio-response.dto';

@Injectable()
export class ActualizarMiColegioUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, dto: ActualizarColegioDto): Promise<Result<ColegioResponseDto>> {
    const colegio = await this.colegioRepository.findById(colegioId);
    if (!colegio) return fail(new NotFoundError('Colegio', colegioId));

    const actualizado = await this.colegioRepository.actualizar(colegioId, dto);

    return ok({
      id:          actualizado.id,
      nombre:      actualizado.nombre,
      ruc:         actualizado.ruc,
      direccion:   actualizado.direccion,
      telefono:    actualizado.telefono,
      email:       actualizado.email,
      estado:      actualizado.estado,
      plan:        actualizado.plan,
      planVenceEn: actualizado.planVenceEn,
      createdAt:   actualizado.createdAt,
      updatedAt:   actualizado.updatedAt,
    });
  }
}