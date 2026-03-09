// Qué es: Caso de uso — lista las sedes del colegio.

import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { SedeResponseDto } from '../dtos/sede-response.dto';

import { SEDE_REPOSITORY, type SedeRepository } from '../../domain/repositories/sede.repository';

@Injectable()
export class ListarSedesUseCase {
  constructor(
    @Inject(SEDE_REPOSITORY)
    private readonly sedeRepository: SedeRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<SedeResponseDto[]>> {
    const sedes = await this.sedeRepository.buscarPorColegio(colegioId);
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