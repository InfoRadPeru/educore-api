import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ForbiddenError } from '@shared/domain/result';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
} from '../../domain/repositories/comunicado.repository';

@Injectable()
export class EliminarComunicadoUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
  ) {}

  async execute(
    id: string,
    colegioId: string,
  ): Promise<Result<void, NotFoundError | ForbiddenError>> {
    const comunicado = await this.repo.buscarPorId(id);
    if (!comunicado) return fail(new NotFoundError('Comunicado', id));
    if (comunicado.colegioId !== colegioId) return fail(new NotFoundError('Comunicado', id));
    if (!comunicado.esBorrador()) {
      return fail(new ForbiddenError('Solo se pueden eliminar comunicados en estado BORRADOR'));
    }

    await this.repo.eliminar(id);
    return ok(undefined);
  }
}
