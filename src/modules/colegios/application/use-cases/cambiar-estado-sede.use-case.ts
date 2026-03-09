// Qué es: Caso de uso — activa o desactiva una sede.

import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import { SedeResponseDto } from '../dtos/sede-response.dto';
import { SEDE_REPOSITORY, type SedeRepository } from '@modules/colegios/domain/repositories/sede.repository';

@Injectable()
export class CambiarEstadoSedeUseCase {
  constructor(
    @Inject(SEDE_REPOSITORY)
    private readonly sedeRepository: SedeRepository,
  ) {}

  async execute(colegioId: string, sedeId: string, activo: boolean): Promise<Result<SedeResponseDto>> {
    const sede = await this.sedeRepository.buscarPorId(sedeId, colegioId);
    if (!sede) return fail(new NotFoundError('Sede', sedeId));
    const actualizada = await this.sedeRepository.cambiarEstado(sedeId, activo);
    return ok({
      id: actualizada.id, colegioId: actualizada.colegioId, nombre: actualizada.nombre,
      direccion: actualizada.direccion, telefono: actualizada.telefono, email: actualizada.email,
      activo: actualizada.activo, createdAt: actualizada.createdAt, updatedAt: actualizada.updatedAt,
    });
  }
}