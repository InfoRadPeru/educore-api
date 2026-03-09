// Qué es: Caso de uso — activa o desactiva un nivel en el colegio.
// Si el nivel no existe aún en colegio_niveles, lo crea (activación por primera vez).

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { NivelResponseDto } from '../dtos/nivel-response.dto';

@Injectable()
export class CambiarEstadoNivelUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, nivelMaestroId: string, activo: boolean): Promise<Result<NivelResponseDto>> {
    // Busca si ya existe el registro en colegio_niveles
    const nivel = await this.colegioRepository.findNivelById(nivelMaestroId, colegioId);

    let resultado;
    if (!nivel) {
      // Primera vez que se activa — crear el registro
      if (!activo) return fail(new NotFoundError('Nivel', nivelMaestroId));
      resultado = await this.colegioRepository.activarNivel(colegioId, nivelMaestroId);
    } else {
      resultado = await this.colegioRepository.cambiarEstadoNivel(nivel.id, activo);
    }

    return ok({
      id:             resultado.id,
      nivelMaestroId: resultado.nivelMaestroId,
      nombre:         resultado.nombre,
      orden:          resultado.orden,
      activo:         resultado.activo,
      turnos:         resultado.turnos,
    });
  }
}