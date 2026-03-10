// Qué es: Caso de uso — activa o desactiva un nivel en el colegio.
// Si el nivel no existe aún en colegio_niveles, lo crea (activación por primera vez).

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { NivelResponseDto } from '../dtos/nivel-response.dto';
import { NIVEL_REPOSITORY, type NivelRepository } from '@modules/colegios/domain/repositories/nivel.repository';
import type { NivelActivado } from '@modules/colegios/domain/entities/nivel.entity';

@Injectable()
export class CambiarEstadoNivelUseCase {
  constructor(
    @Inject(NIVEL_REPOSITORY)
    private readonly nivelRepository: NivelRepository,
  ) {}

  async execute(colegioId: string, nivelMaestroId: string, activo: boolean): Promise<Result<NivelResponseDto>> {
    const nivel = await this.nivelRepository.buscarPorNivelMaestro(nivelMaestroId, colegioId);

    let resultado: NivelActivado;
    if (!nivel) {
      if (!activo) return fail(new NotFoundError('Nivel', nivelMaestroId));
      resultado = await this.nivelRepository.activar(colegioId, nivelMaestroId) as NivelActivado;
    } else {
      resultado = await this.nivelRepository.cambiarEstado(nivel.nivelMaestroId, activo) as NivelActivado;
    }

    return ok({
      tipo:           'activado',
      id:             resultado.id,
      nivelMaestroId: resultado.nivelMaestroId,
      nombre:         resultado.nombre,
      orden:          resultado.orden,
      activo:         resultado.activo,
      turnos:         resultado.turnos,
    });
  }
}