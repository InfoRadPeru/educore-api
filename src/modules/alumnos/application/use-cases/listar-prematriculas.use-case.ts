import { Inject, Injectable } from '@nestjs/common';
import { ok, Result } from '@shared/domain/result';
import { PREMATRICULA_REPOSITORY, type PrematriculaRepository } from '../../domain/repositories/prematricula.repository';
import type { EstadoPrematricula } from '../../domain/entities/prematricula.entity';
import { PrematriculaResponseDto } from '../dtos/prematricula-response.dto';
import { toDto } from './crear-prematricula.use-case';

@Injectable()
export class ListarPrematriculasUseCase {
  constructor(
    @Inject(PREMATRICULA_REPOSITORY)
    private readonly prematriculaRepository: PrematriculaRepository,
  ) {}

  async execute(colegioId: string, estado?: EstadoPrematricula): Promise<Result<PrematriculaResponseDto[]>> {
    const lista = await this.prematriculaRepository.listarPorColegio(colegioId, estado);
    return ok(lista.map(toDto));
  }
}
