// Qué es: Caso de uso — lista las sedes del colegio.

import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { SedeResponseDto } from '../dtos/sede-response.dto';

@Injectable()
export class ListarSedesUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<SedeResponseDto[]>> {
    const sedes = await this.colegioRepository.findSedes(colegioId);
    return ok(sedes.map(s => ({
      id:        s.id,
      colegioId: s.colegioId,
      nombre:    s.nombre,
      direccion: s.direccion,
      telefono:  s.telefono,
      email:     s.email,
      activo:    s.activo,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })));
  }
}