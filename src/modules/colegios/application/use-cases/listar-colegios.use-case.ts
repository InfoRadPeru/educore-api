// Qué es: Caso de uso — PLATFORM_ADMIN lista todos los colegios.

import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ColegioResponseDto } from '../dtos/colegio-response.dto';

@Injectable()
export class ListarColegiosUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(): Promise<Result<ColegioResponseDto[]>> {
    const colegios = await this.colegioRepository.findAll();
    return ok(colegios.map(c => ({
      id:          c.id,
      nombre:      c.nombre,
      ruc:         c.ruc,
      direccion:   c.direccion,
      telefono:    c.telefono,
      email:       c.email,
      estado:      c.estado,
      plan:        c.plan,
      planVenceEn: c.planVenceEn,
      createdAt:   c.createdAt,
      updatedAt:   c.updatedAt,
    })));
  }
}