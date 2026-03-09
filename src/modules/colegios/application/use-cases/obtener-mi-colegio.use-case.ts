// Qué es: Caso de uso — obtiene los datos del colegio del usuario autenticado.
// Patrón: Use Case + Result Pattern.
// Principio SOLID: Single Responsibility — solo obtiene el colegio. Dependency Inversion — depende de la interfaz.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { ColegioResponseDto } from '../dtos/colegio-response.dto';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';

@Injectable()
export class ObtenerMiColegioUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<ColegioResponseDto>> {
    const colegio = await this.colegioRepository.buscarPorId(colegioId);
    if (!colegio) return fail(new NotFoundError('Colegio', colegioId));

    return ok({
      id:          colegio.id,
      nombre:      colegio.nombre,
      ruc:         colegio.ruc,
      direccion:   colegio.direccion, 
      telefono:    colegio.telefono,
      email:       colegio.email,
      estado:      colegio.estado,
      plan:        colegio.plan,
      planVenceEn: colegio.planVenceEn,
      createdAt:   colegio.createdAt,
      updatedAt:   colegio.updatedAt,
    });
  }
}