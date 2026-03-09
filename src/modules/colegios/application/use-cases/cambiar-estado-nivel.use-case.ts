// Qué es: Caso de uso — activa o desactiva un nivel en el colegio.
// Si el nivel no existe aún en colegio_niveles, lo crea (activación por primera vez).

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { NivelResponseDto } from '../dtos/nivel-response.dto';
import { NIVEL_REPOSITORY, type NivelRepository } from '@modules/colegios/domain/repositories/nivel.repository';

@Injectable()
export class CambiarEstadoNivelUseCase {
  constructor(
    @Inject(NIVEL_REPOSITORY)
    private readonly nivelRepository: NivelRepository,
  ) {}

  async execute(colegioId: string, nivelMaestroId: string, activo: boolean): Promise<Result<NivelResponseDto>> {
    const nivel = await this.nivelRepository.buscarPorNivelMaestro(nivelMaestroId, colegioId);
    let resultado;
    if (!nivel) {
      if (!activo) return fail(new NotFoundError('Nivel', nivelMaestroId));
      resultado = await this.nivelRepository.activar(colegioId, nivelMaestroId);
    } else {
      resultado = await this.nivelRepository.cambiarEstado(nivel.id, activo);
    }
    return ok({
      id: resultado.id, nivelMaestroId: resultado.nivelMaestroId, nombre: resultado.nombre,
      orden: resultado.orden, activo: resultado.activo, turnos: resultado.turnos,
    });
  }
}