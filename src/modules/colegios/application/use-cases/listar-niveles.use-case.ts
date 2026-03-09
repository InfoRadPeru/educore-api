// Qué es: Caso de uso — lista los niveles del colegio con su estado de activación.

import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { NivelResponseDto } from '../dtos/nivel-response.dto';

@Injectable()
export class ListarNivelesUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<NivelResponseDto[]>> {
    const niveles = await this.colegioRepository.findNiveles(colegioId);
    return ok(niveles.map(n => ({
      id:             n.id,
      nivelMaestroId: n.nivelMaestroId,
      nombre:         n.nombre,
      orden:          n.orden,
      activo:         n.activo,
      turnos:         n.turnos,
    })));
  }
}