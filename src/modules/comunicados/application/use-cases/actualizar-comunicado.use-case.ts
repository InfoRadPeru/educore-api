import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ForbiddenError } from '@shared/domain/result';
import {
  COMUNICADO_REPOSITORY,
  type ComunicadoRepository,
  type ActualizarComunicadoProps,
} from '../../domain/repositories/comunicado.repository';
import { Comunicado } from '../../domain/entities/comunicado.entity';

@Injectable()
export class ActualizarComunicadoUseCase {
  constructor(
    @Inject(COMUNICADO_REPOSITORY)
    private readonly repo: ComunicadoRepository,
  ) {}

  async execute(
    id: string,
    colegioId: string,
    props: ActualizarComunicadoProps,
  ): Promise<Result<Comunicado, NotFoundError | ForbiddenError>> {
    const comunicado = await this.repo.buscarPorId(id);
    if (!comunicado) return fail(new NotFoundError('Comunicado', id));
    if (comunicado.colegioId !== colegioId) return fail(new NotFoundError('Comunicado', id));
    if (!comunicado.esBorrador()) {
      return fail(new ForbiddenError('Solo se pueden editar comunicados en estado BORRADOR'));
    }

    const actualizado = await this.repo.actualizar(id, props);
    return ok(actualizado);
  }
}
