// Qué es: Caso de uso — PLATFORM_ADMIN suspende o activa un colegio.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ColegioResponseDto } from '../dtos/colegio-response.dto';

@Injectable()
export class CambiarEstadoColegioUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, estado: string): Promise<Result<ColegioResponseDto>> {
    const colegio = await this.colegioRepository.findById(colegioId);
    if (!colegio) return fail(new NotFoundError('Colegio', colegioId));

    const actualizado = await this.colegioRepository.cambiarEstado(colegioId, estado);

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