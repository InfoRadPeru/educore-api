import { Inject, Injectable } from '@nestjs/common';
import { ok, fail, Result, NotFoundError, ConflictError } from '@shared/domain/result';
import {
  ASIGNATURA_MAESTRA_REPOSITORY,
  type AsignaturaMaestraRepository,
} from '../../domain/repositories/asignatura-maestra.repository';
import { AsignaturaMaestra } from '../../domain/entities/asignatura.entity';

@Injectable()
export class CambiarEstadoAsignaturaMaestraUseCase {
  constructor(
    @Inject(ASIGNATURA_MAESTRA_REPOSITORY)
    private readonly repo: AsignaturaMaestraRepository,
  ) {}

  async execute(
    id: string,
    activo: boolean,
  ): Promise<Result<AsignaturaMaestra, NotFoundError | ConflictError>> {
    const asignatura = await this.repo.buscarPorId(id);
    if (!asignatura) return fail(new NotFoundError('AsignaturaMaestra', id));
    if (asignatura.activo === activo)
      return fail(new ConflictError(`La asignatura ya está ${activo ? 'activa' : 'inactiva'}`));

    const actualizada = await this.repo.cambiarEstado(id, activo);
    return ok(actualizada);
  }
}
