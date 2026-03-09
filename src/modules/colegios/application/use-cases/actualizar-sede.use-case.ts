// Qué es: Caso de uso — edita datos de una sede.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ActualizarSedeDto } from '../dtos/actualizar-sede.dto';
import { SedeResponseDto } from '../dtos/sede-response.dto';

@Injectable()
export class ActualizarSedeUseCase {
  constructor(
    @Inject(COLEGIO_REPOSITORY)
    private readonly colegioRepository: ColegioRepository,
  ) {}

  async execute(colegioId: string, sedeId: string, dto: ActualizarSedeDto): Promise<Result<SedeResponseDto>> {
    const sede = await this.colegioRepository.findSedeById(sedeId, colegioId);
    if (!sede) return fail(new NotFoundError('Sede', sedeId));

    const actualizada = await this.colegioRepository.actualizarSede(sedeId, dto);

    return ok({
      id:        actualizada.id,
      colegioId: actualizada.colegioId,
      nombre:    actualizada.nombre,
      direccion: actualizada.direccion,
      telefono:  actualizada.telefono,
      email:     actualizada.email,
      activo:    actualizada.activo,
      createdAt: actualizada.createdAt,
      updatedAt: actualizada.updatedAt,
    });
  }
}