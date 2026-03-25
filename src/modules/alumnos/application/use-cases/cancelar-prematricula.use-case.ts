import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import { PREMATRICULA_REPOSITORY, type PrematriculaRepository } from '../../domain/repositories/prematricula.repository';
import { PrematriculaResponseDto } from '../dtos/prematricula-response.dto';
import { toDto } from './crear-prematricula.use-case';

@Injectable()
export class CancelarPrematriculaUseCase {
  constructor(
    @Inject(PREMATRICULA_REPOSITORY)
    private readonly prematriculaRepository: PrematriculaRepository,
  ) {}

  async execute(colegioId: string, prematriculaId: string, observaciones?: string): Promise<Result<PrematriculaResponseDto>> {
    const prematricula = await this.prematriculaRepository.buscarPorId(prematriculaId);
    if (!prematricula || prematricula.colegioId !== colegioId) return fail(new NotFoundError('Prematricula', prematriculaId));
    if (!prematricula.esPendiente()) return fail(new ConflictError('Solo se pueden cancelar prematriculas en estado PENDIENTE'));

    prematricula.cancelar(observaciones);

    const actualizada = await this.prematriculaRepository.actualizar(prematriculaId, {
      estado:        prematricula.estado,
      observaciones: prematricula.observaciones,
    });

    return ok(toDto(actualizada));
  }
}
