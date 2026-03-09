// Qué es: Caso de uso — edita datos de una sede.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { COLEGIO_REPOSITORY, type ColegioRepository } from '../../domain/repositories/colegio.repository';
import { ActualizarSedeDto } from '../dtos/actualizar-sede.dto';
import { SedeResponseDto } from '../dtos/sede-response.dto';
import { SEDE_REPOSITORY, type SedeRepository } from '@modules/colegios/domain/repositories/sede.repository';

@Injectable()
export class ActualizarSedeUseCase {
  constructor(
    @Inject(SEDE_REPOSITORY)
    private readonly sedeRepository: SedeRepository,
  ) {}

  async execute(colegioId: string, sedeId: string, dto: ActualizarSedeDto): Promise<Result<SedeResponseDto>> {
    const sede = await this.sedeRepository.buscarPorId(sedeId, colegioId);
    if (!sede) return fail(new NotFoundError('Sede', sedeId));
    const actualizada = await this.sedeRepository.actualizar(sedeId, dto);
    return ok({
      id: actualizada.id, colegioId: actualizada.colegioId, nombre: actualizada.nombre,
      direccion: actualizada.direccion, telefono: actualizada.telefono, email: actualizada.email,
      activo: actualizada.activo, createdAt: actualizada.createdAt, updatedAt: actualizada.updatedAt,
    });
  }
}