import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ForbiddenError } from '@shared/domain/result';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
} from '../../domain/repositories/comunicado.repository';
import { Comunicado } from '../../domain/entities/comunicado.entity';

@Injectable()
export class ArchivarComunicadoUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
  ) {}

  async execute(
    id: string,
    colegioId: string,
  ): Promise<Result<Comunicado, NotFoundError | ForbiddenError>> {
    const comunicado = await this.repo.buscarPorId(id);
    if (!comunicado) return fail(new NotFoundError('Comunicado', id));
    if (comunicado.colegioId !== colegioId) return fail(new NotFoundError('Comunicado', id));
    if (!comunicado.estaPublicado()) {
      return fail(new ForbiddenError('Solo se pueden archivar comunicados en estado PUBLICADO'));
    }

    const archivado = await this.repo.cambiarEstado(id, 'ARCHIVADO');
    return ok(archivado);
  }
}
