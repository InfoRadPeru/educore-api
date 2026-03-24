import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError } from '@shared/domain/result';
import {
  PUBLICACION_BOLETIN_REPOSITORY,
  type PublicacionBoletinRepository,
} from '../../domain/repositories/publicacion-boletin.repository';

@Injectable()
export class DespublicarBoletinUseCase {
  constructor(
    @Inject(PUBLICACION_BOLETIN_REPOSITORY)
    private readonly repo: PublicacionBoletinRepository,
  ) {}

  async execute(
    periodoId: string,
    seccionId: string,
  ): Promise<Result<void, NotFoundError>> {
    const existente = await this.repo.buscarPorPeriodoYSeccion(periodoId, seccionId);
    if (!existente) {
      return fail(new NotFoundError('PublicacionBoletin', `${periodoId}+${seccionId}`));
    }

    await this.repo.eliminar(periodoId, seccionId);
    return ok(undefined);
  }
}
