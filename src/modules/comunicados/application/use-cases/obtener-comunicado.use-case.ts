import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
} from '../../domain/repositories/comunicado.repository';
import { Comunicado } from '../../domain/entities/comunicado.entity';

@Injectable()
export class ObtenerComunicadoUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
  ) {}

  async execute(
    id: string,
    colegioId: string,
  ): Promise<Result<Comunicado, NotFoundError>> {
    const comunicado = await this.repo.buscarPorId(id);
    if (!comunicado || comunicado.colegioId !== colegioId) {
      return fail(new NotFoundError('Comunicado', id));
    }
    return ok(comunicado);
  }
}
