// Qué es: Caso de uso — lista los niveles del colegio con su estado de activación.

import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { NivelResponseDto } from '../dtos/nivel-response.dto';
import { NIVEL_REPOSITORY, type NivelRepository } from '@modules/colegios/domain/repositories/nivel.repository';

@Injectable()
export class ListarNivelesUseCase {
  constructor(
    @Inject(NIVEL_REPOSITORY)
    private readonly nivelRepository: NivelRepository,
  ) {}

  async execute(colegioId: string): Promise<Result<NivelResponseDto[]>> {
    const niveles = await this.nivelRepository.buscarTodos(colegioId);

    return ok(niveles.map(n => {
      if (n.tipo === 'disponible') {
        return {
          tipo:           'disponible' as const,
          nivelMaestroId: n.nivelMaestroId,
          nombre:         n.nombre,
          orden:          n.orden,
        };
      }
      return {
        tipo:           'activado' as const,
        id:             n.id,
        nivelMaestroId: n.nivelMaestroId,
        nombre:         n.nombre,
        orden:          n.orden,
        activo:         n.activo,
        turnos:         n.turnos,
      };
    }));
  }
}